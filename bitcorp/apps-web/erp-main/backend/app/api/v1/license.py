"""
License API Router
Endpoints for managing licenses, tokens, and subscriptions
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.services.license_service import LicenseService, get_feature_definitions
from app.middleware.license_middleware import get_license_service

router = APIRouter()


# Pydantic models for request/response
class TokenPurchaseRequest(BaseModel):
    tokens: int
    payment_method: str = "stripe"


class SubscriptionUpgradeRequest(BaseModel):
    tier: str  # starter, professional, enterprise
    duration_days: int = 30


class LicenseStatusResponse(BaseModel):
    tier: str
    token_balance: int
    is_active: bool
    expires_at: str | None
    days_remaining: int | None


class TokenUsageResponse(BaseModel):
    feature_name: str
    tokens_consumed: int
    endpoint: str | None
    created_at: str


class FeatureResponse(BaseModel):
    name: str
    display_name: str
    description: str
    token_cost: int
    category: str


@router.get("/status", response_model=LicenseStatusResponse)
async def get_license_status(
    current_user: User = Depends(get_current_user),
    license_service: LicenseService = Depends(get_license_service)
):
    """Get current user's license status and token balance"""
    status_info = license_service.get_subscription_status(str(current_user.id))
    
    return LicenseStatusResponse(
        tier=status_info["tier"],
        token_balance=status_info["token_balance"],
        is_active=status_info["is_active"],
        expires_at=status_info["expires_at"].isoformat() if status_info["expires_at"] else None,
        days_remaining=status_info["days_remaining"]
    )


@router.get("/features", response_model=List[FeatureResponse])
async def get_available_features():
    """Get list of all premium features and their token costs"""
    features = get_feature_definitions()
    return [FeatureResponse(**feature) for feature in features]


@router.get("/usage-history", response_model=List[TokenUsageResponse])
async def get_token_usage_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    license_service: LicenseService = Depends(get_license_service)
):
    """Get user's token usage history"""
    usage_history = license_service.get_token_usage_history(
        str(current_user.id), limit, offset
    )
    
    return [
        TokenUsageResponse(
            feature_name=usage.feature_name,
            tokens_consumed=usage.tokens_consumed,
            endpoint=usage.endpoint,
            created_at=usage.created_at.isoformat()
        )
        for usage in usage_history
    ]


@router.post("/purchase-tokens")
async def purchase_tokens(
    purchase_request: TokenPurchaseRequest,
    current_user: User = Depends(get_current_user),
    license_service: LicenseService = Depends(get_license_service)
):
    """Purchase tokens for premium features"""
    # This would integrate with Stripe in a real implementation
    # For now, just add tokens directly (for testing)
    
    if purchase_request.tokens <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token amount must be positive"
        )
    
    if purchase_request.tokens > 10000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10,000 tokens per purchase"
        )
    
    # Calculate cost (for demo: $0.50 per token)
    cost_cents = purchase_request.tokens * 50
    
    # In real implementation, process payment with Stripe here
    # For demo, just add the tokens
    updated_license = license_service.add_tokens(
        str(current_user.id), 
        purchase_request.tokens,
        f"Purchase via {purchase_request.payment_method}"
    )
    
    return {
        "success": True,
        "tokens_purchased": purchase_request.tokens,
        "cost_cents": cost_cents,
        "new_balance": updated_license.token_balance,
        "message": f"Successfully purchased {purchase_request.tokens} tokens"
    }


@router.post("/upgrade-subscription")
async def upgrade_subscription(
    upgrade_request: SubscriptionUpgradeRequest,
    current_user: User = Depends(get_current_user),
    license_service: LicenseService = Depends(get_license_service)
):
    """Upgrade user subscription tier"""
    
    valid_tiers = ["starter", "professional", "enterprise"]
    if upgrade_request.tier not in valid_tiers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier. Must be one of: {valid_tiers}"
        )
    
    # Calculate pricing
    tier_pricing = {
        "starter": {"monthly_cost": 2900, "tokens_included": 100},
        "professional": {"monthly_cost": 9900, "tokens_included": 500},
        "enterprise": {"monthly_cost": 29900, "tokens_included": 2000}
    }
    
    tier_info = tier_pricing[upgrade_request.tier]
    
    # In real implementation, process payment here
    # For demo, just upgrade the subscription
    updated_license = license_service.upgrade_subscription(
        str(current_user.id),
        upgrade_request.tier,
        upgrade_request.duration_days
    )
    
    # Add included tokens
    license_service.add_tokens(
        str(current_user.id),
        tier_info["tokens_included"],
        f"Subscription upgrade to {upgrade_request.tier}"
    )
    
    return {
        "success": True,
        "new_tier": upgrade_request.tier,
        "cost_cents": tier_info["monthly_cost"],
        "tokens_included": tier_info["tokens_included"],
        "expires_at": updated_license.expires_at.isoformat() if updated_license.expires_at else None,
        "message": f"Successfully upgraded to {upgrade_request.tier} tier"
    }


@router.post("/initialize-trial")
async def initialize_trial_license(
    current_user: User = Depends(get_current_user),
    license_service: LicenseService = Depends(get_license_service)
):
    """Initialize free trial license for new users"""
    existing_license = license_service.get_user_license(str(current_user.id))
    
    if existing_license:
        return {
            "message": "License already exists",
            "current_balance": existing_license.token_balance
        }
    
    new_license = license_service.create_user_license(str(current_user.id))
    
    return {
        "success": True,
        "message": "Trial license created",
        "trial_tokens": new_license.token_balance,
        "tier": new_license.subscription_tier
    }


@router.get("/pricing")
async def get_pricing_info():
    """Get current pricing information"""
    return {
        "tiers": {
            "free": {
                "name": "Free",
                "price_cents": 0,
                "tokens_included": 50,
                "features": ["Basic equipment management", "Up to 10 daily reports/month", "5 users max"]
            },
            "starter": {
                "name": "Starter Pack",
                "price_cents": 2900,
                "tokens_included": 100,
                "features": ["Everything in Free", "Advanced analytics", "50 users max"]
            },
            "professional": {
                "name": "Professional",
                "price_cents": 9900,
                "tokens_included": 500,
                "features": ["Everything in Starter", "AI reports", "Unlimited users", "Priority support"]
            },
            "enterprise": {
                "name": "Enterprise",
                "price_cents": 29900,
                "tokens_included": 2000,
                "features": ["Everything in Professional", "Custom workflows", "Dedicated support", "SLA"]
            }
        },
        "pay_as_you_go": {
            "price_per_token_cents": 50,
            "min_purchase": 10,
            "max_purchase": 10000
        }
    }
