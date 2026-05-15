import hashlib
import time

from fastapi import HTTPException

from app.core.config import settings
from app.schemas.upload import UploadSignatureResponse


def create_cloudinary_signature(folder: str = "reddit-clone") -> UploadSignatureResponse:
    if not (
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    ):
        raise HTTPException(status_code=503, detail="Cloudinary is not configured")

    timestamp = int(time.time())
    payload = f"folder={folder}&timestamp={timestamp}{settings.cloudinary_api_secret}"
    signature = hashlib.sha1(payload.encode("utf-8")).hexdigest()
    return UploadSignatureResponse(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        timestamp=timestamp,
        folder=folder,
        signature=signature,
    )
