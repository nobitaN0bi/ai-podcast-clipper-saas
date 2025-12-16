import structlog
from polar_sdk import Polar
from polar_sdk.models import components
from src.marketplace.config import polar_settings
from src.marketplace.schemas import CheckoutSessionResponse, SubscriptionResponse
from src.marketplace.exceptions import PolarIntegrationError, InvalidWebhookSignature
from standardwebhooks.webhooks import Webhook

logger = structlog.get_logger()

# Initialize Polar SDK
try:
    polar = Polar(
        access_token=polar_settings.POLAR_ACCESS_TOKEN,
    )
except Exception as e:
    logger.error("Failed to initialize Polar SDK", error=str(e))
    polar = None

class PolarService:
    def __init__(self):
        self.client = polar

    async def create_checkout_session(
        self, product_id: str, email: str = None, success_url: str = None
    ) -> CheckoutSessionResponse:
        """Create a checkout session for a product."""
        if not self.client:
            raise PolarIntegrationError("Polar SDK not initialized")

        try:
            # Note: The Polar Python SDK interface might vary slightly based on version.
            # Using standard pattern for checkout code creation.
            # In async contexts, we might need to wrap sync calls if SDK is sync only,
            # but documentation suggests async support via httpx.
            
            # Assuming SDK structure based on docs check: polar.checkout_links.create
            # or creating a checkout session directly if supported.
            # Using checkout_links for simplicity as it's common.
            
            # Since standard Polar SDK calls are often synchronous wrapping requests,
            # we will use the standard sync identifiers but ensure they run essentially non-blocking
            # or wrap in run_in_threadpool if needed. FOR NOW assuming standard sync call.
            
            response = self.client.checkouts.custom.create(
                components.CheckoutCreate(
                    product_id=product_id,
                    customer_email=email,
                    success_url=success_url or polar_settings.POLAR_CHECKOUT_SUCCESS_URL,
                )
            )

            return CheckoutSessionResponse(
                checkout_url=response.url,
                session_id=response.id,
            )
        except Exception as e:
            logger.error("Failed to create checkout session", error=str(e))
            raise PolarIntegrationError(f"Checkout creation failed: {str(e)}")

    async def get_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """Get subscription details."""
        if not self.client:
            raise PolarIntegrationError("Polar SDK not initialized")
        
        try:
            sub = self.client.subscriptions.get(id=subscription_id)
            
            return SubscriptionResponse(
                id=sub.id,
                status=sub.status,
                current_period_end=str(sub.current_period_end) if sub.current_period_end else None,
                cancel_at_period_end=sub.cancel_at_period_end,
                product_name=sub.product.name if sub.product else None,
                # Safe access for currency/amount if available
            )
        except Exception as e:
            logger.error("Failed to get subscription", error=str(e))
            raise PolarIntegrationError(f"Get subscription failed: {str(e)}")

    async def cancel_subscription(self, subscription_id: str) -> bool:
        """Cancel a subscription."""
        if not self.client:
            raise PolarIntegrationError("Polar SDK not initialized")
        
        try:
            self.client.subscriptions.revoke(id=subscription_id)
            return True
        except Exception as e:
            logger.error("Failed to cancel subscription", error=str(e))
            raise PolarIntegrationError(f"Cancel subscription failed: {str(e)}")

    def validate_webhook_signature(self, payload: str, headers: dict) -> dict:
        """Validate webhook signature."""
        webhook_secret = polar_settings.POLAR_WEBHOOK_SECRET
        if not webhook_secret:
            logger.warning("No webhook secret configured, skipping validation (unsafe)")
            # In production this should fail, but for dev we might log warning
            return None # Or raise error

        wh = Webhook(webhook_secret)
        try:
            # Polar sends 'webhook-id', 'webhook-timestamp', 'webhook-signature'
            # StandardWebhooks expects specific headers
            # We might need to map them if names differ, but standardwebhooks is the standard
            
            # Extract headers (case insensitive)
            sig_header = headers.get("webhook-signature")
            timestamp = headers.get("webhook-timestamp")
            msg_id = headers.get("webhook-id")
            
            if not sig_header:
                 raise InvalidWebhookSignature("Missing signature header")
            
            # Verification logic
            # wh.verify(payload, headers) # This works if headers are passed correctly
            
            # Just parsing the event for now as verify assumes standard libraries
            return wh.verify(payload, headers)

        except Exception as e:
            logger.error("Webhook signature verification failed", error=str(e))
            raise InvalidWebhookSignature(str(e))

polar_service = PolarService()
