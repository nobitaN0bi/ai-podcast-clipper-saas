from fastapi import Header, HTTPException, status, Request
from src.marketplace.exceptions import InvalidWebhookSignature
from src.marketplace.service import polar_service
import json

async def verify_webhook_signature(request: Request, webhook_signature: str = Header(None)):
    """
    Dependency to verify Polar webhook signature.
    """
    if not webhook_signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing webhook signature"
        )
    
    # We need the raw body for verification
    body_bytes = await request.body()
    payload = body_bytes.decode("utf-8")
    
    # Extract headers needed for verification
    # Using request.headers to pass all headers, let service extract what it needs
    # Or explicitly pass the signature header depending on library requirements
    # StandardWebhooks usually verifies against the signature header and payload
    
    try:
        # Pass headers as dict
        polar_service.validate_webhook_signature(payload, dict(request.headers))
    except InvalidWebhookSignature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook verification failed: {str(e)}"
        )
    
    # Return payload if needed, or just allow request to proceed
    return json.loads(payload)
