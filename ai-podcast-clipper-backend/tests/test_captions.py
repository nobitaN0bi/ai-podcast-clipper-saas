import pytest
from src.processing.captions import generate_srt
import os

def test_generate_srt(tmp_path):
    segments = [
        {"start": 1.5, "end": 4.0, "word": "Hello"},
        {"start": 4.1, "end": 5.0, "word": "World"},
        {"start": 6.0, "end": 6.5, "text": " multiline check "}, # sometimes 'text' instead of 'word'
    ]
    
    output_path = tmp_path / "test.srt"
    
    generate_srt(segments, str(output_path))
    
    assert output_path.exists()
    
    content = output_path.read_text(encoding="utf-8")
    
    # Check format
    expected_snippets = [
        "1",
        "00:00:01,500 --> 00:00:04,000",
        "Hello",
        "2",
        "00:00:04,100 --> 00:00:05,000",
        "World",
        "3",
        "00:00:06,000 --> 00:00:06,500",
        "multiline check"
    ]
    
    for snippet in expected_snippets:
        assert snippet in content

if __name__ == "__main__":
    # verification script
    print("Running test...")
    try:
        from pathlib import Path
        import shutil
        test_dir = Path("test_output") 
        test_dir.mkdir(exist_ok=True)
        test_generate_srt(test_dir)
        print("Test Passed!")
        shutil.rmtree(test_dir)
    except Exception as e:
        print(f"Test Failed: {e}")
