"""
License Management Database Models
Token-based licensing system for Bitcorp ERP
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, UUID, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import uuid


class UserLicense(Base):
    """User license and token balance management"""
    __tablename__ = "user_licenses"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    token_balance = Column(Integer, default=0, nullable=False)
    subscription_tier = Column(
        String(20),
        default="free",
        nullable=False
    )  # free, starter, professional, enterprise
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    # TODO: Fix ID type mismatch - commented out until User model is updated
    # user = relationship("User", back_populates="license")
    token_usage = relationship("TokenUsage", back_populates="license")
    token_purchases = relationship("TokenPurchase", back_populates="license")


class TokenUsage(Base):
    """Track token consumption for analytics and billing"""
    __tablename__ = "token_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_licenses.user_id"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    tokens_consumed = Column(Integer, nullable=False)
    endpoint = Column(String(200), nullable=True)  # API endpoint used
    request_data = Column(Text, nullable=True)  # Serialized request data for audit
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    license = relationship("UserLicense", back_populates="token_usage")


class TokenPurchase(Base):
    """Track token purchases and payments"""
    __tablename__ = "token_purchases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_licenses.user_id"), nullable=False)
    tokens_purchased = Column(Integer, nullable=False)
    amount_paid = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String(3), default="USD", nullable=False)
    payment_method = Column(String(50), nullable=False)  # stripe, manual, etc.
    stripe_payment_intent_id = Column(String(200), nullable=True)
    status = Column(String(20), default="pending", nullable=False)  # pending, completed, failed
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    license = relationship("UserLicense", back_populates="token_purchases")


class FeatureLicense(Base):
    """Define which features require tokens and their costs"""
    __tablename__ = "feature_licenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feature_name = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    token_cost = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    subscription_tiers = Column(String(200), nullable=True)  # JSON array of tiers that include this
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
