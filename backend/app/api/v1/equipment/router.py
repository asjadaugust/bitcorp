from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.equipment import Equipment
from .schemas import EquipmentCreate, EquipmentUpdate, EquipmentResponse

router = APIRouter()


@router.get("/", response_model=List[EquipmentResponse])
async def get_equipment(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of equipment"""
    equipment = db.query(Equipment).offset(skip).limit(limit).all()
    return equipment


@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment_by_id(
    equipment_id: int,
    db: Session = Depends(get_db)
):
    """Get equipment by ID"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment


@router.post("/", response_model=EquipmentResponse)
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: Session = Depends(get_db)
):
    """Create new equipment"""
    equipment = Equipment(**equipment_data.model_dump())
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: int,
    equipment_data: EquipmentUpdate,
    db: Session = Depends(get_db)
):
    """Update equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    update_data = equipment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(equipment, field, value)
    
    db.commit()
    db.refresh(equipment)
    return equipment


@router.delete("/{equipment_id}")
async def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db)
):
    """Delete equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    db.delete(equipment)
    db.commit()
    return {"message": "Equipment deleted successfully"}
