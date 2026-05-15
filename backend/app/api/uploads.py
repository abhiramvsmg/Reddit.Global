from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.models import User
from app.schemas.upload import UploadSignatureResponse
from app.services.uploads import create_cloudinary_signature

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/cloudinary-signature", response_model=UploadSignatureResponse)
def cloudinary_signature(_: User = Depends(get_current_user)):
    return create_cloudinary_signature()
