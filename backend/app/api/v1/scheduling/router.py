# Equipment Scheduling API Router
# REST API endpoints for equipment scheduling system

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from .schemas import (
    ScheduleCreate, ScheduleUpdate, ScheduleResponse, ScheduleListResponse,
    ConflictCheckRequest, ConflictCheckResponse, EquipmentAvailability,
    ScheduleStatistics, SmartScheduleRequest, SmartScheduleResponse,
    BulkScheduleCreate, BulkScheduleResponse, ScheduleStatus
)
from .service import SchedulingService

router = APIRouter()


@router.post("/", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    schedule_data: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user_id: int = 1  # TODO: Replace with actual auth dependency
):
    """
    Create a new equipment schedule.
    
    - **equipment_id**: ID of equipment to schedule
    - **start_datetime**: Schedule start date and time
    - **end_datetime**: Schedule end date and time  
    - **project_id**: Optional project association
    - **operator_id**: Optional operator assignment
    - **notes**: Additional scheduling notes
    
    Returns created schedule with conflict detection results.
    """
    try:
        service = SchedulingService(db)
        schedule = await service.create_schedule(schedule_data, current_user_id)
        return schedule
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create schedule: {str(e)}"
        )


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """
    Get schedule details by ID.
    
    Returns complete schedule information including related entities.
    """
    service = SchedulingService(db)
    schedule = await service.get_schedule(schedule_id)
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule with ID {schedule_id} not found"
        )
    
    return schedule


@router.get("/", response_model=ScheduleListResponse)
async def list_schedules(
    equipment_id: Optional[int] = Query(None, description="Filter by equipment ID"),
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    operator_id: Optional[int] = Query(None, description="Filter by operator ID"),
    status: Optional[ScheduleStatus] = Query(None, description="Filter by schedule status"),
    start_date: Optional[datetime] = Query(None, description="Filter schedules starting after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter schedules ending before this date"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    List equipment schedules with filtering and pagination.
    
    Supports filtering by equipment, project, operator, status, and date ranges.
    """
    # Build dynamic query based on filters
    from sqlalchemy import text, and_
    
    conditions = []
    params = {}
    
    if equipment_id:
        conditions.append("es.equipment_id = :equipment_id")
        params['equipment_id'] = equipment_id
    
    if project_id:
        conditions.append("es.project_id = :project_id")
        params['project_id'] = project_id
    
    if operator_id:
        conditions.append("es.operator_id = :operator_id")
        params['operator_id'] = operator_id
    
    if status:
        conditions.append("es.status = :status")
        params['status'] = status.value
    
    if start_date:
        conditions.append("es.start_datetime >= :start_date")
        params['start_date'] = start_date
    
    if end_date:
        conditions.append("es.end_datetime <= :end_date")
        params['end_date'] = end_date
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    # Count total records
    count_query = text(f"""
        SELECT COUNT(*)
        FROM equipment_schedules es
        WHERE {where_clause}
    """)
    
    total_result = db.execute(count_query, params)
    total = total_result.scalar()
    
    # Get paginated records
    offset = (page - 1) * per_page
    params.update({'offset': offset, 'limit': per_page})
    
    list_query = text(f"""
        SELECT 
            es.*,
            e.name as equipment_name,
            p.name as project_name,
            u.email as operator_name
        FROM equipment_schedules es
        JOIN equipment e ON es.equipment_id = e.id
        LEFT JOIN projects p ON es.project_id = p.id
        LEFT JOIN users u ON es.operator_id = u.id
        WHERE {where_clause}
        ORDER BY es.start_datetime DESC
        LIMIT :limit OFFSET :offset
    """)
    
    result = db.execute(list_query, params)
    
    schedules = []
    for row in result:
        schedules.append(ScheduleResponse(
            id=row.id,
            equipment_id=row.equipment_id,
            project_id=row.project_id,
            operator_id=row.operator_id,
            start_datetime=row.start_datetime,
            end_datetime=row.end_datetime,
            status=row.status,
            notes=row.notes,
            created_by=row.created_by,
            created_at=row.created_at,
            updated_at=row.updated_at,
            equipment_name=row.equipment_name,
            project_name=row.project_name,
            operator_name=row.operator_name
        ))
    
    total_pages = (total + per_page - 1) // per_page
    
    return ScheduleListResponse(
        schedules=schedules,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1
    )


@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: int,
    schedule_data: ScheduleUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing schedule.
    
    Performs conflict detection if date/time changes are made.
    """
    # TODO: Implement schedule update logic with conflict detection
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Schedule update functionality coming soon"
    )


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_schedule(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """
    Cancel a schedule (sets status to cancelled).
    
    Cancelled schedules remain in the system for audit purposes.
    """
    from sqlalchemy import text
    
    # Check if schedule exists
    check_query = text("SELECT id FROM equipment_schedules WHERE id = :schedule_id")
    result = db.execute(check_query, {'schedule_id': schedule_id})
    
    if not result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule with ID {schedule_id} not found"
        )
    
    # Cancel the schedule
    cancel_query = text("""
        UPDATE equipment_schedules 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = :schedule_id
    """)
    
    db.execute(cancel_query, {'schedule_id': schedule_id})
    db.commit()


@router.post("/conflicts/check", response_model=ConflictCheckResponse)
async def check_schedule_conflicts(
    conflict_request: ConflictCheckRequest,
    db: Session = Depends(get_db)
):
    """
    Check for scheduling conflicts before creating or updating a schedule.
    
    Returns detailed conflict analysis with severity levels.
    """
    try:
        service = SchedulingService(db)
        conflicts = await service.check_conflicts(
            conflict_request.equipment_id,
            conflict_request.start_datetime,
            conflict_request.end_datetime,
            conflict_request.exclude_schedule_id
        )
        
        has_conflicts = len(conflicts) > 0
        severity_level = max([c.severity for c in conflicts]) if conflicts else 'info'
        
        if has_conflicts:
            message = f"Found {len(conflicts)} potential conflicts"
        else:
            message = "No conflicts detected"
        
        return ConflictCheckResponse(
            has_conflicts=has_conflicts,
            conflicts=conflicts,
            severity_level=severity_level,
            message=message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check conflicts: {str(e)}"
        )


@router.get("/equipment/{equipment_id}/availability", response_model=EquipmentAvailability)
async def get_equipment_availability(
    equipment_id: int,
    start_date: datetime = Query(..., description="Availability analysis start date"),
    end_date: datetime = Query(..., description="Availability analysis end date"),
    db: Session = Depends(get_db)
):
    """
    Get detailed equipment availability for a date range.
    
    Returns available time slots, scheduled periods, and utilization metrics.
    """
    try:
        service = SchedulingService(db)
        availability = await service.get_equipment_availability(
            equipment_id, start_date, end_date
        )
        return availability
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get availability: {str(e)}"
        )


@router.get("/equipment/{equipment_id}/statistics", response_model=ScheduleStatistics)
async def get_schedule_statistics(
    equipment_id: int,
    start_date: datetime = Query(..., description="Statistics analysis start date"),
    end_date: datetime = Query(..., description="Statistics analysis end date"),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive scheduling statistics for equipment.
    
    Returns utilization metrics, schedule patterns, and performance data.
    """
    try:
        service = SchedulingService(db)
        statistics = await service.get_schedule_statistics(
            equipment_id, start_date, end_date
        )
        return statistics
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )


@router.post("/smart-suggest", response_model=SmartScheduleResponse)
async def get_smart_schedule_suggestions(
    request: SmartScheduleRequest,
    db: Session = Depends(get_db)
):
    """
    Get intelligent scheduling suggestions using AI-powered optimization.
    
    Analyzes equipment availability, project priorities, and historical patterns
    to suggest optimal scheduling slots.
    """
    try:
        service = SchedulingService(db)
        suggestions = await service.generate_smart_suggestions(request)
        return suggestions
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate suggestions: {str(e)}"
        )


@router.post("/bulk", response_model=BulkScheduleResponse)
async def create_bulk_schedules(
    bulk_request: BulkScheduleCreate,
    db: Session = Depends(get_db),
    current_user_id: int = 1  # TODO: Replace with actual auth dependency
):
    """
    Create multiple schedules in a single operation.
    
    Provides conflict detection and partial success handling.
    """
    # TODO: Implement bulk schedule creation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Bulk schedule creation functionality coming soon"
    )


# Equipment-specific schedule endpoints
@router.get("/equipment/{equipment_id}/schedules", response_model=List[ScheduleResponse])
async def get_equipment_schedules(
    equipment_id: int,
    start_date: Optional[datetime] = Query(None, description="Filter schedules starting after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter schedules ending before this date"),
    status: Optional[ScheduleStatus] = Query(None, description="Filter by schedule status"),
    db: Session = Depends(get_db)
):
    """
    Get all schedules for a specific piece of equipment.
    
    Useful for equipment-centric views and timeline displays.
    """
    from sqlalchemy import text
    
    conditions = ["es.equipment_id = :equipment_id"]
    params = {'equipment_id': equipment_id}
    
    if start_date:
        conditions.append("es.start_datetime >= :start_date")
        params['start_date'] = start_date
    
    if end_date:
        conditions.append("es.end_datetime <= :end_date")
        params['end_date'] = end_date
    
    if status:
        conditions.append("es.status = :status")
        params['status'] = status.value
    
    where_clause = " AND ".join(conditions)
    
    query = text(f"""
        SELECT 
            es.*,
            e.name as equipment_name,
            p.name as project_name,
            u.email as operator_name
        FROM equipment_schedules es
        JOIN equipment e ON es.equipment_id = e.id
        LEFT JOIN projects p ON es.project_id = p.id
        LEFT JOIN users u ON es.operator_id = u.id
        WHERE {where_clause}
        ORDER BY es.start_datetime ASC
    """)
    
    result = db.execute(query, params)
    
    schedules = []
    for row in result:
        schedules.append(ScheduleResponse(
            id=row.id,
            equipment_id=row.equipment_id,
            project_id=row.project_id,
            operator_id=row.operator_id,
            start_datetime=row.start_datetime,
            end_datetime=row.end_datetime,
            status=row.status,
            notes=row.notes,
            created_by=row.created_by,
            created_at=row.created_at,
            updated_at=row.updated_at,
            equipment_name=row.equipment_name,
            project_name=row.project_name,
            operator_name=row.operator_name
        ))
    
    return schedules


# Dashboard and overview endpoints
@router.get("/dashboard/overview")
async def get_scheduling_overview(
    date_range_days: int = Query(7, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get high-level scheduling overview for dashboard display.
    
    Returns key metrics and alerts for the specified time period.
    """
    from sqlalchemy import text
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=date_range_days)
    
    overview_query = text("""
        SELECT 
            COUNT(*) as total_schedules,
            COUNT(DISTINCT equipment_id) as equipment_scheduled,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_schedules,
            COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as upcoming_schedules,
            AVG(EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0) as avg_duration_hours
        FROM equipment_schedules
        WHERE start_datetime >= :start_date
            AND start_datetime <= :end_date
    """)
    
    result = db.execute(overview_query, {
        'start_date': start_date,
        'end_date': end_date
    })
    
    row = result.fetchone()
    
    return {
        "date_range": {
            "start": start_date,
            "end": end_date,
            "days": date_range_days
        },
        "metrics": {
            "total_schedules": row.total_schedules or 0,
            "equipment_scheduled": row.equipment_scheduled or 0,
            "active_schedules": row.active_schedules or 0,
            "upcoming_schedules": row.upcoming_schedules or 0,
            "average_duration_hours": round(row.avg_duration_hours or 0, 2)
        },
        "alerts": []  # TODO: Implement alert logic for conflicts, overdue schedules, etc.
    }
