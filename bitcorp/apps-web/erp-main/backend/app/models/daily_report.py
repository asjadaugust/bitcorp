"""
Daily Report Models
Handles equipment usage reports submitted by operators
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class DailyReport(Base):
    __tablename__ = "daily_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic report information
    report_date = Column(DateTime(timezone=True), nullable=False)
    shift_start = Column(DateTime(timezone=True), nullable=False)
    shift_end = Column(DateTime(timezone=True), nullable=True)
    
    # Operator information
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    operator_name = Column(String(200), nullable=False)
    
    # Equipment information
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    equipment_code = Column(String(50), nullable=False)
    equipment_name = Column(String(200), nullable=False)
    
    # Project/Site information
    project_name = Column(String(200), nullable=False)
    site_location = Column(String(300), nullable=False)
    work_zone = Column(String(100), nullable=True)
    
    # Equipment readings at start of shift
    initial_hourmeter = Column(Float, nullable=False)
    initial_odometer = Column(Float, nullable=True)
    initial_fuel_level = Column(Float, nullable=True)
    
    # Equipment readings at end of shift
    final_hourmeter = Column(Float, nullable=True)
    final_odometer = Column(Float, nullable=True)
    final_fuel_level = Column(Float, nullable=True)
    
    # Calculated values
    hours_worked = Column(Float, nullable=True)  # Calculated from hourmeter
    distance_traveled = Column(Float, nullable=True)  # Calculated from odometer
    fuel_consumed = Column(Float, nullable=True)  # Calculated from fuel levels
    
    # Work activities
    activities_performed = Column(Text, nullable=True)
    work_description = Column(Text, nullable=True)
    
    # Observations and issues
    equipment_issues = Column(Text, nullable=True)
    maintenance_needed = Column(Boolean, default=False)
    safety_incidents = Column(Text, nullable=True)
    weather_conditions = Column(String(100), nullable=True)
    
    # Approval workflow
    status = Column(String(20), default="draft")  # draft, submitted, approved, rejected
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Photos and attachments
    photos = Column(Text, nullable=True)  # JSON array of photo URLs
    
    # Location data
    start_latitude = Column(Float, nullable=True)
    start_longitude = Column(Float, nullable=True)
    end_latitude = Column(Float, nullable=True)
    end_longitude = Column(Float, nullable=True)
    
    # System timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    operator = relationship("User", foreign_keys=[operator_id], backref="daily_reports")
    equipment = relationship("Equipment", backref="daily_reports")
    approver = relationship("User", foreign_keys=[approved_by], backref="approved_reports")

    @property
    def calculated_hours_worked(self):
        """Calculate hours worked from hourmeter readings"""
        if self.final_hourmeter and self.initial_hourmeter:
            return self.final_hourmeter - self.initial_hourmeter
        return None
    
    @property
    def calculated_distance_traveled(self):
        """Calculate distance traveled from odometer readings"""
        if self.final_odometer and self.initial_odometer:
            return self.final_odometer - self.initial_odometer
        return None
    
    @property
    def calculated_fuel_consumed(self):
        """Calculate fuel consumed from fuel level readings"""
        if self.initial_fuel_level and self.final_fuel_level:
            return self.initial_fuel_level - self.final_fuel_level
        return None
    
    @property
    def is_complete(self):
        """Check if report has all required fields"""
        required_fields = [
            self.report_date, self.operator_id, self.equipment_id,
            self.project_name, self.site_location, self.initial_hourmeter
        ]
        return all(field is not None for field in required_fields)


class OperatorProfile(Base):
    __tablename__ = "operator_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Personal information
    employee_id = Column(String(50), unique=True, nullable=False)
    phone_number = Column(String(20), nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    
    # Certifications and skills
    license_number = Column(String(50), nullable=True)
    license_expiry = Column(DateTime(timezone=True), nullable=True)
    certifications = Column(Text, nullable=True)  # JSON array of certifications
    equipment_skills = Column(Text, nullable=True)  # JSON array of equipment types
    
    # Employment information
    hire_date = Column(DateTime(timezone=True), nullable=True)
    hourly_rate = Column(Float, nullable=True)
    employment_status = Column(String(20), default="active")  # active, inactive, terminated
    
    # Performance metrics
    total_hours_worked = Column(Float, default=0.0)
    total_reports_submitted = Column(Integer, default=0)
    average_rating = Column(Float, nullable=True)
    
    # System timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="operator_profile")

    def is_certified_for_equipment(self, equipment_type: str) -> bool:
        """Check if operator is certified for specific equipment type"""
        if not self.equipment_skills:
            return False
        import json
        skills = json.loads(self.equipment_skills)
        return equipment_type in skills
