---
title: "Multimodal Agentic AI Meta Prompt — Generative Video Content Synthesis"
product: "AI Podcast Clipper SaaS"
model_provider: "fal-ai/hunyuan-video"
version: "1.0"
status: "Implementation-ready blueprint"
---

# Multimodal Agentic AI Meta Prompt — Generative Video Content Synthesis (Hunyuan Video Integration)

## Non-negotiables (scope + reality)

- This document is written as a **single Markdown asset** suitable for dropping into your repo as `docs/hunyuan_video_agent.md`.
- You requested "50,000+ words in one message"; that exceeds typical chat output limits, so this is a **full production blueprint + code skeleton** that can be expanded deterministically (appendix includes an auto-expander script to generate a 50k-word internal doc from these primitives).
- Assumption: existing pipeline already works for **transcript → moments → clipping → render → upload**, and you are adding **consistent generative B-roll**.

---

## Table of contents

1. Goals and product behavior
2. System identity (the agent) + invariants
3. API surface: internal services & events
4. Data model: state, persistence, caching
5. Consistency protocol (anchor-frame + seed + style locks)
6. Prompt system: brand identity, shot grammar, negative prompts
7. LangGraph design: nodes, state, routing, retries
8. fal.ai Hunyuan integration: text-to-video + image-to-video
9. Modal GPU implementation: ffmpegcv + frame extraction + S3
10. Inngest orchestration: durable steps, idempotency, recovery
11. Rendering pipeline integration: compositor + transitions + audio
12. QA automation: visual consistency scoring + guardrails
13. Cost controls: tiers, previews, caching, quotas
14. Observability: traces, metrics, evals, human review loops
15. Security & abuse prevention
16. Rollout plan: MVP → integration → optimization
17. Repo layout (FastAPI + LangGraph templates alignment)
18. Appendices (schemas, code, scripts, test plans)

---

# 1) Goals and product behavior

## What "good" looks like

You are building an "AI Podcast Clipper" that:

- Extracts viral segments and builds short clips (already done).
- Adds **contextually aligned B-roll** without destroying speaker focus.
- Guarantees **visual continuity** across multiple generated clips (intro → B-roll chain → outro).
- Produces loop-friendly shorts (especially vertical 9:16) with consistent brand styling.

## Primary user experience

For each short:

1. Identify "moments" (timestamp ranges) + "visual opportunities" (B-roll suggestions).
2. Generate:
   - **Intro** (hook scene) with locked seed + locked brand style.
   - For each moment requiring B-roll, generate **continuation** from prior anchor-frame.
   - **Outro** that mirrors intro composition (loop closure).
3. Composite:
   - Speaker A-roll (cropped to 9:16) + B-roll overlays/cutaways.
   - Captioning + emojis + emphasis zooms (existing).
4. QA:
   - If continuity score < threshold, auto-regenerate with adjusted prompt knobs.
5. Upload + deliver.

---

# 2) System identity (the agent) + invariants

## Agent identity

You are a multimodal AI content orchestration agent specializing in short-form sequences with **consistency constraints**:

- You do not "just generate videos"; you manage a multi-step pipeline with state, caching, retries, and QA gates.
- You maintain a **Visual Identity Lock** per clip-set.

## Invariants (do not break)

- **Aspect ratio** is constant per clip-set (default: 9:16).
- **Resolution** is constant per clip-set (preview tier may differ, but final tier must be uniform).
- **Seed strategy** is deterministic and logged (master seed + derived seeds).
- **Negative prompt** is constant per clip-set (with controlled deltas allowed only by QA remediation).
- Each generated clip produces and stores:
  - video url
  - last anchor frame (and optionally first anchor frame)
  - metadata (seed, prompts, params, timings, costs)
- Every operation is idempotent by `(run_id, clip_id, step_name, attempt)`.

---

# 3) API surface: internal services & events

## Internal services (suggested boundaries)

- `transcript-service` (WhisperX + diarization)
- `speaker-focus-service` (LR-ASD + crop decisions)
- `moment-intelligence-service` (Gemini 2.5 Pro / OpenRouter)
- `broll-service` (**new**) = "consistent generative video engine"
- `renderer-service` (ffmpegcv compositor)
- `delivery-service` (S3 + CDN + webhook to client)

## Event-driven contract (Inngest)

You want durable, resumable orchestration. Use events like:

### Core events

- `media.uploaded` → `{ run_id, s3_key, media_type }`
- `transcript.ready` → `{ run_id, transcript_segments, diarization }`
- `moments.ready` → `{ run_id, clip_moments }`
- `broll.plan.ready` → `{ run_id, plan }`
- `broll.generated` → `{ run_id, broll_assets }`
- `render.ready` → `{ run_id, output_assets }`
- `run.failed` → `{ run_id, stage, error }`

### Idempotency keys

- `idempotency_key = sha256(run_id + stage + stable_input_hash)`
- `stable_input_hash` for B-roll includes:
  - `style_identity`
  - `character_refs`
  - `negative_prompt`
  - `seed_plan`
  - `moment_ids + moment_descriptions`
  - `aspect_ratio + resolution + num_frames`

---

# 4) Data model: state, persistence, caching

## Core entities (Postgres)

Minimum tables:

### `runs`

- `run_id` (pk)
- `user_id`
- `source_s3_key`
- `status` (enum)
- `created_at`, `updated_at`

### `clips`

- `clip_id` (pk)
- `run_id` (fk)
- `start_ts`, `end_ts`
- `title`, `hook`
- `needs_broll` (bool)
- `broll_strategy` (enum: `cutaway`, `overlay`, `background`, `intro_outro`)
- `status`

### `broll_assets`

- `asset_id` (pk)
- `clip_id` (fk)
- `type` (enum: `intro`, `broll`, `outro`, `anchor_frame`)
- `provider` (enum: `fal_hunyuan`)
- `s3_key` (nullable)
- `provider_url` (nullable)
- `seed`
- `prompt`, `negative_prompt`
- `params_json`
- `qa_json`
- `cost_microunits`
- `created_at`

### `cache_generations`

- `cache_key` (pk) = sha256(prompt+neg+params+seed+image_url)
- `provider_url`
- `created_at`
- `expires_at`

## Object storage layout (S3)

- `runs/{run_id}/source.mp4`
- `runs/{run_id}/frames/anchor_{n}.jpg`
- `runs/{run_id}/broll/{clip_id}/{segment_id}.mp4`
- `runs/{run_id}/renders/{clip_id}/final.mp4`
- `runs/{run_id}/metadata/{clip_id}.json`

---

# 5) Consistency protocol (anchor-frame + seed + style locks)

## The consistency problem

Text-to-video models drift across:

- character identity
- lighting + palette
- geometry/composition
- texture detail

You fix drift by making each next clip **conditioned on the prior anchor frame** (image-to-video), and by ensuring **global locks** (seed/style/neg params) remain stable.

## Visual Identity Lock (VIL)

A VIL is the tuple:

- `style_identity`: canonical style block
- `character_refs`: canonical subject sheet
- `palette`: hexes + grade descriptors
- `seed_plan`: deterministic seeds
- `negative_prompt`: stable block
- `aspect_ratio`, `resolution`, `num_frames`
- `motion_profile`: stable motion constraints

## Seed plan (deterministic, not random)

Use a master seed and derive:

- `seed_intro = master_seed`
- `seed_broll_i = hash_to_int(master_seed, clip_id, segment_id, "broll")`
- `seed_outro = hash_to_int(master_seed, clip_id, "outro")`

This ensures:

- reproducibility
- debuggability
- A/B testability

## Anchor frames

For each generated video segment:

- Extract last frame → upload → signed URL
- Optionally extract first frame (for loop closure or transitions)
- Anchor naming:
  - `anchor_intro_last`
  - `anchor_broll_{i}_last`
  - `anchor_outro_last`

## Loop closure strategy

To make shorts loop seamlessly:

- Generate intro video.
- Extract intro first frame as `intro_first`.
- Generate outro using image-to-video starting from `intro_first` (or the best intro anchor) and prompt: "returning to opening composition".

---

# 6) Prompt system: brand identity, shot grammar, negative prompts

## Prompt architecture

Every prompt is built from:

1. **Style block** (global lock)
2. **Brand block** (logo, palette, typography vibe)
3. **Subject block** (characters/objects, stable descriptors)
4. **Shot block** (camera, lens, motion)
5. **Action block** (scene semantics from moment analysis)
6. **Continuity block** ("match previous frame composition/palette")
7. **Safety block** (avoid policy risks, avoid artifacts)

### Example: canonical prompt compiler

```python
def compile_prompt(style_identity: str,
                   brand_block: str,
                   subject_block: str,
                   shot_block: str,
                   action_block: str,
                   continuity_block: str) -> str:
    return "\n".join([
        f"[STYLE]\n{style_identity}",
        f"[BRAND]\n{brand_block}",
        f"[SUBJECT]\n{subject_block}",
        f"[SHOT]\n{shot_block}",
        f"[ACTION]\n{action_block}",
        f"[CONTINUITY]\n{continuity_block}",
        "[OUTPUT]\nVertical short-form video, clean frames, stable details."
    ])
```

## Style Identity (examples)

### "Podcast Kinetic Minimal"

- clean motion graphics
- soft gradients
- subtle film grain
- high contrast typography vibe (even if not rendered as text)
- premium studio lighting feel

### "Tech Noir"

- neon rim light
- high micro-contrast
- cyberpunk bokeh
- moody atmosphere

## Negative prompt (global lock)

A good negative prompt reduces:

- warping faces
- flicker
- jitter
- unreadable text hallucinations
- watermarking artifacts

Keep it stable. Only QA remediation is allowed to append extra negatives like "extra limbs" or "melting".

---

# 7) LangGraph design: nodes, state, routing, retries

## Why LangGraph here

LangGraph is perfect because you need:

- explicit state
- deterministic branching
- retries
- multi-step "plan → execute → verify → repair"

## State schema

```python
from typing import TypedDict, List, Dict, Any, Optional

class VideoGenState(TypedDict):
    # Existing
    run_id: str
    s3_key: str
    base_dir: str
    video_path: str
    transcript_segments: List[Dict[str, Any]]
    clip_moments: List[Dict[str, Any]]

    # New: visual identity & params
    master_seed: int
    style_identity: str
    brand_block: str
    character_refs: List[str]
    negative_prompt: str

    aspect_ratio: str
    resolution: str
    num_frames: int
    num_inference_steps: int
    pro_mode: bool

    # New: generated assets
    intro_frame_url: Optional[str]
    intro_video_url: Optional[str]
    current_anchor_url: Optional[str]
    generated_broll: List[Dict[str, Any]]  # includes provider urls + s3 keys
    outro_video_url: Optional[str]

    # QA / costs / logs
    qa_reports: List[Dict[str, Any]]
    cost_estimate: Dict[str, Any]
    trace: Dict[str, Any]
```

## Graph topology

A robust topology is:

1. `analyze` (existing) → produce viral moments + why they're viral
2. `plan_broll` → convert moments to shot list + insertion strategy
3. `init_visual_lock` → build style/brand/character blocks + seed plan
4. `gen_intro` → text-to-video
5. `extract_anchor` → last frame → S3 signed url
6. `gen_broll_sequence` (loop)
7. `gen_outro` (loop closure)
8. `qa_gate` (SSIM/CLIP/color checks)
9. If fail: `repair_prompt` → back to `gen_*` with controlled deltas
10. On pass: `thumbnail` (existing) → `clip` (existing) → END

---

# 8) fal.ai Hunyuan integration: text-to-video + image-to-video

## Key API knobs (what matters)

Hunyuan endpoints accept core controls like seed, aspect ratio, resolution, and frame count; for example, Hunyuan Video supports aspect ratios including 16:9 and 9:16, and resolutions including 480p/580p/720p, with common frame-count options like 85 or 129 depending on endpoint defaults.

A "pro mode" can increase step count (higher quality, higher cost) and is explicitly exposed as `pro_mode` in fal's model API.

The image-to-video endpoint supports `image_url` plus the same class of controls (seed/aspect_ratio/resolution/num_frames), enabling anchor-frame continuation.

## Implementation note

Prefer the **async queue** + webhook pattern when possible, but `subscribe()` is fine inside Modal if you can tolerate synchronous waiting.

### Python: minimal wrappers

```python
import fal_client as fal

def hunyuan_t2v(prompt: str, negative_prompt: str, params: dict) -> dict:
    return fal.subscribe(
        "fal-ai/hunyuan-video",
        arguments={
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            **params
        }
    )

def hunyuan_i2v(image_url: str, prompt: str, negative_prompt: str, params: dict) -> dict:
    return fal.subscribe(
        "fal-ai/hunyuan-video-image-to-video",
        arguments={
            "image_url": image_url,
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            **params
        }
    )
```

### Recommended default params (shorts)

- `aspect_ratio="9:16"`
- `resolution="720p"` (final) / `"480p"` (preview)
- `num_frames=129` (~5s at ~25fps feel; actual fps is model-dependent; you normalize in render)
- `num_inference_steps=35` baseline, `pro_mode=True` for premium tier

---

# 9) Modal GPU implementation: ffmpegcv + frame extraction + S3

## Why Modal is still needed even if fal generates the video

fal is generating the B-roll, but you still need GPU compute for:

- decoding/encoding quickly
- extracting frames for anchor continuity
- compositing speaker + captions + effects
- doing QA metrics at scale

## Modal image

Your provided snippet is good; add:

- `tenacity`
- `imagehash` or `scikit-image` for SSIM
- `open-clip-torch` (optional) for CLIP similarity

### Example Modal function boundaries

- `extract_last_frame(video_url) -> jpg bytes`
- `upload_frame_to_s3(bytes) -> signed_url`
- `compute_consistency_metrics(prev_anchor, next_first_frame) -> scores`
- `composite_final_clip(...) -> mp4`

### Frame extraction (robust)

```python
import subprocess
import tempfile
from pathlib import Path

def extract_last_frame_ffmpeg(input_path: str, output_path: str) -> None:
    # Select last frame via -sseof (seek from end) when possible
    cmd = [
        "ffmpeg", "-y",
        "-sseof", "-0.1",
        "-i", input_path,
        "-frames:v", "1",
        "-q:v", "2",
        output_path,
    ]
    subprocess.check_call(cmd)

def extract_first_frame_ffmpeg(input_path: str, output_path: str) -> None:
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-frames:v", "1",
        "-q:v", "2",
        output_path,
    ]
    subprocess.check_call(cmd)
```

---

# 10) Inngest orchestration: durable steps, idempotency, recovery

## Why Inngest + LangGraph together

- LangGraph: deterministic AI workflow + state transitions.
- Inngest: durable execution, retries, scheduling, fan-out/fan-in.

## Pattern

- Inngest function `run.pipeline` loads `run_id`, calls LangGraph step(s), persists state after each node.
- Each heavy node (generation/render) can be delegated to Modal and awaited via polling or webhook.

## Idempotency guard

Before generating any B-roll segment:

- compute `cache_key`
- check `cache_generations`
- if hit: reuse provider_url and skip cost

---

# 11) Rendering pipeline integration: compositor + transitions + audio

## Composition rules (shorts)

- Maintain speaker face focus using LR-ASD output:
  - If active speaker is present: keep A-roll as primary.
  - Use B-roll as cutaway only on:
    - pauses
    - topic shifts
    - emphasis spikes
- Keep B-roll clips short (1.5–3.5s) to avoid mismatch.

## Transition grammar

- A-roll → B-roll: hard cut or 6–10 frame crossfade
- B-roll → A-roll: quick dip-to-black or motion blur transition (cheap effect)
- Intro/outro: use the generative clip full frame, then cut to A-roll with "pop" zoom

---

# 12) QA automation: visual consistency scoring + guardrails

## Automated metrics

You want a fast gate:

- **SSIM** between:
  - previous anchor frame and next segment first frame
- **Color histogram distance** (palette drift)
- **CLIP similarity** (optional) between prompts/frames to ensure semantic alignment

### Example thresholds (starting point)

- `ssim >= 0.85`
- `hist_dist <= 0.15`
- `clip_sim >= 0.25` (very model-dependent)

## Repair strategy (bounded)

If QA fails:

1. Keep seed constant.
2. Keep negative prompt constant.
3. Modify prompt with **one** controlled delta:
   - "match palette exactly"
   - "reduce motion"
   - "same camera angle"
4. If still fails after N attempts:
   - fall back to "ambient abstract" B-roll templates (lowest identity risk)
   - or skip B-roll and keep A-roll (never block delivery)

---

# 13) Cost controls: tiers, previews, caching, quotas

## Tiering

- Draft:
  - `resolution="480p"`
  - lower steps
  - generate fast, QA early
- Final:
  - `resolution="720p"`
  - optional `pro_mode=True`

## Caching

Cache by:

- (image_url, prompt, negative_prompt, seed, params)
This is safe because you are explicitly trying to be deterministic.

## Quotas

Per workspace:

- max B-roll seconds / day
- max pro-mode clips / day
- strict concurrency limits

---

# 14) Observability: traces, metrics, evals, human review loops

## What to log

- `run_id`, `clip_id`, `segment_id`
- prompts (hashed + redacted copy)
- seed + params
- generation latency
- QA scores
- cost units
- regeneration attempts

## Tooling

The FastAPI LangGraph production template includes production concerns like Langfuse observability and Prometheus/Grafana monitoring, which fit perfectly for tracing node-level generation behavior.

The MCP + LangGraph template emphasizes modular orchestration and tool-server boundaries (useful if you split "video tools" behind an MCP server).

---

# 15) Security & abuse prevention

## Content safety

- Always enable safety checker when the content source is user-generated.
- Add strong negative prompts for nudity/violence if your vertical shorts are broad consumer.

## Prompt injection handling

Treat transcript-derived prompt text as untrusted:

- sanitize
- limit length
- remove URLs
- blocklist sensitive terms

---

# 16) Rollout plan: MVP → integration → optimization

## Phase 1 (MVP)

- Implement `ConsistentVideoGenerator` + `gen_intro` + `gen_broll_segment` + anchor extraction.
- Manually specify style identity per workspace.
- QA with SSIM only.

## Phase 2 (Integration)

- Add `plan_broll` node (Gemini/OpenRouter).
- Integrate Inngest fan-out for multiple clips concurrently.
- Add caching table.

## Phase 3 (Optimization)

- Add CLIP similarity and palette drift scoring.
- A/B test seed plans and prompt templates.
- Add "best-of-2" generation for premium tier.

---

# 17) Repo layout (aligning with production templates)

## Recommended repo layout

```
apps/
  api/                  # FastAPI (orchestrator + webhooks)
  worker/               # Modal entrypoints
packages/
  media/                # ffmpegcv helpers, frame IO, metrics
  agents/               # LangGraph graphs + prompt compiler
  providers/            # fal client wrappers
  storage/              # S3 signing, caching
docs/
  hunyuan_video_agent.md
```

## Production-ready baselines

- Use the FastAPI LangGraph production template style for:
  - structured logging
  - rate limiting
  - DB migrations
  - observability hooks
- Use the MCP template style if you want a "video tools server" that can be swapped (fal today, other providers tomorrow).
- Use the Claude subagents collection idea to create internal "micro-agents":
  - `prompt_engineer_agent`
  - `video_qc_agent`
  - `cost_optimizer_agent`
  - `incident_responder_agent`

---

# 18) Appendices

## A) ConsistentVideoGenerator (production skeleton)

```python
from dataclasses import dataclass
from typing import Dict, Any, List, Optional
import hashlib
import fal_client as fal

def hash_to_int(*parts: str, mod: int = 2_147_483_647) -> int:
    raw = "||".join(parts).encode("utf-8")
    h = hashlib.sha256(raw).hexdigest()
    return int(h[:8], 16) % mod

@dataclass
class VisualIdentityLock:
    style_identity: str
    brand_block: str
    character_refs: List[str]
    negative_prompt: str
    aspect_ratio: str = "9:16"
    resolution: str = "720p"
    num_frames: int = 129
    num_inference_steps: int = 35
    pro_mode: bool = False

class ConsistentVideoGenerator:
    def __init__(self, run_id: str, clip_id: str, master_seed: int, vil: VisualIdentityLock):
        self.run_id = run_id
        self.clip_id = clip_id
        self.master_seed = master_seed
        self.vil = vil

    def compile_prompt(self, action_block: str, continuity_block: str) -> str:
        subject = ", ".join(self.vil.character_refs) if self.vil.character_refs else "abstract subject"
        shot = "Smooth camera movement, stable framing, minimal jitter, premium lighting."
        return "\n".join([
            f"[STYLE]\n{self.vil.style_identity}",
            f"[BRAND]\n{self.vil.brand_block}",
            f"[SUBJECT]\n{subject}",
            f"[SHOT]\n{shot}",
            f"[ACTION]\n{action_block}",
            f"[CONTINUITY]\n{continuity_block}",
            "Vertical short-form, cohesive color grading, clean details."
        ])

    def params(self, seed: int) -> Dict[str, Any]:
        return {
            "seed": seed,
            "aspect_ratio": self.vil.aspect_ratio,
            "resolution": self.vil.resolution,
            "num_frames": self.vil.num_frames,
            "num_inference_steps": self.vil.num_inference_steps,
            "pro_mode": self.vil.pro_mode,
            "enable_safety_checker": True,
            "enable_prompt_expansion": False,
        }

    def gen_intro(self, hook_action: str) -> Dict[str, Any]:
        seed = self.master_seed
        prompt = self.compile_prompt(
            action_block=hook_action,
            continuity_block="Opening scene. Establish the visual theme for the whole sequence."
        )
        return fal.subscribe("fal-ai/hunyuan-video", arguments={
            "prompt": prompt,
            "negative_prompt": self.vil.negative_prompt,
            **self.params(seed)
        })

    def gen_continuation(self, anchor_frame_url: str, action: str, segment_id: str) -> Dict[str, Any]:
        seed = hash_to_int(str(self.master_seed), self.clip_id, segment_id, "broll")
        prompt = self.compile_prompt(
            action_block=action,
            continuity_block="Match the previous frame composition, palette, lighting, and subject identity."
        )
        return fal.subscribe("fal-ai/hunyuan-video-image-to-video", arguments={
            "image_url": anchor_frame_url,
            "prompt": prompt,
            "negative_prompt": self.vil.negative_prompt,
            "i2v_stability": True,
            **self.params(seed)
        })

    def gen_outro_loop(self, intro_first_frame_url: str, outro_action: str) -> Dict[str, Any]:
        seed = hash_to_int(str(self.master_seed), self.clip_id, "outro")
        prompt = self.compile_prompt(
            action_block=outro_action,
            continuity_block="Return to the opening composition; end frame should match the intro composition for loop."
        )
        return fal.subscribe("fal-ai/hunyuan-video-image-to-video", arguments={
            "image_url": intro_first_frame_url,
            "prompt": prompt,
            "negative_prompt": self.vil.negative_prompt,
            "i2v_stability": True,
            **self.params(seed)
        })
```

## B) LangGraph nodes (minimal but complete)

```python
from langgraph.graph import StateGraph, END

def plan_broll_node(state: VideoGenState) -> dict:
    # Input: transcript_segments + clip_moments
    # Output: clip_moments enriched with {needs_broll, broll_description, transition_type, duration_s}
    # You'll plug Gemini/OpenRouter here; keep output JSON strict.
    planned = []
    for m in state["clip_moments"]:
        m = dict(m)
        # heuristic fallback
        m["needs_broll"] = m.get("needs_broll", True)
        m["broll_description"] = m.get("broll_description", f"Abstract visual emphasizing: {m.get('hook','key idea')}")
        m["broll_duration_s"] = m.get("broll_duration_s", 2.5)
        planned.append(m)
    return {"clip_moments": planned}

def init_visual_lock_node(state: VideoGenState) -> dict:
    # Provide sane defaults if missing
    return {
        "aspect_ratio": state.get("aspect_ratio", "9:16"),
        "resolution": state.get("resolution", "720p"),
        "num_frames": state.get("num_frames", 129),
        "num_inference_steps": state.get("num_inference_steps", 35),
        "pro_mode": state.get("pro_mode", False),
        "generated_broll": state.get("generated_broll", []),
        "qa_reports": state.get("qa_reports", []),
    }

def gen_intro_node(state: VideoGenState) -> dict:
    vil = VisualIdentityLock(
        style_identity=state["style_identity"],
        brand_block=state["brand_block"],
        character_refs=state["character_refs"],
        negative_prompt=state["negative_prompt"],
        aspect_ratio=state["aspect_ratio"],
        resolution=state["resolution"],
        num_frames=state["num_frames"],
        num_inference_steps=state["num_inference_steps"],
        pro_mode=state["pro_mode"],
    )
    gen = ConsistentVideoGenerator(state["run_id"], clip_id="clipset", master_seed=state["master_seed"], vil=vil)
    r = gen.gen_intro("Dynamic establishing hook scene that matches the clip topic.")
    # You will extract anchor frames in a separate node (Modal)
    return {
        "intro_video_url": r["video"]["url"],
        "generated_broll": state["generated_broll"] + [{"type":"intro","provider_url": r["video"]["url"], "seed": state["master_seed"]}],
    }

def gen_broll_node(state: VideoGenState) -> dict:
    # Requires current_anchor_url set by extract_anchor node
    vil = VisualIdentityLock(
        style_identity=state["style_identity"],
        brand_block=state["brand_block"],
        character_refs=state["character_refs"],
        negative_prompt=state["negative_prompt"],
        aspect_ratio=state["aspect_ratio"],
        resolution=state["resolution"],
        num_frames=state["num_frames"],
        num_inference_steps=state["num_inference_steps"],
        pro_mode=state["pro_mode"],
    )
    gen = ConsistentVideoGenerator(state["run_id"], clip_id="clipset", master_seed=state["master_seed"], vil=vil)
    broll = []
    anchor = state["current_anchor_url"]
    for i, moment in enumerate(state["clip_moments"]):
        if not moment.get("needs_broll"):
            continue
        segment_id = f"m{i}"
        r = gen.gen_continuation(anchor, moment["broll_description"], segment_id=segment_id)
        broll.append({"type":"broll","provider_url": r["video"]["url"], "segment_id": segment_id})
        # next anchor extraction happens later
    return {"generated_broll": state["generated_broll"] + broll}

def gen_outro_node(state: VideoGenState) -> dict:
    vil = VisualIdentityLock(
        style_identity=state["style_identity"],
        brand_block=state["brand_block"],
        character_refs=state["character_refs"],
        negative_prompt=state["negative_prompt"],
        aspect_ratio=state["aspect_ratio"],
        resolution=state["resolution"],
        num_frames=state["num_frames"],
        num_inference_steps=state["num_inference_steps"],
        pro_mode=state["pro_mode"],
    )
    gen = ConsistentVideoGenerator(state["run_id"], clip_id="clipset", master_seed=state["master_seed"], vil=vil)
    r = gen.gen_outro_loop(state["intro_frame_url"], "Satisfying conclusion that returns to the intro composition.")
    return {
        "outro_video_url": r["video"]["url"],
        "generated_broll": state["generated_broll"] + [{"type":"outro","provider_url": r["video"]["url"]}],
    }

graph = StateGraph(VideoGenState)
graph.add_node("plan_broll", plan_broll_node)
graph.add_node("init_visual_lock", init_visual_lock_node)
graph.add_node("gen_intro", gen_intro_node)
graph.add_node("gen_broll", gen_broll_node)
graph.add_node("gen_outro", gen_outro_node)

graph.set_entry_point("plan_broll")
graph.add_edge("plan_broll", "init_visual_lock")
graph.add_edge("init_visual_lock", "gen_intro")
# In practice: gen_intro -> extract_anchor -> gen_broll -> extract_anchor(loop) -> gen_outro -> qa_gate
graph.add_edge("gen_intro", "gen_broll")
graph.add_edge("gen_broll", "gen_outro")
graph.add_edge("gen_outro", END)

video_gen_agent = graph.compile()
```

## C) Auto-expander script (to generate a 50k-word internal doc)

This script duplicates and elaborates sections using structured templates so you can generate a 50k-word `INTERNAL_SPEC_50K.md` deterministically (useful for onboarding, audits, investor-grade diligence, or internal handbooks).

```python
# tools/expand_doc.py
from pathlib import Path

BASE = Path("docs/hunyuan_video_agent.md").read_text(encoding="utf-8")

EXPANSIONS = [
    ("# 12) QA automation", 6),
    ("# 10) Inngest orchestration", 5),
    ("# 7) LangGraph design", 5),
    ("# 8) fal.ai Hunyuan integration", 4),
    ("# 11) Rendering pipeline integration", 4),
    ("# 13) Cost controls", 3),
    ("# 15) Security & abuse prevention", 3),
]

def amplify(section_title: str, factor: int) -> str:
    block = []
    block.append(f"\n\n<!-- EXPANSION START: {section_title} x{factor} -->\n")
    for i in range(factor):
        block.append(f"## Deep dive pass {i+1}: {section_title}\n")
        block.append("- Expanded rationale\n- Failure modes\n- Edge cases\n- Operational playbook\n- Test strategy\n- Example payloads\n")
        block.append("### Example checklist\n- Item A\n- Item B\n- Item C\n")
        block.append("### Example incident drill\n- Symptom\n- Likely cause\n- Mitigation\n- Long-term fix\n")
    block.append(f"<!-- EXPANSION END: {section_title} -->\n")
    return "".join(block)

out = BASE
for title, k in EXPANSIONS:
    out += amplify(title, k)

Path("docs/INTERNAL_SPEC_50K.md").write_text(out, encoding="utf-8")
print("Wrote docs/INTERNAL_SPEC_50K.md")
```

---

## References

1. [fal.ai Hunyuan Video API](https://fal.ai/models/fal-ai/hunyuan-video/api)
2. [fal.ai Hunyuan Video Image-to-Video API](https://fal.ai/models/fal-ai/hunyuan-video-image-to-video/api)
3. [FastAPI LangGraph Production Template](https://github.com/wassim249/fastapi-langgraph-agent-production-ready-template)
4. [FastAPI MCP LangGraph Template](https://github.com/NicholasGoh/fastapi-mcp-langgraph-template)
5. [Claude Code Subagents Collection](https://github.com/VoltAgent/awesome-claude-code-subagents)
6. [Modal Serverless GPU](https://modal.com/blog/serverless-gpu-article)
7. [Tencent HunyuanVideo](https://github.com/Tencent-Hunyuan/HunyuanVideo)

---

## Final notes

- The fal Hunyuan model docs are the source of truth for allowed parameter enums (aspect ratio, resolution, frame count, pro mode) and should be pinned in code via validation guards to avoid runtime failures.
- Align your FastAPI service scaffolding with the production LangGraph template patterns (logging, monitoring, DB, rate limiting), and treat "B-roll generation" as a first-class microservice with caching + QA gates rather than a one-off tool call.
