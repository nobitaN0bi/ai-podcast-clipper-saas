#!/usr/bin/env python3
"""
Local test script to verify the LangGraph analysis_node flow.
Tests OpenRouter API connection with LangChain ChatOpenAI.

Run: cd ai-podcast-clipper-backend && ./venv/bin/python test_langgraph_flow.py
"""

import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

print("=" * 60)
print("LOCAL LANGGRAPH FLOW TEST")
print("=" * 60)

# Check env vars
api_key = os.environ.get("OPENROUTER_API_KEY")
print(f"\n1. OPENROUTER_API_KEY present: {bool(api_key)}")
if api_key:
    print(f"   Key starts with: {api_key[:15]}...")
else:
    print("   ERROR: OPENROUTER_API_KEY not found!")
    exit(1)

# Test LangChain ChatOpenAI with OpenRouter
print("\n2. Testing LangChain ChatOpenAI with OpenRouter...")

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# Use a working free model (gemini might be rate-limited)
MODEL = "google/gemini-2.0-flash-exp:free"
# Fallback model if gemini is rate-limited
FALLBACK_MODEL = "mistralai/devstral-2512:free"

def test_llm(model_name):
    print(f"\n   Testing model: {model_name}")
    try:
        llm = ChatOpenAI(
            model=model_name,
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1"
        )
        
        # Simulate the analysis prompt (simplified)
        mock_transcript = [
            {"start": 0.0, "end": 5.0, "word": "Hello"},
            {"start": 5.0, "end": 10.0, "word": "world"},
            {"start": 10.0, "end": 30.0, "word": "This is a test segment about AI"},
            {"start": 30.0, "end": 60.0, "word": "Another interesting topic here"},
        ]
        
        prompt = """
        You are an expert video editor. Analyze the following transcript segments.
        Identify 1-2 "viral moments" that would work well as short-form vertical videos.
        Output: Valid JSON list of objects: [{"start": 10.5, "end": 45.2, "topic": "Description"}]
        
        Transcript: 
        """ + json.dumps(mock_transcript)
        
        messages = [
            SystemMessage(content="You are a JSON-only API. Output ONLY valid JSON."),
            HumanMessage(content=prompt)
        ]
        
        print("   Invoking LLM...")
        response = llm.invoke(messages)
        print(f"   ✓ Response received!")
        print(f"   Content: {response.content[:200]}...")
        
        # Try to parse JSON
        content = response.content.replace("```json", "").replace("```", "").strip()
        moments = json.loads(content)
        print(f"   ✓ Parsed {len(moments)} clip moments from response")
        return True
        
    except Exception as e:
        print(f"   ✗ Error: {str(e)[:100]}")
        if "429" in str(e):
            print("   (Rate limited - this is expected for free models)")
        return False

    # Models matching agents.py
    models_to_try = [
        "google/gemini-2.0-flash-exp:free",
        "mistralai/devstral-2512:free"
    ]
    
    success = False
    
    for model_name in models_to_try:
        if test_llm(model_name):
            success = True
            break
            
    print("\n" + "=" * 60)
    print("RESULT")
    print("=" * 60)
    if success:
        print("✓ LangGraph flow test PASSED - Ready to deploy!")
    else:
        print("✗ LangGraph flow test FAILED - All models failed")
