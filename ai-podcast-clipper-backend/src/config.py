from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Add any specific env vars here if needed, for now just placeholder
    # In Modal, env vars are often passed via modal.Secret
    pass

settings = Settings()
