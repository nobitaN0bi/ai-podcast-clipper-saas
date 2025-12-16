from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# --- Checkout Schemas ---

class CheckoutSessionRequest(BaseModel):
    product_id: str
    email: Optional[str] = None
    success_url: Optional[str] = None

class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str

# --- Subscription Schemas ---

class SubscriptionResponse(BaseModel):
    id: str
    status: str
    current_period_end: Optional[str] = None
    cancel_at_period_end: bool
    product_name: Optional[str] = None
    amount_currency: Optional[str] = None
    amount_amount: Optional[int] = None

class SubscriptionCancelRequest(BaseModel):
    subscription_id: str

# --- Webhook Schemas ---

class WebhookEventWrapper(BaseModel):
    type: str # e.g. "subscription.active"
    data: Dict[str, Any]
    id: str
    created_at: str

class CustomerPortalRequest(BaseModel):
    customer_id: str
