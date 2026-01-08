class MarketplaceError(Exception):
    """Base exception for marketplace errors."""
    pass

class PolarIntegrationError(MarketplaceError):
    """Raised when interaction with Polar API fails."""
    pass

class InvalidWebhookSignature(MarketplaceError):
    """Raised when webhook signature verification fails."""
    pass

class SubscriptionNotFound(MarketplaceError):
    """Raised when a subscription cannot be found."""
    pass

class ProductNotFound(MarketplaceError):
    """Raised when a product ID is invalid."""
    pass
