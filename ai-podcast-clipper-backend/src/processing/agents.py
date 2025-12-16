
import json
import os
import pathlib
import uuid
import time
import traceback
from typing import TypedDict, List, Annotated
import shutil

# These imports are deferred to inside functions to avoid local import errors during `modal deploy`
# boto3, whisperx, cv2 are imported inside their respective functions

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from src.processing.service import process_clip
from src.config import settings

# --- Debug Helper ---
def debug_log(msg: str, level: str = "INFO"):
    """Centralized debug logging with timestamp"""
    import datetime
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(f"[{ts}] [{level}] {msg}", flush=True)

# --- State Definition ---
class ClipMoment(TypedDict):
    start: float
    end: float
    topic: str
    thumbnail_path: str # New field

class AgentState(TypedDict):
    s3_key: str
    run_id: str
    base_dir: str
    video_path: str
    transcript_segments: List[dict] # Input
    clip_moments: List[ClipMoment]
    clip_moments: List[ClipMoment]
    error: str
    burn_captions: bool


# --- Nodes ---

def analysis_node(state: AgentState) -> AgentState:
    """Uses OpenRouter LLM to find viral moments."""
    debug_log("=== ENTERING analysis_node ===")
    debug_log(f"State keys: {list(state.keys())}")
    debug_log(f"run_id: {state.get('run_id')}")
    debug_log(f"s3_key: {state.get('s3_key')}")
    debug_log(f"transcript_segments count: {len(state.get('transcript_segments', []))}")
    
    if state.get("error"):
        debug_log(f"Skipping - existing error: {state.get('error')}", "WARN")
        return state
    
    try:
        debug_log("Initializing OpenRouter LLM...")
        openrouter_key = os.environ.get("OPENROUTER_API_KEY")
        debug_log(f"OPENROUTER_API_KEY present: {bool(openrouter_key)}")
        if openrouter_key:
            debug_log(f"API key length: {len(openrouter_key)}")
        
        if not openrouter_key:
            debug_log("ERROR: OPENROUTER_API_KEY not set!", "ERROR")
            return {**state, "error": "OPENROUTER_API_KEY environment variable not set"}
        
        transcript_text = json.dumps(state["transcript_segments"])
        debug_log(f"Transcript text length: {len(transcript_text)} chars")
        
        prompt = """
        You are an expert video editor. Analyze the following transcript segments.
        Identify 3-5 "viral moments" that would work well as short-form vertical videos (TikTok/Reels).
        Criteria:
        - Duration: 30-60 seconds.
        - Content: Strong hook, clear story/point, self-contained.
        - Output: Valid JSON list of objects: [{"start": 10.5, "end": 45.2, "topic": "Description"}]
        
        Transcript: 
        """ + transcript_text[:100000]
        
        messages = [
            SystemMessage(content="You are a JSON-only API."),
            HumanMessage(content=prompt)
        ]

        # Models to try in order
        models_to_try = [
            "google/gemini-2.0-flash-exp:free",
            "mistralai/devstral-2512:free"
        ]
        
        moments = []
        success = False
        
        for model_name in models_to_try:
            try:
                debug_log(f"Attempting model: {model_name}")
                llm = ChatOpenAI(
                    model=model_name, 
                    api_key=openrouter_key,
                    base_url="https://openrouter.ai/api/v1"
                )
                
                debug_log(f"Invoking {model_name}...")
                response = llm.invoke(messages)
                
                if not response.content:
                    debug_log(f"Model {model_name} returned empty content", "WARN")
                    continue
                    
                debug_log(f"LLM response received from {model_name}")
                content = response.content.replace("```json", "").replace("```", "").strip()
                moments = json.loads(content)
                
                if not isinstance(moments, list) or len(moments) == 0:
                    debug_log(f"Model {model_name} returned invalid JSON or empty list", "WARN")
                    continue
                    
                debug_log(f"Successfully parsed {len(moments)} moments from {model_name}")
                success = True
                break
                
            except Exception as e:
                debug_log(f"Model {model_name} failed: {str(e)}", "WARN")
                continue
                
        if not success:
            error_msg = "All models failed to analyze transcript"
            debug_log(error_msg, "ERROR")
            return {**state, "error": error_msg}

        debug_log("=== analysis_node COMPLETED SUCCESSFULLY ===")
        return {**state, "clip_moments": moments}
        
    except Exception as e:
        debug_log(f"Analysis Error: {str(e)}", "ERROR")
        debug_log(f"Traceback: {traceback.format_exc()}", "ERROR")
        return {**state, "error": f"Analysis failed: {str(e)}"}

def thumbnail_node(state: AgentState) -> AgentState:
    """Extracts a frame and generates a thumbnail (Sub-Agent Placeholder)."""
    debug_log("=== ENTERING thumbnail_node ===")
    debug_log(f"clip_moments count: {len(state.get('clip_moments', []))}")
    
    if state.get("error"):
        debug_log(f"Skipping - existing error: {state.get('error')}", "WARN")
        return state
    
    try:
        import cv2
        debug_log("cv2 imported successfully")
        
        updated_moments = []
        video_cap = cv2.VideoCapture(state["video_path"])
        debug_log(f"VideoCapture opened: {video_cap.isOpened()}")
        
        for idx, moment in enumerate(state["clip_moments"]):
            debug_log(f"Processing thumbnail for moment {idx}: start={moment.get('start')}, end={moment.get('end')}")
            
            # 1. Extract Middle Frame
            mid_point = (moment["start"] + moment["end"]) / 2
            video_cap.set(cv2.CAP_PROP_POS_MSEC, mid_point * 1000)
            success, image = video_cap.read()
            debug_log(f"  Frame extraction success: {success}")
            
            thumb_path = ""
            if success:
                # Save raw frame
                base_dir = pathlib.Path(state["base_dir"])
                raw_path = base_dir / f"thumb_{moment['start']}.jpg"
                cv2.imwrite(str(raw_path), image)
                debug_log(f"  Thumbnail saved to: {raw_path}")
                
                # TODO: Call Generative AI here (DALL-E / Stable Diffusion) to enhance
                # For now, we use the raw frame
                thumb_path = str(raw_path)
            
            moment["thumbnail_path"] = thumb_path
            updated_moments.append(moment)
            
        video_cap.release()
        debug_log("=== thumbnail_node COMPLETED SUCCESSFULLY ===")
        return {**state, "clip_moments": updated_moments}
        
    except Exception as e:
        debug_log(f"Thumbnail Error: {str(e)}", "ERROR")
        debug_log(f"Traceback: {traceback.format_exc()}", "ERROR")
        # Non-critical, continue
        return state

def clipping_node(state: AgentState) -> AgentState:
    """Cuts and processes videos using the Service Layer."""
    debug_log("=== ENTERING clipping_node ===")
    debug_log(f"State: run_id={state.get('run_id')}, base_dir={state.get('base_dir')}")
    debug_log(f"clip_moments count: {len(state.get('clip_moments', []))}")
    
    if state.get("error"):
        debug_log(f"Skipping - existing error: {state.get('error')}", "WARN")
        return state
    
    if not state.get("clip_moments"):
        debug_log("No clip_moments found! Skipping clipping.", "WARN")
        return state
    
    try:
        base_dir_path = pathlib.Path(state["base_dir"])
        video_path = pathlib.Path(state["video_path"])
        debug_log(f"base_dir_path: {base_dir_path}, exists: {base_dir_path.exists()}")
        debug_log(f"video_path: {video_path}, exists: {video_path.exists()}")
        
        for index, moment in enumerate(state["clip_moments"]):
            debug_log(f"Processing clip {index}: start={moment['start']}, end={moment['end']}, topic={moment.get('topic', '')[:50]}")
            try:
                process_clip(
                    base_dir=base_dir_path,
                    original_video_path=video_path,
                    s3_key=state["s3_key"],
                    start_time=moment["start"],
                    end_time=moment["end"],
                    clip_index=index,
                    start_time=moment["start"],
                    end_time=moment["end"],
                    clip_index=index,
                    transcript_segments=state["transcript_segments"],
                    burn_captions=state.get("burn_captions", True)
                )
                debug_log(f"  Clip {index} processed successfully")
            except Exception as clip_error:
                debug_log(f"  ERROR processing clip {index}: {str(clip_error)}", "ERROR")
                debug_log(f"  Clip {index} traceback: {traceback.format_exc()}", "ERROR")
                # Continue with other clips despite error
            
        debug_log("=== clipping_node COMPLETED ===")
        return state
        
    except Exception as e:
        debug_log(f"Clipping Node Error: {str(e)}", "ERROR")
        debug_log(f"Traceback: {traceback.format_exc()}", "ERROR")
        return {**state, "error": f"Clipping failed: {str(e)}"}

# --- Graph Construction ---

graph = StateGraph(AgentState)

graph.add_node("analyze", analysis_node)
graph.add_node("thumbnail", thumbnail_node)
graph.add_node("clip", clipping_node)

graph.set_entry_point("analyze")

graph.add_edge("analyze", "thumbnail")
graph.add_edge("thumbnail", "clip")
graph.add_edge("clip", END)

agent_runner = graph.compile()

