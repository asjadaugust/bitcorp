from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from typing import List, Optional
from decimal import Decimal
import math

from app.core.database import get_db
from app.models.equipment import Equipment
from .schemas import (
    EquipmentCreate, EquipmentUpdate, EquipmentResponse,
    EquipmentListResponse,
    EquipmentStatus, EquipmentType, FuelType
)

router = APIRouter()


@router.get("/", response_model=EquipmentListResponse)
async def get_equipment(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in name, model, brand"),
    equipment_type: Optional[EquipmentType] = Query(None, description="Filter by equipment type"),
    status: Optional[EquipmentStatus] = Query(None, description="Filter by status"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_hourly_rate: Optional[Decimal] = Query(None, ge=0, description="Minimum hourly rate"),
    max_hourly_rate: Optional[Decimal] = Query(None, ge=0, description="Maximum hourly rate"),
    year_from: Optional[int] = Query(None, ge=1900, description="Year manufactured from"),
    year_to: Optional[int] = Query(None, le=2030, description="Year manufactured to"),
    sort_by: Optional[str] = Query("name", description="Sort field"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db)
):
    """Get paginated list of equipment with filtering and search"""
    
    # Build query
    query = db.query(Equipment).filter(Equipment.is_active.is_(True))
    
    # Apply search
    if search:
        search_filter = or_(
            Equipment.name.ilike(f"%{search}%"),
            Equipment.model.ilike(f"%{search}%"),
            Equipment.brand.ilike(f"%{search}%"),
            Equipment.serial_number.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Apply filters
    if equipment_type:
        query = query.filter(Equipment.equipment_type == equipment_type)
    
    if status:
        query = query.filter(Equipment.status == status)
    
    if brand:
        query = query.filter(Equipment.brand.ilike(f"%{brand}%"))
    
    if min_hourly_rate is not None:
        query = query.filter(Equipment.hourly_rate >= min_hourly_rate)
    
    if max_hourly_rate is not None:
        query = query.filter(Equipment.hourly_rate <= max_hourly_rate)
    
    if year_from:
        query = query.filter(Equipment.year_manufactured >= year_from)
    
    if year_to:
        query = query.filter(Equipment.year_manufactured <= year_to)
    
    # Apply sorting
    sort_column = getattr(Equipment, sort_by, Equipment.name)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    equipment = query.offset(offset).limit(per_page).all()
    
    # Calculate pagination info
    total_pages = math.ceil(total / per_page)
    
    return EquipmentListResponse(
        equipment=equipment,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )


@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment_by_id(
    equipment_id: int,
    db: Session = Depends(get_db)
):
    """Get equipment by ID"""
    equipment = db.query(Equipment).filter(
        and_(Equipment.id == equipment_id, Equipment.is_active.is_(True))
    ).first()

    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    return equipment


@router.post("/", response_model=EquipmentResponse)
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: Session = Depends(get_db)
):
    """Create new equipment"""
    
    # Check if serial number already exists
    if equipment_data.serial_number:
        existing = db.query(Equipment).filter(
            Equipment.serial_number == equipment_data.serial_number
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Serial number already exists"
            )
    
    equipment = Equipment(**equipment_data.model_dump())
    equipment.status = EquipmentStatus.AVAILABLE  # Default status
    
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
    equipment = db.query(Equipment).filter(
        and_(Equipment.id == equipment_id, Equipment.is_active.is_(True))
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    # Check serial number uniqueness if updating
    if equipment_data.serial_number and equipment_data.serial_number != equipment.serial_number:
        existing = db.query(Equipment).filter(
            and_(
                Equipment.serial_number == equipment_data.serial_number,
                Equipment.id != equipment_id
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Serial number already exists"
            )
    
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
    """Soft delete equipment"""
    equipment = db.query(Equipment).filter(
        and_(Equipment.id == equipment_id, Equipment.is_active.is_(True))
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    # Soft delete - set is_active to False
    equipment.is_active = False
    db.commit()
    
    return {"message": "Equipment deleted successfully"}


@router.get("/types/", response_model=List[str])
async def get_equipment_types():
    """Get list of available equipment types"""
    return [type_value.value for type_value in EquipmentType]


@router.get("/statuses/", response_model=List[str])
async def get_equipment_statuses():
    """Get list of available equipment statuses"""
    return [status_value.value for status_value in EquipmentStatus]


@router.get("/fuel-types/", response_model=List[str])
async def get_fuel_types():
    """Get list of available fuel types"""
    return [fuel_type.value for fuel_type in FuelType]


@router.patch("/{equipment_id}/status")
async def update_equipment_status(
    equipment_id: int,
    new_status: EquipmentStatus,
    db: Session = Depends(get_db)
):
    """Update equipment status"""
    equipment = db.query(Equipment).filter(
        and_(Equipment.id == equipment_id, Equipment.is_active.is_(True))
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    old_status = equipment.status
    equipment.status = new_status
    db.commit()
    
    return {
        "message": f"Equipment status updated from {old_status} to {new_status}",
        "old_status": old_status,
        "new_status": new_status
    }


@router.get("/{equipment_id}/utilization")
async def get_equipment_utilization(
    equipment_id: int,
    db: Session = Depends(get_db)
):
    """Get equipment utilization statistics"""
    equipment = db.query(Equipment).filter(
        and_(Equipment.id == equipment_id, Equipment.is_active.is_(True))
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    # TODO: Implement utilization calculation based on assignment and usage records
    return {
        "equipment_id": equipment_id,
        "total_hours": equipment.hourmeter_reading,
        "utilization_percentage": 75.5,  # Placeholder
        "days_since_last_maintenance": 30,  # Placeholder
        "revenue_generated": float(equipment.hourly_rate or 0) * equipment.hourmeter_reading
    }
