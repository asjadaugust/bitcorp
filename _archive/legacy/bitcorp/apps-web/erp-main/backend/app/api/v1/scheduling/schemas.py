# Equipment Scheduling API - Pydantic Schemas
# Defines data validation and serialization schemas for the scheduling system

from pydantic import BaseModel, Field, ConfigDict, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ScheduleStatus(str, Enum):
    """Equipment schedule status enum"""
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ConflictSeverity(str, Enum):
    """Schedule conflict severity levels"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class SlotType(str, Enum):
    """Availability slot types"""
    AVAILABLE = "available"
    SCHEDULED = "scheduled"


# Base schedule schema
class ScheduleBase(BaseModel):
    """Base schedule data structure"""
    equipment_id: int = Field(..., description="Equipment ID to schedule")
    project_id: Optional[int] = Field(None, description="Associated project ID")
    operator_id: Optional[int] = Field(None, description="Assigned operator ID")
    start_datetime: datetime = Field(..., description="Schedule start date and time")
    end_datetime: datetime = Field(..., description="Schedule end date and time")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")

    @validator('end_datetime')
    def validate_date_range(cls, v, values):
        """Ensure end datetime is after start datetime"""
        if 'start_datetime' in values and v <= values['start_datetime']:
            raise ValueError('End datetime must be after start datetime')
        return v


# Schedule creation schema
class ScheduleCreate(ScheduleBase):
    """Schema for creating new schedules"""
    
    @validator('start_datetime')
    def validate_future_start(cls, v):
        """Ensure schedule starts in the future (with some tolerance)"""
        if v < datetime.now():
            # Allow scheduling up to 1 hour in the past for flexibility
            if (datetime.now() - v).total_seconds() > 3600:
                raise ValueError('Schedule start time cannot be more than 1 hour in the past')
        return v


# Schedule update schema
class ScheduleUpdate(BaseModel):
    """Schema for updating existing schedules"""
    project_id: Optional[int] = Field(None, description="Associated project ID")
    operator_id: Optional[int] = Field(None, description="Assigned operator ID")
    start_datetime: Optional[datetime] = Field(None, description="Schedule start date and time")
    end_datetime: Optional[datetime] = Field(None, description="Schedule end date and time")
    status: Optional[ScheduleStatus] = Field(None, description="Schedule status")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")


# Schedule response schema
class ScheduleResponse(ScheduleBase):
    """Complete schedule information for API responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int = Field(..., description="Schedule ID")
    status: ScheduleStatus = Field(..., description="Current schedule status")
    created_by: int = Field(..., description="User ID who created the schedule")
    created_at: datetime = Field(..., description="Schedule creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Optional related entity information (populated by joins)
    equipment_name: Optional[str] = Field(None, description="Equipment name")
    project_name: Optional[str] = Field(None, description="Project name")
    operator_name: Optional[str] = Field(None, description="Operator name")


# Schedule conflict detection
class ScheduleConflict(BaseModel):
    """Schedule conflict information"""
    conflicting_schedule_id: int = Field(..., description="ID of conflicting schedule")
    equipment_id: int = Field(..., description="Equipment ID with conflict")
    conflict_start: datetime = Field(..., description="Overlap start time")
    conflict_end: datetime = Field(..., description="Overlap end time")
    overlap_hours: float = Field(..., description="Number of overlapping hours")
    severity: ConflictSeverity = Field(..., description="Conflict severity level")
    message: str = Field(..., description="Human-readable conflict description")


# Equipment availability time slot
class TimeSlot(BaseModel):
    """Available or scheduled time slot"""
    time_slot_start: datetime = Field(..., description="Slot start time")
    time_slot_end: datetime = Field(..., description="Slot end time")
    duration_hours: float = Field(..., description="Slot duration in hours")
    slot_type: SlotType = Field(..., description="Slot type (available/scheduled)")


# Equipment availability response
class EquipmentAvailability(BaseModel):
    """Equipment availability information"""
    equipment_id: int = Field(..., description="Equipment ID")
    equipment_name: str = Field(..., description="Equipment name")
    date_range_start: datetime = Field(..., description="Query date range start")
    date_range_end: datetime = Field(..., description="Query date range end")
    available_slots: List[TimeSlot] = Field(..., description="Available time slots")
    scheduled_slots: List[TimeSlot] = Field(..., description="Scheduled time slots")
    total_available_hours: float = Field(..., description="Total available hours in range")
    total_scheduled_hours: float = Field(..., description="Total scheduled hours in range")
    utilization_percentage: float = Field(..., description="Equipment utilization percentage")


# Conflict check request
class ConflictCheckRequest(BaseModel):
    """Request schema for conflict checking"""
    equipment_id: int = Field(..., description="Equipment ID to check")
    start_datetime: datetime = Field(..., description="Proposed start time")
    end_datetime: datetime = Field(..., description="Proposed end time")
    exclude_schedule_id: Optional[int] = Field(None, description="Schedule ID to exclude from conflict check")


# Conflict check response
class ConflictCheckResponse(BaseModel):
    """Response schema for conflict checking"""
    has_conflicts: bool = Field(..., description="Whether conflicts were found")
    conflicts: List[ScheduleConflict] = Field(..., description="List of detected conflicts")
    severity_level: ConflictSeverity = Field(..., description="Highest severity level found")
    message: str = Field(..., description="Summary message")


# Schedule list response with pagination
class ScheduleListResponse(BaseModel):
    """Paginated schedule list response"""
    schedules: List[ScheduleResponse] = Field(..., description="List of schedules")
    total: int = Field(..., description="Total number of schedules")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_previous: bool = Field(..., description="Whether there are previous pages")


# Bulk schedule operations
class BulkScheduleCreate(BaseModel):
    """Schema for creating multiple schedules at once"""
    schedules: List[ScheduleCreate] = Field(..., description="List of schedules to create")
    force_create: bool = Field(False, description="Create schedules even if minor conflicts exist")


class BulkScheduleResponse(BaseModel):
    """Response for bulk schedule operations"""
    successful: List[ScheduleResponse] = Field(..., description="Successfully created schedules")
    failed: List[dict] = Field(..., description="Failed schedule creation attempts with errors")
    conflicts_detected: List[ScheduleConflict] = Field(..., description="All conflicts detected during bulk operation")


# Schedule statistics
class ScheduleStatistics(BaseModel):
    """Equipment scheduling statistics"""
    equipment_id: int = Field(..., description="Equipment ID")
    equipment_name: str = Field(..., description="Equipment name")
    date_range_start: datetime = Field(..., description="Statistics date range start")
    date_range_end: datetime = Field(..., description="Statistics date range end")
    total_schedules: int = Field(..., description="Total number of schedules")
    total_scheduled_hours: float = Field(..., description="Total scheduled hours")
    average_schedule_duration: float = Field(..., description="Average schedule duration in hours")
    utilization_rate: float = Field(..., description="Equipment utilization rate (0-100)")
    most_common_project: Optional[str] = Field(None, description="Most frequently scheduled project")
    peak_usage_day: Optional[str] = Field(None, description="Day of week with highest usage")


# Smart scheduling suggestions
class ScheduleSuggestion(BaseModel):
    """Intelligent schedule suggestion"""
    equipment_id: int = Field(..., description="Equipment ID")
    suggested_start: datetime = Field(..., description="Suggested start time")
    suggested_end: datetime = Field(..., description="Suggested end time")
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    reason: str = Field(..., description="Explanation for this suggestion")
    conflicts: List[ScheduleConflict] = Field(default=[], description="Any minor conflicts")


class SmartScheduleRequest(BaseModel):
    """Request for smart scheduling suggestions"""
    equipment_id: int = Field(..., description="Equipment ID to schedule")
    desired_duration_hours: float = Field(..., gt=0, description="Desired duration in hours")
    preferred_start: Optional[datetime] = Field(None, description="Preferred start time")
    date_range_start: datetime = Field(..., description="Earliest acceptable start time")
    date_range_end: datetime = Field(..., description="Latest acceptable end time")
    project_id: Optional[int] = Field(None, description="Associated project ID")
    priority: int = Field(1, ge=1, le=5, description="Scheduling priority (1=low, 5=urgent)")


class SmartScheduleResponse(BaseModel):
    """Response with smart scheduling suggestions"""
    equipment_id: int = Field(..., description="Equipment ID")
    equipment_name: str = Field(..., description="Equipment name")
    requested_duration: float = Field(..., description="Requested duration in hours")
    suggestions: List[ScheduleSuggestion] = Field(..., description="List of suggested time slots")
    best_suggestion: Optional[ScheduleSuggestion] = Field(None, description="Highest confidence suggestion")
    alternative_equipment: List[int] = Field(default=[], description="Alternative equipment IDs if no good slots found")
