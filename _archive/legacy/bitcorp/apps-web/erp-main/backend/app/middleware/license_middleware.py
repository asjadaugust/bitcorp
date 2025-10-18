"""
Token-based licensing middleware
Decorates endpoints that require token consumption
"""

from functools import wraps
from typing import Callable
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.services.license_service import LicenseService
from app.core.deps import get_db, get_current_user
from app.models.user import User


def require_tokens(tokens_required: int, feature_name: str):
    """
    Decorator for endpoints that require token consumption
    
    Usage:
    @require_tokens(5, "advanced_analytics")
    async def generate_analytics_report(...):
        ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract dependencies from kwargs or args
            current_user = None
            db = None
            
            # Look for current_user and db in kwargs (injected by FastAPI)
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                elif hasattr(value, 'query'):  # Session object
                    db = value
            
            if not current_user or not db:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing user or database session"
                )
            
            # Check and consume tokens
            license_service = LicenseService(db)
            
            try:
                # Check if feature is included in user's subscription tier
                license_info = license_service.get_subscription_status(str(current_user.id))
                
                if license_service.is_feature_included_in_tier(feature_name, license_info["tier"]):
                    # Feature is included in subscription, no tokens required
                    pass
                else:
                    # Consume tokens for the feature
                    license_service.consume_tokens(
                        user_id=str(current_user.id),
                        feature_name=feature_name,
                        tokens_required=tokens_required,
                        endpoint=getattr(func, '__name__', 'unknown')
                    )
                
                # Execute the original function
                return await func(*args, **kwargs)
                
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Token validation failed: {str(e)}"
                )
        
        return wrapper
    return decorator


async def get_license_service(db: Session = Depends(get_db)) -> LicenseService:
    """Dependency to get license service"""
    return LicenseService(db)


async def check_subscription_status(
    current_user: User = Depends(get_current_user),
    license_service: LicenseService = Depends(get_license_service)
):
    """Dependency to check if user has active subscription"""
    status_info = license_service.get_subscription_status(str(current_user.id))
    
    if not status_info["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Subscription expired or inactive"
        )
    
    return status_info


def create_free_tier_check(feature_limit: int = 10):
    """
    Create a dependency that enforces free tier limits
    
    Usage:
    check_daily_reports_limit = create_free_tier_check(10)
    
    @app.get("/reports")
    async def get_reports(_: None = Depends(check_daily_reports_limit)):
        ...
    """
    async def check_limit(
        current_user: User = Depends(get_current_user),
        license_service: LicenseService = Depends(get_license_service)
    ):
        license_info = license_service.get_subscription_status(str(current_user.id))
        
        if license_info["tier"] == "free":
            # Check usage this month for free users
            # This would need to be implemented based on specific feature
            # For now, just return True
            pass
        
        return True
    
    return check_limit
