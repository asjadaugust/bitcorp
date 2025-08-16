from sqlalchemy import Column, String, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Company(BaseModel):
    __tablename__ = "companies"
    
    name = Column(String(255), nullable=False)
    tax_id = Column(String(50), unique=True)
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(String(255))
    settings = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="company")
