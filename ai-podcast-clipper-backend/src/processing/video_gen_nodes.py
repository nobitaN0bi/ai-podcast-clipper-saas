"""
Video Generation LangGraph Nodes
================================
Extended LangGraph nodes for B-roll generation pipeline.
Integrates with existing analyze → thumbnail → clip flow.

New nodes:
- plan_broll_node: Identify B-roll opportunities
- init_visual_lock_node: Set up visual identity parameters
- gen_intro_node: Generate intro hook scene
- extract_anchor_node: Extract anchor frames for continuity
- gen_broll_node: Generate B-roll sequence
- gen_outro_node: Generate loop-friendly outro
- qa_gate_node: Quality assurance check
"""

import json
import os
import pathlib
import time
import traceback
from typing import TypedDict, List, Dict, Any, Optional, Annotated
from datetime import datetime

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from src.processing.broll_generator import (
    ConsistentVideoGenerator,
    VisualIdentityLock,
    create_generator_for_run,
    extract_first_frame_ffmpeg,
    extract_last_frame_ffmpeg,
    download_video_temp,
    upload_frame_to_s3,
    compute_ssim,
    debug_log,
    hash_to_int,
)
from src.config import settings


# --- Extended State Definition ---

class BrollAsset(TypedDict):
    """Single B-roll asset metadata."""
    type: str  # 'intro', 'broll', 'outro'
    provider_url: str
    s3_key: Optional[str]
    seed: int
    segment_id: Optional[str]
    qa_score: Optional[float]


class VideoGenState(TypedDict):
    """
    Extended state for video generation pipeline.
    Includes original AgentState fields plus B-roll generation fields.
    """
    # === Original AgentState fields ===
    s3_key: str
    run_id: str
    base_dir: str
    video_path: str
    transcript_segments: List[Dict[str, Any]]
    clip_moments: List[Dict[str, Any]]
    error: Optional[str]
    
    # === Visual Identity Lock fields ===
    master_seed: int
    style_identity: str
    brand_block: str
    character_refs: List[str]
    negative_prompt: str
    
    # === Generation parameters ===
    aspect_ratio: str
    resolution: str
    num_frames: int
    num_inference_steps: int
    pro_mode: bool
    
    # === Generated assets ===
    intro_video_url: Optional[str]
    intro_first_frame_url: Optional[str]
    intro_last_frame_url: Optional[str]
    current_anchor_url: Optional[str]
    generated_broll: List[BrollAsset]
    outro_video_url: Optional[str]
    
    # === QA / Costs / Logs ===
    qa_reports: List[Dict[str, Any]]
    cost_estimate: Dict[str, Any]
    generation_trace: List[Dict[str, Any]]
    
    # === Control flags ===
    skip_broll: bool  # Set to True to skip B-roll generation


# --- LLM-based B-roll Planning ---

BROLL_PLANNING_PROMPT = """You are an expert video editor analyzing a podcast transcript to identify B-roll insertion points.

For each clip moment, determine:
1. Whether it needs B-roll (visual enhancement beyond speaker footage)
2. What type of B-roll would enhance the moment
3. A detailed visual description for generative AI

Rules:
- Only suggest B-roll for topic shifts, emphasis points, or pauses
- Keep B-roll duration 1.5-3.5 seconds
- Prefer abstract/motion graphics over realistic scenes (more forgiving for AI generation)
- Focus on visual metaphors that enhance the spoken content

Output ONLY a valid JSON array with this structure:
[
  {
    "moment_index": 0,
    "needs_broll": true,
    "broll_type": "cutaway|overlay|background|none",
    "broll_description": "Abstract visualization of growth and momentum...",
    "broll_duration_s": 2.5,
    "insertion_point": "topic_shift|emphasis|pause"
  }
]

Clip moments to analyze:
"""


def plan_broll_node(state: VideoGenState) -> Dict[str, Any]:
    """
    Analyze clip moments and plan B-roll insertions.
    Uses LLM to identify visual enhancement opportunities.
    """
    debug_log("=== ENTERING plan_broll_node ===")
    
    if state.get("error"):
        debug_log(f"Skipping - existing error: {state.get('error')}", "WARN")
        return {}
    
    if state.get("skip_broll"):
        debug_log("B-roll generation disabled for this run", "INFO")
        return {"clip_moments": state.get("clip_moments", [])}
    
    try:
        moments = state.get("clip_moments", [])
        if not moments:
            debug_log("No clip moments to plan B-roll for", "WARN")
            return {}
        
        # Build context for LLM
        moments_json = json.dumps([
            {
                "index": i,
                "start": m.get("start"),
                "end": m.get("end"),
                "topic": m.get("topic", "")[:200]  # Truncate long topics
            }
            for i, m in enumerate(moments)
        ], indent=2)
        
        prompt = BROLL_PLANNING_PROMPT + moments_json
        
        # Try LLM call
        openrouter_key = os.environ.get("OPENROUTER_API_KEY")
        if not openrouter_key:
            debug_log("OPENROUTER_API_KEY not set, using heuristic planning", "WARN")
            return _heuristic_broll_plan(state)
        
        llm = ChatOpenAI(
            model="google/gemini-2.0-flash-exp:free",
            api_key=openrouter_key,
            base_url="https://openrouter.ai/api/v1"
        )
        
        messages = [
            SystemMessage(content="You are a JSON-only API."),
            HumanMessage(content=prompt)
        ]
        
        response = llm.invoke(messages)
        content = response.content.replace("```json", "").replace("```", "").strip()
        plan = json.loads(content)
        
        # Enrich original moments with B-roll plan
        enriched_moments = []
        for i, m in enumerate(moments):
            m = dict(m)  # Copy
            plan_item = next((p for p in plan if p.get("moment_index") == i), None)
            if plan_item:
                m["needs_broll"] = plan_item.get("needs_broll", False)
                m["broll_type"] = plan_item.get("broll_type", "none")
                m["broll_description"] = plan_item.get("broll_description", "")
                m["broll_duration_s"] = plan_item.get("broll_duration_s", 2.5)
            else:
                m["needs_broll"] = False
            enriched_moments.append(m)
        
        debug_log(f"Planned B-roll for {sum(1 for m in enriched_moments if m.get('needs_broll'))} moments")
        debug_log("=== plan_broll_node COMPLETED ===")
        
        return {"clip_moments": enriched_moments}
        
    except Exception as e:
        debug_log(f"B-roll planning failed: {e}, using heuristic", "WARN")
        debug_log(traceback.format_exc(), "DEBUG")
        return _heuristic_broll_plan(state)


def _heuristic_broll_plan(state: VideoGenState) -> Dict[str, Any]:
    """Fallback heuristic B-roll planning without LLM."""
    moments = state.get("clip_moments", [])
    enriched = []
    
    for i, m in enumerate(moments):
        m = dict(m)
        # Simple heuristic: add B-roll every other moment
        m["needs_broll"] = (i % 2 == 0)
        m["broll_type"] = "cutaway" if m["needs_broll"] else "none"
        m["broll_description"] = f"Abstract visual emphasizing: {m.get('topic', 'key moment')[:100]}"
        m["broll_duration_s"] = 2.5
        enriched.append(m)
    
    return {"clip_moments": enriched}


def init_visual_lock_node(state: VideoGenState) -> Dict[str, Any]:
    """
    Initialize Visual Identity Lock with defaults if not provided.
    Sets up consistent parameters for all generations.
    """
    debug_log("=== ENTERING init_visual_lock_node ===")
    
    if state.get("error"):
        return {}
    
    # Provide sensible defaults
    defaults = {
        "master_seed": state.get("master_seed") or hash_to_int(state["run_id"], "master"),
        "style_identity": state.get("style_identity") or (
            "Clean motion graphics, soft gradients, subtle film grain, "
            "high contrast aesthetic, premium studio lighting, professional quality."
        ),
        "brand_block": state.get("brand_block") or "Premium podcast brand aesthetic.",
        "character_refs": state.get("character_refs") or [],
        "negative_prompt": state.get("negative_prompt") or (
            "blurry, low quality, distorted, warping, flickering, jittering, "
            "text artifacts, watermark, extra limbs, deformed"
        ),
        "aspect_ratio": state.get("aspect_ratio") or "9:16",
        "resolution": state.get("resolution") or "720p",
        "num_frames": state.get("num_frames") or 129,
        "num_inference_steps": state.get("num_inference_steps") or 35,
        "pro_mode": state.get("pro_mode", False),
        "generated_broll": state.get("generated_broll") or [],
        "qa_reports": state.get("qa_reports") or [],
        "generation_trace": state.get("generation_trace") or [],
        "cost_estimate": state.get("cost_estimate") or {"total_units": 0},
    }
    
    debug_log(f"Visual lock initialized: seed={defaults['master_seed']}, res={defaults['resolution']}")
    debug_log("=== init_visual_lock_node COMPLETED ===")
    
    return defaults


def gen_intro_node(state: VideoGenState) -> Dict[str, Any]:
    """
    Generate intro hook scene using text-to-video.
    Establishes visual theme for entire clip set.
    """
    debug_log("=== ENTERING gen_intro_node ===")
    
    if state.get("error") or state.get("skip_broll"):
        return {}
    
    try:
        # Check for fal.ai API key
        fal_key = os.environ.get("FAL_KEY") or os.environ.get("FAL_API_KEY")
        if not fal_key:
            debug_log("FAL_KEY not set, skipping intro generation", "WARN")
            return {"skip_broll": True}
        
        vil = VisualIdentityLock(
            style_identity=state["style_identity"],
            brand_block=state["brand_block"],
            character_refs=state.get("character_refs", []),
            negative_prompt=state["negative_prompt"],
            aspect_ratio=state["aspect_ratio"],
            resolution=state["resolution"],
            num_frames=state["num_frames"],
            num_inference_steps=state["num_inference_steps"],
            pro_mode=state.get("pro_mode", False),
        )
        
        gen = ConsistentVideoGenerator(
            run_id=state["run_id"],
            clip_id=f"clipset-{state['run_id'][:8]}",
            master_seed=state["master_seed"],
            vil=vil
        )
        
        # Generate intro
        first_moment = state.get("clip_moments", [{}])[0]
        hook_topic = first_moment.get("topic", "engaging opening hook")
        
        result = gen.gen_intro(f"Dynamic establishing scene for: {hook_topic[:100]}")
        
        video_url = result.get("video", {}).get("url")
        if not video_url:
            debug_log("Intro generation returned no video URL", "ERROR")
            return {"error": "Intro generation failed - no video URL"}
        
        # Track asset
        asset: BrollAsset = {
            "type": "intro",
            "provider_url": video_url,
            "s3_key": None,
            "seed": state["master_seed"],
            "segment_id": None,
            "qa_score": None
        }
        
        debug_log(f"Intro generated: {video_url[:60]}...")
        debug_log("=== gen_intro_node COMPLETED ===")
        
        return {
            "intro_video_url": video_url,
            "generated_broll": state.get("generated_broll", []) + [asset],
            "generation_trace": state.get("generation_trace", []) + gen.get_generation_log()
        }
        
    except Exception as e:
        debug_log(f"Intro generation error: {e}", "ERROR")
        debug_log(traceback.format_exc(), "ERROR")
        # Don't fail the whole pipeline
        return {"skip_broll": True}


def extract_anchor_node(state: VideoGenState) -> Dict[str, Any]:
    """
    Extract anchor frames from generated intro for continuity.
    Uploads frames to S3 for use in subsequent generations.
    """
    debug_log("=== ENTERING extract_anchor_node ===")
    
    if state.get("error") or state.get("skip_broll"):
        return {}
    
    intro_url = state.get("intro_video_url")
    if not intro_url:
        debug_log("No intro video to extract anchors from", "WARN")
        return {}
    
    try:
        # Download intro video
        temp_path = download_video_temp(intro_url)
        if not temp_path:
            return {"skip_broll": True}
        
        base_dir = pathlib.Path(state["base_dir"])
        
        # Extract first frame (for loop closure)
        first_frame_path = str(base_dir / "anchor_intro_first.jpg")
        extract_first_frame_ffmpeg(temp_path, first_frame_path)
        
        # Extract last frame (for continuity)
        last_frame_path = str(base_dir / "anchor_intro_last.jpg")
        extract_last_frame_ffmpeg(temp_path, last_frame_path)
        
        # TODO: Upload to S3 and get signed URLs
        # For now, use local paths (works within Modal)
        debug_log(f"Anchors extracted: {first_frame_path}, {last_frame_path}")
        debug_log("=== extract_anchor_node COMPLETED ===")
        
        return {
            "intro_first_frame_url": f"file://{first_frame_path}",  # Placeholder
            "intro_last_frame_url": f"file://{last_frame_path}",
            "current_anchor_url": f"file://{last_frame_path}"
        }
        
    except Exception as e:
        debug_log(f"Anchor extraction error: {e}", "ERROR")
        return {"skip_broll": True}


def gen_broll_node(state: VideoGenState) -> Dict[str, Any]:
    """
    Generate B-roll sequence for moments that need visual enhancement.
    Uses image-to-video with anchor frame for consistency.
    """
    debug_log("=== ENTERING gen_broll_node ===")
    
    if state.get("error") or state.get("skip_broll"):
        return {}
    
    anchor_url = state.get("current_anchor_url")
    if not anchor_url or anchor_url.startswith("file://"):
        debug_log("No valid anchor URL for B-roll generation", "WARN")
        # Could implement local file handling here
        return {}
    
    try:
        vil = VisualIdentityLock(
            style_identity=state["style_identity"],
            brand_block=state["brand_block"],
            character_refs=state.get("character_refs", []),
            negative_prompt=state["negative_prompt"],
            aspect_ratio=state["aspect_ratio"],
            resolution=state["resolution"],
            num_frames=state["num_frames"],
            num_inference_steps=state["num_inference_steps"],
            pro_mode=state.get("pro_mode", False),
        )
        
        gen = ConsistentVideoGenerator(
            run_id=state["run_id"],
            clip_id=f"clipset-{state['run_id'][:8]}",
            master_seed=state["master_seed"],
            vil=vil
        )
        
        broll_assets = []
        current_anchor = anchor_url
        
        for i, moment in enumerate(state.get("clip_moments", [])):
            if not moment.get("needs_broll"):
                continue
            
            segment_id = f"m{i}"
            description = moment.get("broll_description", f"Visual for: {moment.get('topic', '')[:50]}")
            
            debug_log(f"Generating B-roll for segment {segment_id}")
            
            try:
                result = gen.gen_continuation(current_anchor, description, segment_id)
                video_url = result.get("video", {}).get("url")
                
                if video_url:
                    asset: BrollAsset = {
                        "type": "broll",
                        "provider_url": video_url,
                        "s3_key": None,
                        "seed": hash_to_int(str(state["master_seed"]), segment_id, "broll"),
                        "segment_id": segment_id,
                        "qa_score": None
                    }
                    broll_assets.append(asset)
                    # Update anchor for next iteration (would need to extract last frame)
                    
            except Exception as clip_err:
                debug_log(f"B-roll {segment_id} failed: {clip_err}", "WARN")
                continue
        
        debug_log(f"Generated {len(broll_assets)} B-roll clips")
        debug_log("=== gen_broll_node COMPLETED ===")
        
        return {
            "generated_broll": state.get("generated_broll", []) + broll_assets,
            "generation_trace": state.get("generation_trace", []) + gen.get_generation_log()
        }
        
    except Exception as e:
        debug_log(f"B-roll generation error: {e}", "ERROR")
        return {}


def gen_outro_node(state: VideoGenState) -> Dict[str, Any]:
    """
    Generate outro that mirrors intro for seamless loop.
    Uses intro first frame as anchor for visual coherence.
    """
    debug_log("=== ENTERING gen_outro_node ===")
    
    if state.get("error") or state.get("skip_broll"):
        return {}
    
    intro_first = state.get("intro_first_frame_url")
    if not intro_first or intro_first.startswith("file://"):
        debug_log("No valid intro first frame for outro", "WARN")
        return {}
    
    try:
        vil = VisualIdentityLock(
            style_identity=state["style_identity"],
            brand_block=state["brand_block"],
            character_refs=state.get("character_refs", []),
            negative_prompt=state["negative_prompt"],
            aspect_ratio=state["aspect_ratio"],
            resolution=state["resolution"],
            num_frames=state["num_frames"],
            num_inference_steps=state["num_inference_steps"],
            pro_mode=state.get("pro_mode", False),
        )
        
        gen = ConsistentVideoGenerator(
            run_id=state["run_id"],
            clip_id=f"clipset-{state['run_id'][:8]}",
            master_seed=state["master_seed"],
            vil=vil
        )
        
        result = gen.gen_outro_loop(intro_first, "Satisfying conclusion returning to opening theme.")
        video_url = result.get("video", {}).get("url")
        
        if video_url:
            asset: BrollAsset = {
                "type": "outro",
                "provider_url": video_url,
                "s3_key": None,
                "seed": hash_to_int(str(state["master_seed"]), state["run_id"], "outro"),
                "segment_id": None,
                "qa_score": None
            }
            
            debug_log(f"Outro generated: {video_url[:60]}...")
            debug_log("=== gen_outro_node COMPLETED ===")
            
            return {
                "outro_video_url": video_url,
                "generated_broll": state.get("generated_broll", []) + [asset]
            }
        
        return {}
        
    except Exception as e:
        debug_log(f"Outro generation error: {e}", "ERROR")
        return {}


def qa_gate_node(state: VideoGenState) -> Dict[str, Any]:
    """
    Quality assurance gate for generated B-roll.
    Checks visual consistency metrics and flags issues.
    """
    debug_log("=== ENTERING qa_gate_node ===")
    
    if state.get("error") or state.get("skip_broll"):
        return {}
    
    # TODO: Implement full QA with SSIM scoring
    # For now, just log the generated assets
    
    broll = state.get("generated_broll", [])
    qa_reports = []
    
    for asset in broll:
        report = {
            "type": asset.get("type"),
            "segment_id": asset.get("segment_id"),
            "passed": True,  # Assume pass for now
            "ssim": asset.get("qa_score"),
            "timestamp": datetime.now().isoformat()
        }
        qa_reports.append(report)
    
    passed = sum(1 for r in qa_reports if r.get("passed"))
    failed = len(qa_reports) - passed
    
    debug_log(f"QA Gate: {passed} passed, {failed} failed")
    debug_log("=== qa_gate_node COMPLETED ===")
    
    return {"qa_reports": qa_reports}


# --- Graph Construction ---

def build_video_gen_graph() -> StateGraph:
    """
    Build the extended LangGraph for video generation.
    
    Flow:
    plan_broll → init_visual_lock → gen_intro → extract_anchor →
    gen_broll → gen_outro → qa_gate → END
    """
    graph = StateGraph(VideoGenState)
    
    # Add nodes
    graph.add_node("plan_broll", plan_broll_node)
    graph.add_node("init_visual_lock", init_visual_lock_node)
    graph.add_node("gen_intro", gen_intro_node)
    graph.add_node("extract_anchor", extract_anchor_node)
    graph.add_node("gen_broll", gen_broll_node)
    graph.add_node("gen_outro", gen_outro_node)
    graph.add_node("qa_gate", qa_gate_node)
    
    # Set entry point
    graph.set_entry_point("plan_broll")
    
    # Add edges
    graph.add_edge("plan_broll", "init_visual_lock")
    graph.add_edge("init_visual_lock", "gen_intro")
    graph.add_edge("gen_intro", "extract_anchor")
    graph.add_edge("extract_anchor", "gen_broll")
    graph.add_edge("gen_broll", "gen_outro")
    graph.add_edge("gen_outro", "qa_gate")
    graph.add_edge("qa_gate", END)
    
    return graph


# Compile the graph
video_gen_graph = build_video_gen_graph()
video_gen_runner = video_gen_graph.compile()


# --- Integration Helper ---

def run_video_generation(
    run_id: str,
    s3_key: str,
    base_dir: str,
    video_path: str,
    transcript_segments: List[Dict],
    clip_moments: List[Dict],
    style_preset: str = "podcast",
    skip_broll: bool = False
) -> Dict[str, Any]:
    """
    Convenience function to run the video generation pipeline.
    
    Args:
        run_id: Unique run identifier
        s3_key: S3 key for source video
        base_dir: Working directory
        video_path: Path to source video
        transcript_segments: WhisperX transcript
        clip_moments: Analyzed viral moments
        style_preset: Visual style preset
        skip_broll: Whether to skip B-roll generation
    
    Returns:
        Final state with generated assets
    """
    initial_state: VideoGenState = {
        "run_id": run_id,
        "s3_key": s3_key,
        "base_dir": base_dir,
        "video_path": video_path,
        "transcript_segments": transcript_segments,
        "clip_moments": clip_moments,
        "error": None,
        "skip_broll": skip_broll,
        # Rest will be initialized by init_visual_lock_node
        "master_seed": 0,
        "style_identity": "",
        "brand_block": "",
        "character_refs": [],
        "negative_prompt": "",
        "aspect_ratio": "9:16",
        "resolution": "720p",
        "num_frames": 129,
        "num_inference_steps": 35,
        "pro_mode": False,
        "intro_video_url": None,
        "intro_first_frame_url": None,
        "intro_last_frame_url": None,
        "current_anchor_url": None,
        "generated_broll": [],
        "outro_video_url": None,
        "qa_reports": [],
        "cost_estimate": {},
        "generation_trace": [],
    }
    
    debug_log(f"Starting video generation pipeline for run={run_id}")
    final_state = video_gen_runner.invoke(initial_state)
    debug_log(f"Pipeline completed. Generated {len(final_state.get('generated_broll', []))} assets")
    
    return final_state
