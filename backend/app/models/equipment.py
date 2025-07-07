from sqlalchemy import Column, String, Boolean, Text, JSON, Integer, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Equipment(BaseModel):
    __tablename__ = "equipment"
    
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    model = Column(String(255))
    brand = Column(String(255))
    serial_number = Column(String(100), unique=True)
    equipment_type = Column(String(100), nullable=False)
    year_manufactured = Column(Integer)
    purchase_cost = Column(Numeric(12, 2))
    current_value = Column(Numeric(12, 2))
    hourly_rate = Column(Numeric(8, 2))
    fuel_type = Column(String(50))
    fuel_capacity = Column(Numeric(8, 2))
    status = Column(String(50), default='available')  # available, in_use, maintenance, retired
    hourmeter_reading = Column(Integer, default=0)
    odometer_reading = Column(Integer, nullable=True)  # Not all equipment has odometers
    specifications = Column(JSON, default=lambda: {})
    images = Column(JSON, default=lambda: [])
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("Company", back_populates="equipment")
