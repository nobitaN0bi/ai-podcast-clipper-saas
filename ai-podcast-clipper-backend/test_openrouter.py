#!/usr/bin/env python3
"""
Test script to verify OpenRouter API connectivity locally.
Run: python test_openrouter.py
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def test_openrouter_langchain():
    """Test OpenRouter using LangChain's ChatOpenAI (current approach in agents.py)"""
    print("=" * 60)
    print("TEST 1: Using LangChain ChatOpenAI with OpenRouter")
    print("=" * 60)
    
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage, HumanMessage
    
    api_key = os.environ.get("OPENROUTER_API_KEY")
    print(f"OPENROUTER_API_KEY present: {bool(api_key)}")
    if api_key:
        print(f"OPENROUTER_API_KEY length: {len(api_key)}")
        print(f"OPENROUTER_API_KEY first 10 chars: {api_key[:10]}...")
    else:
        print("ERROR: OPENROUTER_API_KEY not found in environment!")
        return False
    
    try:
        llm = ChatOpenAI(
            model="google/gemini-2.0-flash-exp:free", 
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1"
        )
        print("LLM initialized successfully")
        
        messages = [
            SystemMessage(content="You are a JSON-only API."),
            HumanMessage(content="Say hello in JSON format: {\"greeting\": \"hello\"}")
        ]
        
        print("Invoking LLM...")
        response = llm.invoke(messages)
        print(f"Response received!")
        print(f"Content: {response.content}")
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_openrouter_direct():
    """Test OpenRouter using direct HTTP requests"""
    print("\n" + "=" * 60)
    print("TEST 2: Using Direct HTTP Request to OpenRouter")
    print("=" * 60)
    
    import requests
    
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("ERROR: OPENROUTER_API_KEY not found!")
        return False
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",  # Required by some models
                "X-Title": "AI Podcast Clipper"  # Optional
            },
            json={
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [
                    {"role": "user", "content": "Say hello in JSON: {\"greeting\": \"hello\"}"}
                ]
            }
        )
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_env_vars():
    """Check all required environment variables"""
    print("\n" + "=" * 60)
    print("TEST 0: Environment Variables Check")
    print("=" * 60)
    
    vars_to_check = [
        "OPENROUTER_API_KEY",
        "S3_BUCKET_NAME",
        "AWS_ACCESS_KEY_ID", 
        "AWS_SECRET_ACCESS_KEY",
        "AWS_REGION",
        "AUTH_TOKEN"
    ]
    
    for var in vars_to_check:
        value = os.environ.get(var)
        if value:
            # Mask sensitive values
            masked = value[:4] + "..." + value[-4:] if len(value) > 10 else "****"
            print(f"  ✓ {var}: {masked}")
        else:
            print(f"  ✗ {var}: NOT SET")


if __name__ == "__main__":
    print("\n🔍 OpenRouter API Test Suite\n")
    
    test_env_vars()
    
    success1 = test_openrouter_langchain()
    success2 = test_openrouter_direct()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"LangChain ChatOpenAI: {'✓ PASSED' if success1 else '✗ FAILED'}")
    print(f"Direct HTTP Request:  {'✓ PASSED' if success2 else '✗ FAILED'}")
