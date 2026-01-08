from pydantic import BaseModel

class ProcessVideoRequest(BaseModel):
    s3_key: str
    burn_captions: bool = False

class RenderVideoRequest(BaseModel):
    s3_key: str
    trim_start: float
    trim_end: float
    aspect_ratio: str # "9:16", "16:9", "1:1"
    burn_captions: bool = False
