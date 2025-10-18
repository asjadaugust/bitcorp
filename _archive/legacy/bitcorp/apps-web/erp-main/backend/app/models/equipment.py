from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Equipment(Base):
    __tablename__ = "equipment"

    # Basic information
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    model = Column(String(255))
    brand = Column(String(255))
    serial_number = Column(String(100), unique=True)
    equipment_type = Column(String(100), nullable=False)
    year_manufactured = Column(Integer)

    # Financial information
    purchase_cost = Column(Numeric(12, 2))
    current_value = Column(Numeric(12, 2))
    hourly_rate = Column(Numeric(8, 2))

    # Technical specifications
    fuel_type = Column(String(50))
    fuel_capacity = Column(Numeric(8, 2))
    status = Column(String(50))  # operational, maintenance, repair, retired

    # Usage tracking
    hourmeter_reading = Column(Integer)  # Total operating hours
    odometer_reading = Column(Integer)  # Total distance if applicable

    # Additional data
    specifications = Column(JSON)
    images = Column(JSON)
    notes = Column(Text)

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="equipment")
    # IoT and Predictive Maintenance relationships
    iot_devices = relationship("IoTDevice", back_populates="equipment")
    maintenance_alerts = relationship("MaintenanceAlert", back_populates="equipment")
    health_scores = relationship("EquipmentHealthScore", back_populates="equipment")
