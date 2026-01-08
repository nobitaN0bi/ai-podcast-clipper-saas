from typing import List, Optional
from pydantic_settings import BaseSettings

class PolarConfig(BaseSettings):
    POLAR_ACCESS_TOKEN: str
    POLAR_ORGANIZATION_ID: Optional[str] = None
    POLAR_WEBHOOK_SECRET: Optional[str] = None
    POLAR_CHECKOUT_SUCCESS_URL: str = "http://localhost:3000/dashboard?checkout=success"
    
    # Product IDs for plans matching frontend
    POLAR_PRODUCT_ID_CREATOR: Optional[str] = None
    POLAR_PRODUCT_ID_AGENCY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"

polar_settings = PolarConfig()
