"""
Error handling middleware for FastAPI
T017: Create API error handling middleware
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
from typing import Union

logger = logging.getLogger(__name__)


async def error_handler_middleware(request: Request, call_next):
    """
    Global error handling middleware

    Catches all unhandled exceptions and returns consistent error responses
    """
    try:
        response = await call_next(request)
        return response
    except RequestValidationError as exc:
        # Handle validation errors (422)
        logger.warning(f"Validation error: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "Validation Error",
                "message": "Invalid request data",
                "details": exc.errors()
            }
        )
    except StarletteHTTPException as exc:
        # Handle HTTP exceptions (4xx, 5xx)
        logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "message": str(exc.detail),
                "status_code": exc.status_code
            }
        )
    except Exception as exc:
        # Handle all other unhandled exceptions (500)
        logger.error(f"Unhandled exception: {type(exc).__name__} - {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "message": "An unexpected error occurred. Please try again later.",
                "type": type(exc).__name__
            }
        )


class APIError(Exception):
    """Base API error class"""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Union[dict, None] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class UnauthorizedError(APIError):
    """401 Unauthorized"""

    def __init__(self, message: str = "Unauthorized", details: Union[dict, None] = None):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED, details)


class ForbiddenError(APIError):
    """403 Forbidden"""

    def __init__(self, message: str = "Forbidden", details: Union[dict, None] = None):
        super().__init__(message, status.HTTP_403_FORBIDDEN, details)


class NotFoundError(APIError):
    """404 Not Found"""

    def __init__(self, message: str = "Resource not found", details: Union[dict, None] = None):
        super().__init__(message, status.HTTP_404_NOT_FOUND, details)


class BadRequestError(APIError):
    """400 Bad Request"""

    def __init__(self, message: str = "Bad request", details: Union[dict, None] = None):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, details)


class RateLimitError(APIError):
    """429 Too Many Requests"""

    def __init__(self, message: str = "Rate limit exceeded", details: Union[dict, None] = None):
        super().__init__(message, status.HTTP_429_TOO_MANY_REQUESTS, details)
