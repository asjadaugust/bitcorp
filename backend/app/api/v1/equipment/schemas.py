from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum


class EquipmentStatus(str, Enum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"
    OUT_OF_ORDER = "out_of_order"


class EquipmentType(str, Enum):
    EXCAVATOR = "excavator"
    BULLDOZER = "bulldozer"
    LOADER = "loader"
    CRANE = "crane"
    TRUCK = "truck"
    GENERATOR = "generator"
    COMPACTOR = "compactor"
    GRADER = "grader"
    LIFT = "lift"
    OTHER = "other"


class FuelType(str, Enum):
    DIESEL = "diesel"
    GASOLINE = "gasoline"
    ELECTRIC = "electric"
    HYBRID = "hybrid"
    PROPANE = "propane"


class EquipmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Equipment name")
    model: Optional[str] = Field(None, max_length=255, description="Equipment model")
    brand: Optional[str] = Field(None, max_length=255, description="Equipment brand")
    equipment_type: EquipmentType = Field(..., description="Type of equipment")
    serial_number: Optional[str] = Field(None, max_length=100, description="Serial number")
    year_manufactured: Optional[int] = Field(None, ge=1900, le=2030, description="Year manufactured")
    purchase_cost: Optional[Decimal] = Field(None, ge=0, description="Purchase cost")
    current_value: Optional[Decimal] = Field(None, ge=0, description="Current value")
    hourly_rate: Optional[Decimal] = Field(None, ge=0, description="Hourly rental rate")
    fuel_type: Optional[FuelType] = Field(None, description="Fuel type")
    fuel_capacity: Optional[Decimal] = Field(None, ge=0, description="Fuel capacity in liters")
    specifications: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Technical specifications")
    notes: Optional[str] = Field(None, description="Additional notes")


class EquipmentCreate(EquipmentBase):
    company_id: int = Field(..., gt=0, description="Company ID")


class EquipmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    model: Optional[str] = Field(None, max_length=255)
    brand: Optional[str] = Field(None, max_length=255)
    equipment_type: Optional[EquipmentType] = None
    serial_number: Optional[str] = Field(None, max_length=100)
    year_manufactured: Optional[int] = Field(None, ge=1900, le=2030)
    purchase_cost: Optional[Decimal] = Field(None, ge=0)
    current_value: Optional[Decimal] = Field(None, ge=0)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    fuel_type: Optional[FuelType] = None
    fuel_capacity: Optional[Decimal] = Field(None, ge=0)
    status: Optional[EquipmentStatus] = None
    hourmeter_reading: Optional[int] = Field(None, ge=0)
    odometer_reading: Optional[int] = Field(None, ge=0)
    specifications: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class EquipmentResponse(EquipmentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    company_id: int
    status: EquipmentStatus
    hourmeter_reading: int = Field(default=0, description="Hour meter reading")
    odometer_reading: Optional[int] = Field(default=None, description="Odometer reading (for vehicles)")
    images: List[str] = Field(default_factory=list, description="Equipment images")
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    @field_validator('images', mode='before')
    @classmethod
    def validate_images(cls, v):
        if v is None:
            return []
        return v


class EquipmentListResponse(BaseModel):
    equipment: List[EquipmentResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class EquipmentSearchFilters(BaseModel):
    name: Optional[str] = None
    equipment_type: Optional[EquipmentType] = None
    status: Optional[EquipmentStatus] = None
    brand: Optional[str] = None
    min_hourly_rate: Optional[Decimal] = None
    max_hourly_rate: Optional[Decimal] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None


class EquipmentAssignment(BaseModel):
    equipment_id: int
    operator_id: Optional[int] = None
    project_id: Optional[int] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None


class EquipmentMaintenanceRecord(BaseModel):
    equipment_id: int
    maintenance_type: str
    description: str
    cost: Optional[Decimal] = None
    performed_by: str
    performed_date: datetime
    next_maintenance_date: Optional[datetime] = None
    notes: Optional[str] = None


class EquipmentStatusUpdate(BaseModel):
    status: EquipmentStatus = Field(..., description="New equipment status")
