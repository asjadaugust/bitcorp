"""
Daily Reports API
Handles operator daily report submissions and management
"""

from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.daily_report import DailyReport, OperatorProfile
from app.models.equipment import Equipment

router = APIRouter()


# Pydantic schemas for daily reports


class DailyReportCreate(BaseModel):
    report_date: datetime
    shift_start: datetime
    shift_end: Optional[datetime] = None
    equipment_id: int
    project_name: str = Field(..., min_length=1, max_length=200)
    site_location: str = Field(..., min_length=1, max_length=300)
    work_zone: Optional[str] = Field(None, max_length=100)
    initial_hourmeter: float = Field(..., ge=0)
    initial_odometer: Optional[float] = Field(None, ge=0)
    initial_fuel_level: Optional[float] = Field(None, ge=0, le=100)
    final_hourmeter: Optional[float] = Field(None, ge=0)
    final_odometer: Optional[float] = Field(None, ge=0)
    final_fuel_level: Optional[float] = Field(None, ge=0, le=100)
    activities_performed: Optional[str] = None
    work_description: Optional[str] = None
    equipment_issues: Optional[str] = None
    maintenance_needed: bool = False
    safety_incidents: Optional[str] = None
    weather_conditions: Optional[str] = Field(None, max_length=100)
    start_latitude: Optional[float] = Field(None, ge=-90, le=90)
    start_longitude: Optional[float] = Field(None, ge=-180, le=180)
    end_latitude: Optional[float] = Field(None, ge=-90, le=90)
    end_longitude: Optional[float] = Field(None, ge=-180, le=180)


class DailyReportUpdate(BaseModel):
    shift_end: Optional[datetime] = None
    final_hourmeter: Optional[float] = Field(None, ge=0)
    final_odometer: Optional[float] = Field(None, ge=0)
    final_fuel_level: Optional[float] = Field(None, ge=0, le=100)
    activities_performed: Optional[str] = None
    work_description: Optional[str] = None
    equipment_issues: Optional[str] = None
    maintenance_needed: Optional[bool] = None
    safety_incidents: Optional[str] = None
    weather_conditions: Optional[str] = Field(None, max_length=100)
    end_latitude: Optional[float] = Field(None, ge=-90, le=90)
    end_longitude: Optional[float] = Field(None, ge=-180, le=180)


class DailyReportResponse(BaseModel):
    id: int
    report_date: datetime
    shift_start: datetime
    shift_end: Optional[datetime]
    operator_id: int
    operator_name: str
    equipment_id: int
    equipment_code: str
    equipment_name: str
    project_name: str
    site_location: str
    work_zone: Optional[str]
    initial_hourmeter: float
    initial_odometer: Optional[float]
    initial_fuel_level: Optional[float]
    final_hourmeter: Optional[float]
    final_odometer: Optional[float]
    final_fuel_level: Optional[float]
    hours_worked: Optional[float]
    distance_traveled: Optional[float]
    fuel_consumed: Optional[float]
    activities_performed: Optional[str]
    work_description: Optional[str]
    equipment_issues: Optional[str]
    maintenance_needed: bool
    safety_incidents: Optional[str]
    weather_conditions: Optional[str]
    status: str
    submitted_at: Optional[datetime]
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    rejection_reason: Optional[str]
    photos: Optional[str]
    start_latitude: Optional[float]
    start_longitude: Optional[float]
    end_latitude: Optional[float]
    end_longitude: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OperatorProfileResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    phone_number: Optional[str]
    emergency_contact: Optional[str]
    emergency_phone: Optional[str]
    license_number: Optional[str]
    license_expiry: Optional[datetime]
    certifications: Optional[str]
    equipment_skills: Optional[str]
    hire_date: Optional[datetime]
    hourly_rate: Optional[float]
    employment_status: str
    total_hours_worked: float
    total_reports_submitted: int
    average_rating: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Helper functions
def get_operator_profile(db: Session, user_id: int) -> OperatorProfile:
    """Get or create operator profile for user"""
    profile = db.query(OperatorProfile).filter(OperatorProfile.user_id == user_id).first()
    if not profile:
        profile = OperatorProfile(user_id=user_id, employee_id=f"OP{user_id:04d}")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def can_access_report(report: DailyReport, current_user: User) -> bool:
    """Check if user can access the report"""
    # Operator can access their own reports
    if report.operator_id == current_user.id:
        return True
    
    # Supervisors and admins can access all reports
    if current_user.has_role("supervisor") or current_user.has_role("admin"):
        return True
    
    return False


# API Endpoints

@router.get("/profile", response_model=OperatorProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current operator's profile"""
    profile = get_operator_profile(db, current_user.id)
    return profile


@router.get("/reports", response_model=List[DailyReportResponse])
async def get_my_reports(
    date_from: Optional[date] = Query(None, description="Filter reports from this date"),
    date_to: Optional[date] = Query(None, description="Filter reports to this date"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current operator's daily reports"""
    query = db.query(DailyReport).filter(DailyReport.operator_id == current_user.id)
    
    if date_from:
        query = query.filter(DailyReport.report_date >= date_from)
    if date_to:
        query = query.filter(DailyReport.report_date <= date_to)
    if status:
        query = query.filter(DailyReport.status == status)
    
    query = query.order_by(desc(DailyReport.report_date))
    reports = query.offset(offset).limit(limit).all()
    
    return reports


@router.get("/reports/{report_id}", response_model=DailyReportResponse)
async def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific daily report"""
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not can_access_report(report, current_user):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return report


@router.post("/reports", response_model=DailyReportResponse)
async def create_report(
    report_data: DailyReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new daily report"""
    # Verify equipment exists
    equipment = db.query(Equipment).filter(Equipment.id == report_data.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Check if report already exists for this date and equipment
    existing_report = db.query(DailyReport).filter(
        and_(
            DailyReport.operator_id == current_user.id,
            DailyReport.equipment_id == report_data.equipment_id,
            func.date(DailyReport.report_date) == report_data.report_date.date()
        )
    ).first()
    
    if existing_report:
        raise HTTPException(
            status_code=400,
            detail="Report already exists for this equipment and date"
        )
    
    # Create report
    report = DailyReport(
        **report_data.dict(),
        operator_id=current_user.id,
        operator_name=current_user.full_name,
        equipment_code=equipment.code,
        equipment_name=equipment.name,
        status="draft"
    )
    
    # Calculate derived values
    if report.final_hourmeter:
        report.hours_worked = report.calculated_hours_worked
    if report.final_odometer:
        report.distance_traveled = report.calculated_distance_traveled
    if report.final_fuel_level:
        report.fuel_consumed = report.calculated_fuel_consumed
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report


@router.put("/reports/{report_id}", response_model=DailyReportResponse)
async def update_report(
    report_id: int,
    report_data: DailyReportUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update daily report"""
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.operator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if report.status == "approved":
        raise HTTPException(status_code=400, detail="Cannot update approved report")
    
    # Update fields
    for field, value in report_data.dict(exclude_unset=True).items():
        setattr(report, field, value)
    
    # Recalculate derived values
    if report.final_hourmeter:
        report.hours_worked = report.calculated_hours_worked
    if report.final_odometer:
        report.distance_traveled = report.calculated_distance_traveled
    if report.final_fuel_level:
        report.fuel_consumed = report.calculated_fuel_consumed
    
    db.commit()
    db.refresh(report)
    
    return report


@router.post("/reports/{report_id}/submit")
async def submit_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit report for approval"""
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.operator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if report.status != "draft":
        raise HTTPException(status_code=400, detail="Report is not in draft status")
    
    if not report.is_complete:
        raise HTTPException(status_code=400, detail="Report is incomplete")
    
    report.status = "submitted"
    report.submitted_at = func.now()
    
    # Update operator profile stats
    profile = get_operator_profile(db, current_user.id)
    profile.total_reports_submitted += 1
    if report.hours_worked:
        profile.total_hours_worked += report.hours_worked
    
    db.commit()
    
    return {"message": "Report submitted successfully"}


@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete daily report (only if draft)"""
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.operator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if report.status != "draft":
        raise HTTPException(status_code=400, detail="Can only delete draft reports")
    
    db.delete(report)
    db.commit()
    
    return {"message": "Report deleted successfully"}


# Photo upload endpoint
@router.post("/reports/{report_id}/photos")
async def upload_photos(
    report_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload photos for daily report"""
    report = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.operator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # In a real implementation, you would save files to cloud storage
    # For now, we'll just store the filenames
    import json
    photo_urls = []
    
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
        
        # Simulate saving file and getting URL
        photo_url = f"/uploads/reports/{report_id}/{file.filename}"
        photo_urls.append(photo_url)
    
    # Update report with photo URLs
    existing_photos = json.loads(report.photos) if report.photos else []
    existing_photos.extend(photo_urls)
    report.photos = json.dumps(existing_photos)
    
    db.commit()
    
    return {"message": f"Uploaded {len(files)} photos successfully", "photo_urls": photo_urls}
