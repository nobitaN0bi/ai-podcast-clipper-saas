import datetime

def format_timestamp(seconds: float) -> str:
    """Converts seconds to SRT timestamp format (HH:MM:SS,mmm)."""
    td = datetime.timedelta(seconds=seconds)
    # total_seconds() might be float, so we handle milliseconds manually
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    millis = int((seconds - total_seconds) * 1000)
    
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"

def generate_srt(segments: list[dict], output_path: str) -> None:
    """
    Generates an SRT file from a list of WhisperX segments.
    
    Args:
        segments: List of dicts, each containing 'start', 'end', and 'word' (or 'text').
                  WhisperX 'word_segments' are preferred for better sync.
        output_path: Path to save the .srt file.
    """
    with open(output_path, "w", encoding="utf-8") as f:
        for i, segment in enumerate(segments, start=1):
            start = segment.get("start")
            end = segment.get("end")
            text = segment.get("word", segment.get("text", "")).strip()
            
            if start is None or end is None:
                continue
                
            # Create SRT entry
            # 1
            # 00:00:01,000 --> 00:00:04,000
            # Hello world
            
            timestamp_line = f"{format_timestamp(start)} --> {format_timestamp(end)}"
            
            f.write(f"{i}\n")
            f.write(f"{timestamp_line}\n")
            f.write(f"{text}\n\n")
