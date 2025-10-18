"""
License Management Service
Handles token-based licensing, subscriptions, and feature access
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from fastapi import HTTPException, status

from app.models.license import UserLicense, TokenUsage, FeatureLicense
import json


class LicenseService:
    """Service for managing user licenses and token consumption"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_license(self, user_id: str) -> Optional[UserLicense]:
        """Get user license with token balance"""
        return self.db.query(UserLicense).filter(
            UserLicense.user_id == user_id
        ).first()

    def create_user_license(
        self,
        user_id: str,
        subscription_tier: str = "free",
        initial_tokens: int = 50  # Free trial tokens
    ) -> UserLicense:
        """Create new user license with trial tokens"""
        license = UserLicense(
            user_id=user_id,
            token_balance=initial_tokens,
            subscription_tier=subscription_tier,
            expires_at=None if subscription_tier == "free" else datetime.utcnow() + timedelta(days=30)
        )
        self.db.add(license)
        self.db.commit()
        self.db.refresh(license)
        return license

    def has_sufficient_tokens(self, user_id: str, tokens_required: int) -> bool:
        """Check if user has enough tokens for operation"""
        license = self.get_user_license(user_id)
        if not license:
            return False
        
        # Check if license is active and not expired
        if not license.is_active:
            return False
        
        if license.expires_at and license.expires_at < datetime.utcnow():
            return False
        
        return license.token_balance >= tokens_required

    def consume_tokens(
        self,
        user_id: str,
        feature_name: str,
        tokens_required: int,
        endpoint: Optional[str] = None,
        request_data: Optional[Dict[Any, Any]] = None
    ) -> bool:
        """Consume tokens for feature usage"""
        license = self.get_user_license(user_id)
        if not license:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User license not found"
            )

        if not self.has_sufficient_tokens(user_id, tokens_required):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient tokens. Required: {tokens_required}, Available: {license.token_balance}"
            )

        # Deduct tokens
        license.token_balance -= tokens_required
        
        # Log usage
        usage = TokenUsage(
            user_id=user_id,
            feature_name=feature_name,
            tokens_consumed=tokens_required,
            endpoint=endpoint,
            request_data=json.dumps(request_data) if request_data else None
        )
        
        self.db.add(usage)
        self.db.commit()
        return True

    def add_tokens(self, user_id: str, tokens: int, reason: str = "purchase") -> UserLicense:
        """Add tokens to user balance"""
        license = self.get_user_license(user_id)
        if not license:
            license = self.create_user_license(user_id)
        
        license.token_balance += tokens
        self.db.commit()
        self.db.refresh(license)
        return license

    def get_token_usage_history(
        self,
        user_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> List[TokenUsage]:
        """Get user's token usage history"""
        return self.db.query(TokenUsage).filter(
            TokenUsage.user_id == user_id
        ).order_by(desc(TokenUsage.created_at)).offset(offset).limit(limit).all()

    def get_feature_cost(self, feature_name: str) -> Optional[int]:
        """Get token cost for a feature"""
        feature = self.db.query(FeatureLicense).filter(
            and_(
                FeatureLicense.feature_name == feature_name,
                FeatureLicense.is_active == True
            )
        ).first()
        return feature.token_cost if feature else None

    def is_feature_included_in_tier(self, feature_name: str, tier: str) -> bool:
        """Check if feature is included in subscription tier"""
        feature = self.db.query(FeatureLicense).filter(
            FeatureLicense.feature_name == feature_name
        ).first()
        
        if not feature or not feature.subscription_tiers:
            return False
        
        try:
            included_tiers = json.loads(feature.subscription_tiers)
            return tier in included_tiers
        except json.JSONDecodeError:
            return False

    def upgrade_subscription(
        self,
        user_id: str,
        new_tier: str,
        duration_days: int = 30
    ) -> UserLicense:
        """Upgrade user subscription tier"""
        license = self.get_user_license(user_id)
        if not license:
            license = self.create_user_license(user_id)
        
        license.subscription_tier = new_tier
        license.expires_at = datetime.utcnow() + timedelta(days=duration_days)
        
        self.db.commit()
        self.db.refresh(license)
        return license

    def get_subscription_status(self, user_id: str) -> Dict[str, Any]:
        """Get detailed subscription status"""
        license = self.get_user_license(user_id)
        if not license:
            return {
                "tier": "free",
                "token_balance": 0,
                "is_active": False,
                "expires_at": None,
                "days_remaining": None
            }
        
        days_remaining = None
        if license.expires_at:
            delta = license.expires_at - datetime.utcnow()
            days_remaining = max(0, delta.days) if delta.total_seconds() > 0 else 0
        
        return {
            "tier": license.subscription_tier,
            "token_balance": license.token_balance,
            "is_active": license.is_active and (not license.expires_at or license.expires_at > datetime.utcnow()),
            "expires_at": license.expires_at,
            "days_remaining": days_remaining
        }


def get_feature_definitions() -> List[Dict[str, Any]]:
    """Get all available premium features and their costs"""
    return [
        {
            "name": "advanced_analytics",
            "display_name": "Advanced Analytics",
            "description": "Equipment utilization reports and trends",
            "token_cost": 5,
            "category": "analytics"
        },
        {
            "name": "ai_report_generation",
            "display_name": "AI Report Generation",
            "description": "AI-powered insights and recommendations",
            "token_cost": 10,
            "category": "ai"
        },
        {
            "name": "bulk_operations",
            "display_name": "Bulk Data Operations",
            "description": "Bulk import/export and batch updates",
            "token_cost": 3,
            "category": "operations"
        },
        {
            "name": "mobile_api_access",
            "display_name": "Mobile API Access",
            "description": "API calls for mobile applications",
            "token_cost": 1,
            "category": "api"
        },
        {
            "name": "automated_workflows",
            "display_name": "Automated Workflows",
            "description": "Custom automation rules and triggers",
            "token_cost": 7,
            "category": "automation"
        },
        {
            "name": "custom_report_builder",
            "display_name": "Custom Report Builder",
            "description": "Advanced report customization tools",
            "token_cost": 8,
            "category": "reports"
        }
    ]
