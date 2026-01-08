import glob
import json
import pickle
import shutil
import subprocess
import time
import os
import pathlib
import cv2
import ffmpegcv
import numpy as np
from tqdm import tqdm
from tqdm import tqdm
import pysubs2
from src.processing.captions import generate_srt

# We need to import paths for models or rely on arguments.
# For now, we assume the environment is set up as in the original Modal image.

def create_vertical_video(tracks, scores, pyframes_path, pyavi_path, audio_path, output_path, framerate=25):
    target_width = 1080
    target_height = 1920

    flist = glob.glob(os.path.join(pyframes_path, "*.jpg"))
    flist.sort()

    faces = [[] for _ in range(len(flist))]

    for tidx, track in enumerate(tracks):
        score_array = scores[tidx]
        for fidx, frame in enumerate(track["track"]["frame"].tolist()):
            slice_start = max(fidx - 30, 0)
            slice_end = min(fidx + 30, len(score_array))
            score_slice = score_array[slice_start:slice_end]
            # Handle empty slice case to avoid warning/error
            avg_score = float(np.mean(score_slice) if len(score_slice) > 0 else 0)

            faces[frame].append(
                {'track': tidx, 'score': avg_score, 's': track['proc_track']["s"][fidx], 'x': track['proc_track']["x"][fidx], 'y': track['proc_track']["y"][fidx]})

    temp_video_path = os.path.join(pyavi_path, "video_only.mp4")

    vout = None
    for fidx, fname in tqdm(enumerate(flist), total=len(flist), desc="Creating vertical video"):
        img = cv2.imread(fname)
        if img is None:
            continue

        current_faces = faces[fidx]

        max_score_face = max(
            current_faces, key=lambda face: face['score']) if current_faces else None

        if max_score_face and max_score_face['score'] < 0:
            max_score_face = None

        if vout is None:
            vout = ffmpegcv.VideoWriterNV(
                file=temp_video_path,
                codec=None,
                fps=framerate,
                resize=(target_width, target_height)
            )

        if max_score_face:
            mode = "crop"
        else:
            mode = "resize"

        if mode == "resize":
            scale = target_width / img.shape[1]
            resized_height = int(img.shape[0] * scale)
            resized_image = cv2.resize(
                img, (target_width, resized_height), interpolation=cv2.INTER_AREA)

            scale_for_bg = max(
                target_width / img.shape[1], target_height / img.shape[0])
            bg_width = int(img.shape[1] * scale_for_bg)
            bg_height = int(img.shape[0] * scale_for_bg)

            blurred_background = cv2.resize(img, (bg_width, bg_height))
            blurred_background = cv2.GaussianBlur(
                blurred_background, (121, 121), 0)

            crop_x = (bg_width - target_width) // 2
            crop_y = (bg_height - target_height) // 2
            blurred_background = blurred_background[crop_y:crop_y +
                                                    target_height, crop_x:crop_x + target_width]

            center_y = (target_height - resized_height) // 2
            blurred_background[center_y:center_y +
                               resized_height, :] = resized_image

            vout.write(blurred_background)

        elif mode == "crop":
            scale = target_height / img.shape[0]
            resized_image = cv2.resize(
                img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
            frame_width = resized_image.shape[1]

            center_x = int(
                max_score_face["x"] * scale if max_score_face else frame_width // 2)
            top_x = max(min(center_x - target_width // 2,
                        frame_width - target_width), 0)

            image_cropped = resized_image[0:target_height,
                                          top_x:top_x + target_width]

            vout.write(image_cropped)

    if vout:
        vout.release()

    ffmpeg_command = (f"ffmpeg -y -i {temp_video_path} -i {audio_path} "
                      f"-c:v h264 -preset fast -crf 23 -c:a aac -b:a 128k "
                      f"{output_path}")
    subprocess.run(ffmpeg_command, shell=True, check=True, text=True)


def create_subtitles_with_ffmpeg(transcript_segments: list, clip_start: float, clip_end: float, clip_video_path: str, output_path: str, max_words: int = 5):
    temp_dir = os.path.dirname(output_path)
    subtitle_path = os.path.join(temp_dir, "temp_subtitles.ass")

    clip_segments = [segment for segment in transcript_segments
                     if segment.get("start") is not None
                     and segment.get("end") is not None
                     and segment.get("end") > clip_start
                     and segment.get("start") < clip_end
                     ]

    subtitles = []
    current_words = []
    current_start = None
    current_end = None

    for segment in clip_segments:
        word = segment.get("word", "").strip()
        seg_start = segment.get("start")
        seg_end = segment.get("end")

        if not word or seg_start is None or seg_end is None:
            continue

        start_rel = max(0.0, seg_start - clip_start)
        end_rel = max(0.0, seg_end - clip_start)

        if end_rel <= 0:
            continue

        if not current_words:
            current_start = start_rel
            current_end = end_rel
            current_words = [word]
        elif len(current_words) >= max_words:
            subtitles.append(
                (current_start, current_end, ' '.join(current_words)))
            current_words = [word]
            current_start = start_rel
            current_end = end_rel
        else:
            current_words.append(word)
            current_end = end_rel

    if current_words:
        subtitles.append(
            (current_start, current_end, ' '.join(current_words)))

    subs = pysubs2.SSAFile()

    subs.info["WrapStyle"] = 0
    subs.info["ScaledBorderAndShadow"] = "yes"
    subs.info["PlayResX"] = 1080
    subs.info["PlayResY"] = 1920
    subs.info["ScriptType"] = "v4.00+"

    style_name = "Default"
    new_style = pysubs2.SSAStyle()
    new_style.fontname = "Anton"
    new_style.fontsize = 140
    new_style.primarycolor = pysubs2.Color(255, 255, 255)
    new_style.outline = 2.0
    new_style.shadow = 2.0
    new_style.shadowcolor = pysubs2.Color(0, 0, 0, 128)
    new_style.alignment = 2
    new_style.marginl = 50
    new_style.marginr = 50
    new_style.marginv = 50
    new_style.spacing = 0.0

    subs.styles[style_name] = new_style

    for i, (start, end, text) in enumerate(subtitles):
        start_time = pysubs2.make_time(s=start)
        end_time = pysubs2.make_time(s=end)
        line = pysubs2.SSAEvent(
            start=start_time, end=end_time, text=text, style=style_name)
        subs.events.append(line)

    subs.save(subtitle_path)

    ffmpeg_cmd = (f"ffmpeg -y -i {clip_video_path} -vf \"ass={subtitle_path}\" "
                  f"-c:v h264 -preset fast -crf 23 {output_path}")

    subprocess.run(ffmpeg_cmd, shell=True, check=True)


def process_clip(base_dir: pathlib.Path, original_video_path: pathlib.Path, s3_key: str, start_time: float, end_time: float, clip_index: int, transcript_segments: list, burn_captions: bool = True):
    import datetime
    def debug_log(msg: str, level: str = "INFO"):
        ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        print(f"[{ts}] [SERVICE] [{level}] {msg}", flush=True)
    
    debug_log(f"=== PROCESS_CLIP START: clip_{clip_index} ===")
    debug_log(f"Params: start={start_time}, end={end_time}, s3_key={s3_key}")
    
    clip_name = f"clip_{clip_index}"
    s3_key_dir = os.path.dirname(s3_key)
    output_s3_key = f"{s3_key_dir}/{clip_name}.mp4"
    debug_log(f"Output S3 key: {output_s3_key}")

    clip_dir = base_dir / clip_name
    clip_dir.mkdir(parents=True, exist_ok=True)
    debug_log(f"Created clip_dir: {clip_dir}")

    clip_segment_path = clip_dir / f"{clip_name}_segment.mp4"
    vertical_mp4_path = clip_dir / "pyavi" / "video_out_vertical.mp4"
    subtitle_output_path = clip_dir / "pyavi" / "video_with_subtitles.mp4"

    (clip_dir / "pywork").mkdir(exist_ok=True)
    pyframes_path = clip_dir / "pyframes"
    pyavi_path = clip_dir / "pyavi"
    audio_path = clip_dir / "pyavi" / "audio.wav"

    pyframes_path.mkdir(exist_ok=True)
    pyavi_path.mkdir(exist_ok=True)

    duration = end_time - start_time
    debug_log(f"Step 1: Cutting clip segment (duration: {duration}s)")
    cut_command = (f"ffmpeg -i {original_video_path} -ss {start_time} -t {duration} "
                   f"{clip_segment_path}")
    subprocess.run(cut_command, shell=True, check=True,
                   capture_output=True, text=True)
    debug_log(f"Clip segment created: {clip_segment_path}, exists: {clip_segment_path.exists()}")

    debug_log("Step 2: Extracting audio")
    extract_cmd = f"ffmpeg -i {clip_segment_path} -vn -acodec pcm_s16le -ar 16000 -ac 1 {audio_path}"
    subprocess.run(extract_cmd, shell=True,
                   check=True, capture_output=True)
    debug_log(f"Audio extracted: {audio_path}, exists: {audio_path.exists()}")

    shutil.copy(clip_segment_path, base_dir / f"{clip_name}.mp4")
    debug_log(f"Copied segment to: {base_dir / f'{clip_name}.mp4'}")

    # Assuming /asd exists in the container
    debug_log("Step 3: Running Columbia ASD (Active Speaker Detection)")
    columbia_command = (f"python Columbia_test.py --videoName {clip_name} "
                        f"--videoFolder {str(base_dir)} "
                        f"--pretrainModel weight/finetuning_TalkSet.model")

    columbia_start_time = time.time()
    result = subprocess.run(columbia_command, cwd="/asd", shell=True, capture_output=True, text=True)
    columbia_end_time = time.time()
    debug_log(f"Columbia ASD completed in {columbia_end_time - columbia_start_time:.2f}s")
    debug_log(f"Columbia return code: {result.returncode}")
    if result.returncode != 0:
        debug_log(f"Columbia stderr: {result.stderr[:500] if result.stderr else 'none'}", "WARN")
        debug_log(f"Columbia stdout: {result.stdout[:500] if result.stdout else 'none'}", "WARN")

    tracks_path = clip_dir / "pywork" / "tracks.pckl"
    scores_path = clip_dir / "pywork" / "scores.pckl"
    debug_log(f"Checking for tracks.pckl: {tracks_path.exists()}")
    debug_log(f"Checking for scores.pckl: {scores_path.exists()}")
    
    if not tracks_path.exists() or not scores_path.exists():
        debug_log("CRITICAL: Tracks or scores not found! ASD failed.", "ERROR")
        raise FileNotFoundError("Tracks or scores not found for clip")

    debug_log("Step 4: Loading tracks and scores")
    with open(tracks_path, "rb") as f:
        tracks = pickle.load(f)

    with open(scores_path, "rb") as f:
        scores = pickle.load(f)
    debug_log(f"Loaded {len(tracks)} tracks and {len(scores)} scores")

    debug_log("Step 5: Creating vertical video")
    cvv_start_time = time.time()
    create_vertical_video(
        tracks, scores, str(pyframes_path), str(pyavi_path), str(audio_path), str(vertical_mp4_path)
    )
    cvv_end_time = time.time()
    debug_log(f"Vertical video created in {cvv_end_time - cvv_start_time:.2f}s")
    debug_log(f"Vertical video exists: {vertical_mp4_path.exists()}")

    debug_log("Step 6: Adding subtitles (Conditional)")
    final_output_path = vertical_mp4_path

    if burn_captions:
        debug_log("Captions enabled. Generating SRT and burning...")
        srt_path = clip_dir / "subtitles.srt"
        
        # Filter segments for this clip
        clip_segments = [s for s in transcript_segments 
                         if s.get("start") is not None and s.get("end") is not None
                         and s["end"] > start_time and s["start"] < end_time]
        
        # Adjust timestamps relative to clip start
        rel_segments = []
        for s in clip_segments:
            rel_start = max(0.0, s["start"] - start_time)
            rel_end = max(0.0, s["end"] - start_time)
            rel_segments.append({
                "start": rel_start,
                "end": rel_end,
                "text": s.get("word", s.get("text", "")).strip()
            })
            
        generate_srt(rel_segments, str(srt_path))
        debug_log(f"SRT generated at: {srt_path}")
        
        # Burn subtitles
        # Using force_style to allow some customization even with SRT
        # Fontname=Anton needs Anton installed. defaulting to Arial if issue, but Anton is in dockerfile.
        # PrimaryColour=&H00FFFFFF (White), OutlineColour=&H00000000 (Black)
        style = "Fontname=Anton,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=0,MarginV=20"
        
        # Escaping for filter complex: 
        # subtitles=filename:force_style='...'
        # We need to be careful with paths in ffmpeg filters.
        # Using relative path if possible or full path with escaping.
        
        ffmpeg_cmd = (f"ffmpeg -y -i {vertical_mp4_path} "
                      f"-vf \"subtitles={srt_path}:force_style='{style}'\" "
                      f"-c:v h264 -preset fast -crf 23 -c:a copy "
                      f"{subtitle_output_path}")
                      
        subprocess.run(ffmpeg_cmd, shell=True, check=True)
        final_output_path = subtitle_output_path
        debug_log(f"Burned captions to: {final_output_path}")
    else:
        debug_log("Captions disabled. Skipping burn-in.")

    debug_log("Step 7: Uploading to S3")
    import boto3
    s3_client = boto3.client("s3")
    bucket_name = os.environ.get("S3_BUCKET_NAME", "kriyam-podcast-clipper")
    debug_log(f"Uploading to bucket: {bucket_name}, key: {output_s3_key}")
    s3_client.upload_file(
        str(final_output_path), bucket_name, output_s3_key)
    debug_log(f"=== PROCESS_CLIP COMPLETED: {output_s3_key} ===")
