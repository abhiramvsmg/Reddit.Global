from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import time

logger = logging.getLogger("app")

class GlobalExceptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            start_time = time.time()
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Optional: Log request details
            # logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time:.4f}s)")
            
            return response
        except Exception as e:
            logger.exception(f"Unhandled exception: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": "An internal server error occurred. Please try again later.",
                    "error_type": type(e).__name__
                }
            )

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler("backend.log")
        ]
    )
