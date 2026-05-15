from pydantic import BaseModel


class UploadSignatureResponse(BaseModel):
    cloud_name: str
    api_key: str
    timestamp: int
    folder: str
    signature: str
