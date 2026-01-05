from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from typing import Any
import structlog

from src.marketplace.schemas import (
    CheckoutSessionRequest, 
    CheckoutSessionResponse,
    SubscriptionResponse,
    SubscriptionCancelRequest
)
from src.marketplace.service import polar_service
from src.marketplace.dependencies import verify_webhook_signature
from src.marketplace.exceptions import PolarIntegrationError

logger = structlog.get_logger()

# Create router
router = APIRouter(prefix="/api/polar", tags=["Marketplace"])

@router.post("/checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(request: CheckoutSessionRequest):
    """
    Create a checkout session for a product.
    """
    try:
        session = await polar_service.create_checkout_session(
            product_id=request.product_id,
            email=request.email,
            success_url=request.success_url
        )
        return session
    except PolarIntegrationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/subscription/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(subscription_id: str):
    """
    Get details of a subscription.
    """
    try:
        subscription = await polar_service.get_subscription(subscription_id)
        return subscription
    except PolarIntegrationError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

@router.post("/cancel", response_model=bool)
async def cancel_subscription(request: SubscriptionCancelRequest):
    """
    Cancel a subscription.
    """
    try:
        success = await polar_service.cancel_subscription(request.subscription_id)
        return success
    except PolarIntegrationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/webhook")
async def handle_webhook(
    background_tasks: BackgroundTasks,
    payload: dict = Depends(verify_webhook_signature)
):
    """
    Handle Polar webhooks.
    """
    event_type = payload.get("type")
    data = payload.get("data", {})
    
    logger.info("Received Polar webhook", event_type=event_type, id=payload.get("id"))
    
    # Process webhook asynchronously in background
    # TODO: Implement actual event handlers (DB updates, etc.)
    # background_tasks.add_task(process_webhook_event, event_type, data)
    
    return {"status": "received"}
