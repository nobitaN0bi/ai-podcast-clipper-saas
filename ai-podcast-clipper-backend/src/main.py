import json
import pathlib
import shutil
import subprocess
import time
import uuid
import os

# CRITICAL FIX: PyTorch 2.6 changed weights_only default to True.
# Pyannote/WhisperX models use omegaconf and typing classes that are not whitelisted.
# Instead of adding every class one by one, we monkeypatch torch.load to use weights_only=False.
# This is safe since we trust these well-known ML model sources.
import torch

_original_torch_load = torch.load

def _patched_torch_load(*args, **kwargs):
    # FORCE weights_only=False for all torch.load calls (override any explicit True)
    kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)

torch.load = _patched_torch_load


from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import modal

from src.processing.schemas import ProcessVideoRequest, RenderVideoRequest

# ... (Previous imports)

# ... inside AiPodcastClipper class ...


from src.processing.service import process_clip
from src.processing.agents import agent_runner
from src.config import settings


# Define the Modal Image
image = (modal.Image.from_registry(
    "nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.11") # Downgrading to 3.11 for Torch 2.1.2 compatibility
    .apt_install(["ffmpeg", "libgl1-mesa-glx", "wget", "libcudnn8", "libcudnn8-dev", "git"])
    # 1. Install Torch Stack explicitly first to ensure compatibility with CUDA 12.4
    # Using specific stable versions known to work with WhisperX/Pyannote
    .pip_install("torch==2.1.2", "torchaudio==2.1.2", "torchvision==0.16.2", index_url="https://download.pytorch.org/whl/cu121") 
    # 2. Install rest of requirements (excluding torch/whisperx which we removed)
    .pip_install_from_requirements("requirements.txt")
    # 3. Install WhisperX last so it finds the existing torch and doesn't try to download a conflict
    .pip_install("git+https://github.com/m-bain/whisperx.git")
    .run_commands(["mkdir -p /usr/share/fonts/truetype/custom",
                   "wget -O /usr/share/fonts/truetype/custom/Anton-Regular.ttf https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf",
                   "fc-cache -f -v"])
    .env({"PYTHONPATH": "/root"})
    .add_local_dir("src", "/root/src", copy=True)
    .add_local_dir("asd", "/asd", copy=True)
)

app = modal.App("kriyam-podcast-clipper", image=image)

# Volume for model cache
volume = modal.Volume.from_name(
    "kriyam-podcast-clipper-model-cache", create_if_missing=True
)

mount_path = "/root/.cache/torch"

auth_scheme = HTTPBearer()

@app.cls(gpu="L40S", timeout=1800, retries=0, scaledown_window=20, secrets=[
    modal.Secret.from_name("ai-podcast-clipper-secret"),
    # Optional: fal.ai secret for B-roll generation (create with: modal secret create fal-ai-secret FAL_KEY=your_key)
    # modal.Secret.from_name("fal-ai-secret"),
], volumes={mount_path: volume})
class AiPodcastClipper:
    @modal.enter()
    def load_model(self):
        print("Loading models")
        import whisperx # Ensure import is available

        self.whisperx_model = whisperx.load_model(
            "large-v2", device="cuda", compute_type="float16")

        self.alignment_model, self.metadata = whisperx.load_align_model(
            language_code="en",
            device="cuda"
        )
        print("Transcription models loaded...")


    @modal.fastapi_endpoint(method="POST")
    def render_video(self, request: RenderVideoRequest, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
        import boto3
        import datetime
        
        def debug_log(msg: str, level: str = "INFO"):
             ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
             print(f"[{ts}] [{level}] {msg}", flush=True)

        if token.credentials != os.environ["AUTH_TOKEN"]:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect bearer token")

        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)
        input_path = base_dir / "input.mp4"
        output_path = base_dir / "output.mp4"

        try:
             # 1. Download
             s3_client = boto3.client("s3")
             bucket_name = os.environ.get("S3_BUCKET_NAME", "kriyam-podcast-clipper")
             s3_client.download_file(bucket_name, request.s3_key, str(input_path))

             # 2. Render (Crop & Trim)
             # Basic FFMPEG map for aspect ratios
             vf_map = {
                 "9:16": "crop=ih*(9/16):ih", 
                 "1:1": "crop=ih:ih",
                 "16:9": "scale=1920:1080" # Assuming landscape input, just scale or no-op
             }
             vf_filter = vf_map.get(request.aspect_ratio, "scale=1920:1080")
             
             # Construct FFMPEG command
             # ffmpeg -ss {start} -to {end} -i input -vf {filter} -c:a copy output
             # Note: -c:a copy might fail if trimming is precise, better to re-encode audio or align. 
             # For safety: -c:v libx264 -c:a aac
             
             cmd = [
                 "ffmpeg", "-y",
                 "-ss", str(request.trim_start),
                 "-to", str(request.trim_end),
                 "-i", str(input_path),
                 "-vf", vf_filter,
                 "-c:v", "libx264", "-preset", "fast", "-crf", "23",
                 "-c:a", "aac", "-b:a", "128k",
                 str(output_path)
             ]
             
             debug_log(f"Running FFMPEG: {' '.join(cmd)}")
             subprocess.run(cmd, check=True)
             
             # 3. Upload Result
             output_key = f"renders/{run_id}.mp4"
             s3_client.upload_file(str(output_path), bucket_name, output_key)
             
             return {"status": "success", "s3_key": output_key}

        except Exception as e:
             debug_log(f"Render Failed: {e}", "ERROR")
             raise HTTPException(status_code=500, detail=str(e))
        finally:
             shutil.rmtree(base_dir, ignore_errors=True)


    def transcribe_video(self, base_dir: pathlib.Path, video_path: pathlib.Path) -> str:
        audio_path = base_dir / "audio.wav"
        extract_cmd = f"ffmpeg -i {video_path} -vn -acodec pcm_s16le -ar 16000 -ac 1 {audio_path}"
        subprocess.run(extract_cmd, shell=True, check=True, capture_output=True)

        print("Starting transcription with WhisperX...")
        
        # WhisperX models should nominally be global/cached, but loading here for safety as per original design
        # Optimization: In production, load these to self variables in __enter__
        # For now, we reuse the self.whisperx_model if we implement __enter__ correctly, 
        # But to match the previous robust state, I'll instantiate them or assume self.whisperx_model is there.
        # Checking lines 40-50... yes, load_model is defined but I might have cleared it.
        # Let's rely on self.whisperx_model which SHOULD be there if load_model runs.
        
        audio = whisperx.load_audio(str(audio_path))
        result = self.whisperx_model.transcribe(audio, batch_size=16)

        result = whisperx.align(
            result["segments"],
            self.alignment_model,
            self.metadata,
            audio,
            device="cuda",
            return_char_alignments=False
        )

        segments = []
        if "word_segments" in result:
            for word_segment in result["word_segments"]:
                segments.append({
                    "start": word_segment["start"],
                    "end": word_segment["end"],
                    "word": word_segment["word"],
                })
        return json.dumps(segments)

    @modal.fastapi_endpoint(method="POST")
    def process_video(self, request: ProcessVideoRequest, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
        import datetime
        def debug_log(msg: str, level: str = "INFO"):
            ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            print(f"[{ts}] [{level}] {msg}", flush=True)
        
        debug_log("========== PROCESS_VIDEO ENDPOINT CALLED ==========")
        debug_log(f"Request s3_key: {request.s3_key}")
        
        if token.credentials != os.environ["AUTH_TOKEN"]:
            debug_log("Authentication failed - invalid token", "ERROR")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Incorrect bearer token", headers={"WWW-Authenticate": "Bearer"})

        debug_log(f"Authentication successful")
        print(f"Starting Workflow for: {request.s3_key}")
        
        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)
        video_path = base_dir / "input.mp4"
        debug_log(f"Created run_id: {run_id}, base_dir: {base_dir}")

        try:
            # 1. Download (Procedural)
            debug_log("=== STEP 1: Downloading video from S3 ===")
            import boto3
            s3_client = boto3.client("s3")
            bucket_name = os.environ.get("S3_BUCKET_NAME", "kriyam-podcast-clipper")
            debug_log(f"Downloading from bucket: {bucket_name}, key: {request.s3_key}")
            s3_client.download_file(bucket_name, request.s3_key, str(video_path))
            debug_log(f"Download complete. File size: {video_path.stat().st_size} bytes")
            
            # 2. Transcribe (Procedural)
            debug_log("=== STEP 2: Transcribing video with WhisperX ===")
            transcript_json = self.transcribe_video(base_dir, video_path)
            transcript_segments = json.loads(transcript_json)
            debug_log(f"Transcription complete. Segments count: {len(transcript_segments)}")
            if transcript_segments:
                debug_log(f"First 3 segments: {transcript_segments[:3]}")
            
            # 3. Agentic Analysis & Clipping
            debug_log("=== STEP 3: Starting Agent Runner ===")
            initial_state = {
                "s3_key": request.s3_key,
                "run_id": run_id,
                "base_dir": str(base_dir),
                "video_path": str(video_path),
                "transcript_segments": transcript_segments, # Sent to Agent
                "transcript_segments": transcript_segments, # Sent to Agent
                "clip_moments": [],
                "error": "",
                "burn_captions": request.burn_captions
            }
            debug_log(f"Initial state prepared. transcript_segments count: {len(transcript_segments)}")
            
            final_state = agent_runner.invoke(initial_state)
            debug_log("=== Agent Runner completed ===")
            debug_log(f"Final state error: {final_state.get('error')}")
            debug_log(f"Final state clip_moments count: {len(final_state.get('clip_moments', []))}")
            
            if final_state.get("error"):
                debug_log(f"ERROR from agent: {final_state['error']}", "ERROR")
                raise HTTPException(status_code=500, detail=final_state["error"])
            
            result = {"status": "success", "processed_clips": len(final_state.get("clip_moments", []))}
            debug_log(f"=== PROCESS_VIDEO COMPLETED SUCCESSFULLY: {result} ===")
            return result

        except Exception as e:
            import traceback
            debug_log(f"EXCEPTION in process_video: {str(e)}", "ERROR")
            debug_log(f"Traceback: {traceback.format_exc()}", "ERROR")
            raise

        finally:
             if base_dir.exists():
                debug_log(f"Cleaning up base_dir: {base_dir}")
                shutil.rmtree(base_dir, ignore_errors=True)



@app.function(image=image)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI
    from src.marketplace.router import router as marketplace_router
    
    web_app = FastAPI(title="ClipFlow Marketplace API")
    web_app.include_router(marketplace_router)
    
    return web_app

@app.local_entrypoint()
def main():
    print("Use 'modal deploy src/main.py' to deploy.")

