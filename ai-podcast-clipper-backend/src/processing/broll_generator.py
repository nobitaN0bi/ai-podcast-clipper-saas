"""
B-Roll Generator - Consistent Generative Video Engine
=====================================================
Integrates fal.ai Hunyuan Video API for generating consistent intro/outro/B-roll
clips with anchor-frame continuity and visual identity locking.

Dependencies:
- fal-client (pip install fal-client)
- boto3 (for S3 anchor frame storage)
- cv2 (for frame extraction)
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
import hashlib
import os
import pathlib
import subprocess
import tempfile
import time
import traceback
from datetime import datetime


# --- Debug Helper ---
def debug_log(msg: str, level: str = "INFO"):
    """Centralized debug logging with timestamp"""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(f"[{ts}] [BROLL] [{level}] {msg}", flush=True)


def hash_to_int(*parts: str, mod: int = 2_147_483_647) -> int:
    """
    Deterministic hash function for seed derivation.
    Ensures reproducibility across runs with same inputs.
    """
    raw = "||".join(str(p) for p in parts).encode("utf-8")
    h = hashlib.sha256(raw).hexdigest()
    return int(h[:8], 16) % mod


def compute_cache_key(prompt: str, negative_prompt: str, seed: int, params: dict, image_url: Optional[str] = None) -> str:
    """
    Compute idempotent cache key for generation caching.
    """
    key_parts = [
        prompt,
        negative_prompt,
        str(seed),
        str(sorted(params.items())),
        image_url or ""
    ]
    return hashlib.sha256("||".join(key_parts).encode()).hexdigest()[:32]


@dataclass
class VisualIdentityLock:
    """
    Visual Identity Lock (VIL) - Ensures consistency across all generated clips.
    
    This is the core invariant tuple that MUST remain stable across all
    generations within a clip-set to maintain visual coherence.
    """
    style_identity: str
    brand_block: str
    character_refs: List[str]
    negative_prompt: str
    aspect_ratio: str = "9:16"  # Vertical for shorts
    resolution: str = "720p"   # 480p for preview, 720p for final
    num_frames: int = 129       # ~5 seconds at ~25fps
    num_inference_steps: int = 35
    pro_mode: bool = False
    
    # Default negative prompt for content safety
    DEFAULT_NEGATIVE_PROMPT: str = field(default=(
        "blurry, low quality, distorted, warping, flickering, jittering, "
        "text artifacts, watermark, extra limbs, melting, deformed faces, "
        "unreadable text, nsfw, violent, gore"
    ), repr=False)
    
    def __post_init__(self):
        if not self.negative_prompt:
            self.negative_prompt = self.DEFAULT_NEGATIVE_PROMPT
    
    @classmethod
    def default_for_podcast(cls) -> "VisualIdentityLock":
        """Factory for default podcast-style visual identity."""
        return cls(
            style_identity=(
                "Clean motion graphics, soft gradients, subtle film grain, "
                "high contrast typography aesthetic, premium studio lighting, "
                "modern minimalist design, professional broadcast quality."
            ),
            brand_block=(
                "Premium podcast brand aesthetic, cohesive color grading, "
                "professional media production quality."
            ),
            character_refs=[],
            negative_prompt=""
        )


class ConsistentVideoGenerator:
    """
    Main generator class for creating visually consistent video sequences.
    
    Implements:
    - Seed-locked deterministic generation
    - Anchor-frame continuation (image-to-video)
    - Visual Identity Lock enforcement
    - Prompt compilation with consistency blocks
    """
    
    def __init__(
        self,
        run_id: str,
        clip_id: str,
        master_seed: int,
        vil: VisualIdentityLock,
        s3_client: Optional[Any] = None,
        s3_bucket: Optional[str] = None
    ):
        self.run_id = run_id
        self.clip_id = clip_id
        self.master_seed = master_seed
        self.vil = vil
        self.s3_client = s3_client
        self.s3_bucket = s3_bucket
        self._generation_log: List[Dict] = []
    
    def compile_prompt(self, action_block: str, continuity_block: str) -> str:
        """
        Compile a full prompt with all consistency blocks.
        
        Structure:
        [STYLE] - Global visual lock
        [BRAND] - Brand identity
        [SUBJECT] - Character/object refs
        [SHOT] - Camera/motion guidance
        [ACTION] - Scene semantics
        [CONTINUITY] - Frame-to-frame coherence
        [OUTPUT] - Format specification
        """
        subject = ", ".join(self.vil.character_refs) if self.vil.character_refs else "abstract subject"
        shot = "Smooth camera movement, stable framing, minimal jitter, premium lighting, cinematic quality."
        
        prompt_parts = [
            f"[STYLE]\n{self.vil.style_identity}",
            f"[BRAND]\n{self.vil.brand_block}",
            f"[SUBJECT]\n{subject}",
            f"[SHOT]\n{shot}",
            f"[ACTION]\n{action_block}",
            f"[CONTINUITY]\n{continuity_block}",
            "[OUTPUT]\nVertical short-form video (9:16), cohesive color grading, clean details, professional quality."
        ]
        
        return "\n\n".join(prompt_parts)
    
    def _build_params(self, seed: int) -> Dict[str, Any]:
        """Build fal.ai API parameters with Visual Identity Lock."""
        return {
            "seed": seed,
            "aspect_ratio": self.vil.aspect_ratio,
            "resolution": self.vil.resolution,
            "num_frames": self.vil.num_frames,
            "num_inference_steps": self.vil.num_inference_steps,
            "pro_mode": self.vil.pro_mode,
            "enable_safety_checker": True,
            "enable_prompt_expansion": False,  # Keep prompts deterministic
        }
    
    def _call_fal_t2v(self, prompt: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call fal.ai Hunyuan Video text-to-video API.
        Returns response with video URL.
        """
        try:
            import fal_client as fal
        except ImportError:
            debug_log("fal-client not installed. Install with: pip install fal-client", "ERROR")
            raise ImportError("fal-client package required for video generation")
        
        debug_log(f"Calling fal.ai text-to-video with seed={params.get('seed')}")
        start_time = time.time()
        
        result = fal.subscribe(
            "fal-ai/hunyuan-video",
            arguments={
                "prompt": prompt,
                "negative_prompt": self.vil.negative_prompt,
                **params
            }
        )
        
        elapsed = time.time() - start_time
        debug_log(f"fal.ai t2v completed in {elapsed:.1f}s")
        
        return result
    
    def _call_fal_i2v(self, image_url: str, prompt: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call fal.ai Hunyuan Video image-to-video API.
        Uses anchor frame for continuation.
        """
        try:
            import fal_client as fal
        except ImportError:
            debug_log("fal-client not installed. Install with: pip install fal-client", "ERROR")
            raise ImportError("fal-client package required for video generation")
        
        debug_log(f"Calling fal.ai image-to-video with seed={params.get('seed')}")
        start_time = time.time()
        
        result = fal.subscribe(
            "fal-ai/hunyuan-video-image-to-video",
            arguments={
                "image_url": image_url,
                "prompt": prompt,
                "negative_prompt": self.vil.negative_prompt,
                "i2v_stability": True,  # Reduce hallucination
                **params
            }
        )
        
        elapsed = time.time() - start_time
        debug_log(f"fal.ai i2v completed in {elapsed:.1f}s")
        
        return result
    
    def gen_intro(self, hook_action: str) -> Dict[str, Any]:
        """
        Generate intro/hook scene using text-to-video.
        
        Returns:
            Dict with 'video' containing URL and metadata
        """
        debug_log(f"Generating intro for run={self.run_id}, clip={self.clip_id}")
        
        seed = self.master_seed
        prompt = self.compile_prompt(
            action_block=hook_action,
            continuity_block="Opening scene. Establish the visual theme for the entire sequence."
        )
        params = self._build_params(seed)
        
        result = self._call_fal_t2v(prompt, params)
        
        # Log generation
        self._generation_log.append({
            "type": "intro",
            "seed": seed,
            "prompt_preview": prompt[:200],
            "video_url": result.get("video", {}).get("url"),
            "timestamp": datetime.now().isoformat()
        })
        
        return result
    
    def gen_continuation(self, anchor_frame_url: str, action: str, segment_id: str) -> Dict[str, Any]:
        """
        Generate B-roll continuation from previous anchor frame.
        Uses image-to-video for visual consistency.
        
        Args:
            anchor_frame_url: Signed URL of last frame from previous clip
            action: Scene action description
            segment_id: Unique segment identifier for seed derivation
        """
        debug_log(f"Generating continuation segment={segment_id}")
        
        # Derive deterministic seed from master + identifiers
        seed = hash_to_int(str(self.master_seed), self.clip_id, segment_id, "broll")
        
        prompt = self.compile_prompt(
            action_block=action,
            continuity_block="Match the previous frame composition, palette, lighting, and subject identity exactly."
        )
        params = self._build_params(seed)
        
        result = self._call_fal_i2v(anchor_frame_url, prompt, params)
        
        self._generation_log.append({
            "type": "broll",
            "segment_id": segment_id,
            "seed": seed,
            "anchor_url": anchor_frame_url,
            "video_url": result.get("video", {}).get("url"),
            "timestamp": datetime.now().isoformat()
        })
        
        return result
    
    def gen_outro_loop(self, intro_first_frame_url: str, outro_action: str) -> Dict[str, Any]:
        """
        Generate outro that mirrors intro for seamless loop.
        
        Args:
            intro_first_frame_url: First frame of intro for loop closure
            outro_action: Outro scene description
        """
        debug_log(f"Generating loop-friendly outro")
        
        seed = hash_to_int(str(self.master_seed), self.clip_id, "outro")
        
        prompt = self.compile_prompt(
            action_block=outro_action,
            continuity_block="Return to the opening composition; end frame should match the intro first frame for seamless loop."
        )
        params = self._build_params(seed)
        
        result = self._call_fal_i2v(intro_first_frame_url, prompt, params)
        
        self._generation_log.append({
            "type": "outro",
            "seed": seed,
            "video_url": result.get("video", {}).get("url"),
            "timestamp": datetime.now().isoformat()
        })
        
        return result
    
    def get_generation_log(self) -> List[Dict]:
        """Return log of all generations for debugging/metrics."""
        return self._generation_log


# --- Frame Extraction Utilities ---

def extract_last_frame_ffmpeg(input_path: str, output_path: str) -> bool:
    """
    Extract the last frame from a video using ffmpeg.
    
    Args:
        input_path: Path to input video file
        output_path: Path for output JPEG frame
    
    Returns:
        True if successful, False otherwise
    """
    try:
        cmd = [
            "ffmpeg", "-y",
            "-sseof", "-0.1",  # Seek from end
            "-i", input_path,
            "-frames:v", "1",
            "-q:v", "2",
            output_path,
        ]
        subprocess.check_call(cmd, stderr=subprocess.DEVNULL)
        debug_log(f"Extracted last frame to {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        debug_log(f"Failed to extract last frame: {e}", "ERROR")
        return False


def extract_first_frame_ffmpeg(input_path: str, output_path: str) -> bool:
    """
    Extract the first frame from a video using ffmpeg.
    """
    try:
        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-frames:v", "1",
            "-q:v", "2",
            output_path,
        ]
        subprocess.check_call(cmd, stderr=subprocess.DEVNULL)
        debug_log(f"Extracted first frame to {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        debug_log(f"Failed to extract first frame: {e}", "ERROR")
        return False


def download_video_temp(video_url: str) -> Optional[str]:
    """
    Download video from URL to temporary file.
    Returns path to temp file or None on failure.
    """
    import urllib.request
    
    try:
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, "video.mp4")
        
        debug_log(f"Downloading video from {video_url[:50]}...")
        urllib.request.urlretrieve(video_url, temp_path)
        debug_log(f"Downloaded to {temp_path}")
        
        return temp_path
    except Exception as e:
        debug_log(f"Failed to download video: {e}", "ERROR")
        return None


def upload_frame_to_s3(
    frame_bytes: bytes,
    s3_client,
    bucket: str,
    key: str,
    content_type: str = "image/jpeg"
) -> Optional[str]:
    """
    Upload frame bytes to S3 and return signed URL.
    """
    try:
        s3_client.put_object(
            Bucket=bucket,
            Key=key,
            Body=frame_bytes,
            ContentType=content_type
        )
        
        # Generate presigned URL (valid for 1 hour)
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': key},
            ExpiresIn=3600
        )
        
        debug_log(f"Uploaded frame to s3://{bucket}/{key}")
        return url
    except Exception as e:
        debug_log(f"Failed to upload frame to S3: {e}", "ERROR")
        return None


# --- QA Metrics (Optional) ---

def compute_ssim(img1_path: str, img2_path: str) -> float:
    """
    Compute SSIM between two images for consistency scoring.
    Requires: pip install scikit-image
    
    Returns SSIM score between 0 and 1 (1 = identical).
    """
    try:
        from skimage.metrics import structural_similarity as ssim
        import cv2
        
        img1 = cv2.imread(img1_path, cv2.IMREAD_GRAYSCALE)
        img2 = cv2.imread(img2_path, cv2.IMREAD_GRAYSCALE)
        
        if img1 is None or img2 is None:
            debug_log("Could not load images for SSIM", "WARN")
            return 0.0
        
        # Resize to same dimensions if needed
        if img1.shape != img2.shape:
            img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
        
        score = ssim(img1, img2)
        debug_log(f"SSIM score: {score:.3f}")
        return score
        
    except ImportError:
        debug_log("scikit-image not installed, skipping SSIM", "WARN")
        return 0.0
    except Exception as e:
        debug_log(f"SSIM computation failed: {e}", "ERROR")
        return 0.0


# --- Convenience Functions ---

def create_generator_for_run(
    run_id: str,
    clip_id: str,
    master_seed: Optional[int] = None,
    style_preset: str = "podcast"
) -> ConsistentVideoGenerator:
    """
    Factory function to create a generator with sensible defaults.
    
    Args:
        run_id: Unique run identifier
        clip_id: Clip set identifier
        master_seed: Optional seed (random if not provided)
        style_preset: One of 'podcast', 'tech_noir', 'minimal'
    """
    if master_seed is None:
        import random
        master_seed = random.randint(0, 2_147_483_647)
    
    # Style presets
    if style_preset == "tech_noir":
        vil = VisualIdentityLock(
            style_identity=(
                "Neon rim lighting, high micro-contrast, cyberpunk bokeh, "
                "moody atmosphere, dark palette with vibrant accents, "
                "futuristic aesthetic, cinematic noir."
            ),
            brand_block="Tech-forward brand, cutting-edge visual identity.",
            character_refs=[],
            negative_prompt=""
        )
    elif style_preset == "minimal":
        vil = VisualIdentityLock(
            style_identity=(
                "Ultra-minimal design, clean white space, subtle shadows, "
                "geometric shapes, monochromatic palette, Swiss design influence."
            ),
            brand_block="Minimalist premium brand aesthetic.",
            character_refs=[],
            negative_prompt=""
        )
    else:  # Default: podcast
        vil = VisualIdentityLock.default_for_podcast()
    
    return ConsistentVideoGenerator(
        run_id=run_id,
        clip_id=clip_id,
        master_seed=master_seed,
        vil=vil
    )
