from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class EquipmentBase(BaseModel):
    name: str
    model: Optional[str] = None
    brand: Optional[str] = None
    equipment_type: str
    serial_number: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    company_id: int


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    brand: Optional[str] = None
    equipment_type: Optional[str] = None
    status: Optional[str] = None


class EquipmentResponse(EquipmentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    company_id: int
    status: str
    created_at: datetime
    updated_at: datetime
