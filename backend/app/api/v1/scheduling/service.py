# Equipment Scheduling Service - Business Logic Layer
# Implements core scheduling functionality, conflict detection, and availability management

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, text
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from app.models.equipment import Equipment
from app.models.user import User
from .schemas import (
    ScheduleCreate, ScheduleUpdate, ScheduleResponse, ScheduleConflict,
    ConflictSeverity, EquipmentAvailability, TimeSlot, SlotType,
    ConflictCheckResponse, ScheduleStatistics, ScheduleSuggestion,
    SmartScheduleRequest, SmartScheduleResponse
)

logger = logging.getLogger(__name__)


class SchedulingService:
    """
    Core scheduling service providing equipment scheduling business logic.
    
    This service handles:
    - Schedule creation and management
    - Conflict detection and resolution
    - Availability calculation
    - Smart scheduling suggestions
    - Utilization analytics
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_schedule(
        self, 
        schedule_data: ScheduleCreate, 
        created_by: int
    ) -> ScheduleResponse:
        """
        Create a new equipment schedule with conflict detection.
        
        Args:
            schedule_data: Schedule creation data
            created_by: User ID creating the schedule
            
        Returns:
            Created schedule with full details
            
        Raises:
            ValueError: If equipment not found or conflicts detected
        """
        logger.info(f"Creating schedule for equipment {schedule_data.equipment_id}")
        
        # Verify equipment exists and is available for scheduling
        equipment = self.db.query(Equipment).filter(
            and_(
                Equipment.id == schedule_data.equipment_id,
                Equipment.is_active.is_(True),
                Equipment.status.in_(['available', 'in_use'])
            )
        ).first()
        
        if not equipment:
            raise ValueError(f"Equipment {schedule_data.equipment_id} not found or not available for scheduling")
        
        # Check for conflicts
        conflicts = await self.check_conflicts(
            schedule_data.equipment_id,
            schedule_data.start_datetime,
            schedule_data.end_datetime
        )
        
        # Block creation if hard conflicts exist
        error_conflicts = [c for c in conflicts if c.severity == ConflictSeverity.ERROR]
        if error_conflicts:
            conflict_messages = [c.message for c in error_conflicts]
            raise ValueError(f"Schedule conflicts detected: {'; '.join(conflict_messages)}")
        
        # Create the schedule using raw SQL to match our database schema
        schedule_query = text("""
            INSERT INTO equipment_schedules (
                equipment_id, project_id, operator_id, start_datetime, 
                end_datetime, status, notes, created_by
            ) VALUES (
                :equipment_id, :project_id, :operator_id, :start_datetime,
                :end_datetime, 'scheduled', :notes, :created_by
            ) RETURNING id, created_at, updated_at
        """)
        
        result = self.db.execute(schedule_query, {
            'equipment_id': schedule_data.equipment_id,
            'project_id': schedule_data.project_id,
            'operator_id': schedule_data.operator_id,
            'start_datetime': schedule_data.start_datetime,
            'end_datetime': schedule_data.end_datetime,
            'notes': schedule_data.notes,
            'created_by': created_by
        })
        
        schedule_row = result.fetchone()
        self.db.commit()
        
        # Return populated schedule response
        return ScheduleResponse(
            id=schedule_row.id,
            equipment_id=schedule_data.equipment_id,
            project_id=schedule_data.project_id,
            operator_id=schedule_data.operator_id,
            start_datetime=schedule_data.start_datetime,
            end_datetime=schedule_data.end_datetime,
            status='scheduled',
            notes=schedule_data.notes,
            created_by=created_by,
            created_at=schedule_row.created_at,
            updated_at=schedule_row.updated_at,
            equipment_name=equipment.name
        )
    
    async def get_schedule(self, schedule_id: int) -> Optional[ScheduleResponse]:
        """
        Retrieve a schedule by ID with related entity information.
        
        Args:
            schedule_id: Schedule ID to retrieve
            
        Returns:
            Schedule details or None if not found
        """
        schedule_query = text("""
            SELECT 
                es.*,
                e.name as equipment_name,
                p.name as project_name,
                u.email as operator_name
            FROM equipment_schedules es
            JOIN equipment e ON es.equipment_id = e.id
            LEFT JOIN projects p ON es.project_id = p.id
            LEFT JOIN users u ON es.operator_id = u.id
            WHERE es.id = :schedule_id
        """)
        
        result = self.db.execute(schedule_query, {'schedule_id': schedule_id})
        row = result.fetchone()
        
        if not row:
            return None
        
        return ScheduleResponse(
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
        )
    
    async def check_conflicts(
        self,
        equipment_id: int,
        start_datetime: datetime,
        end_datetime: datetime,
        exclude_schedule_id: Optional[int] = None
    ) -> List[ScheduleConflict]:
        """
        Advanced conflict detection with severity classification.
        
        Args:
            equipment_id: Equipment to check conflicts for
            start_datetime: Proposed start time
            end_datetime: Proposed end time
            exclude_schedule_id: Schedule ID to exclude from conflict check
            
        Returns:
            List of detected conflicts with severity levels
        """
        logger.debug(f"Checking conflicts for equipment {equipment_id} from {start_datetime} to {end_datetime}")
        
        # Use the database function we created
        conflict_query = text("""
            SELECT * FROM check_schedule_conflicts(
                :equipment_id, :start_datetime, :end_datetime, :exclude_schedule_id
            )
        """)
        
        result = self.db.execute(conflict_query, {
            'equipment_id': equipment_id,
            'start_datetime': start_datetime,
            'end_datetime': end_datetime,
            'exclude_schedule_id': exclude_schedule_id
        })
        
        conflicts = []
        for row in result:
            # Create human-readable conflict message
            if row.severity == 'error':
                message = f"Direct overlap ({row.overlap_hours:.1f} hours) with schedule #{row.conflicting_schedule_id}"
            elif row.severity == 'warning':
                message = f"Adjacent to schedule #{row.conflicting_schedule_id} (potential timing conflict)"
            else:
                message = f"Near schedule #{row.conflicting_schedule_id} (consider buffer time)"
            
            conflicts.append(ScheduleConflict(
                conflicting_schedule_id=row.conflicting_schedule_id,
                equipment_id=equipment_id,
                conflict_start=row.conflict_start,
                conflict_end=row.conflict_end,
                overlap_hours=row.overlap_hours,
                severity=ConflictSeverity(row.severity),
                message=message
            ))
        
        logger.info(f"Found {len(conflicts)} conflicts for equipment {equipment_id}")
        return conflicts
    
    async def get_equipment_availability(
        self,
        equipment_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> EquipmentAvailability:
        """
        Calculate equipment availability and utilization for a date range.
        
        Args:
            equipment_id: Equipment ID to analyze
            start_date: Analysis period start
            end_date: Analysis period end
            
        Returns:
            Detailed availability information with time slots
        """
        logger.debug(f"Calculating availability for equipment {equipment_id} from {start_date} to {end_date}")
        
        # Get equipment name
        equipment = self.db.query(Equipment).filter(Equipment.id == equipment_id).first()
        if not equipment:
            raise ValueError(f"Equipment {equipment_id} not found")
        
        # Use the database function to get availability slots
        availability_query = text("""
            SELECT * FROM get_equipment_availability(
                :equipment_id, :start_date, :end_date
            ) ORDER BY time_slot_start
        """)
        
        result = self.db.execute(availability_query, {
            'equipment_id': equipment_id,
            'start_date': start_date,
            'end_date': end_date
        })
        
        available_slots = []
        scheduled_slots = []
        total_available_hours = 0.0
        total_scheduled_hours = 0.0
        
        for row in result:
            slot = TimeSlot(
                time_slot_start=row.time_slot_start,
                time_slot_end=row.time_slot_end,
                duration_hours=row.duration_hours,
                slot_type=SlotType(row.slot_type)
            )
            
            if row.slot_type == 'available':
                available_slots.append(slot)
                total_available_hours += row.duration_hours
            else:
                scheduled_slots.append(slot)
                total_scheduled_hours += row.duration_hours
        
        # Calculate utilization percentage
        total_period_hours = (end_date - start_date).total_seconds() / 3600.0
        utilization_percentage = (total_scheduled_hours / total_period_hours * 100) if total_period_hours > 0 else 0.0
        
        return EquipmentAvailability(
            equipment_id=equipment_id,
            equipment_name=equipment.name,
            date_range_start=start_date,
            date_range_end=end_date,
            available_slots=available_slots,
            scheduled_slots=scheduled_slots,
            total_available_hours=total_available_hours,
            total_scheduled_hours=total_scheduled_hours,
            utilization_percentage=round(utilization_percentage, 2)
        )
    
    async def get_schedule_statistics(
        self,
        equipment_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> ScheduleStatistics:
        """
        Generate comprehensive scheduling statistics for equipment.
        
        Args:
            equipment_id: Equipment ID to analyze
            start_date: Analysis period start
            end_date: Analysis period end
            
        Returns:
            Detailed scheduling statistics
        """
        # Get equipment name
        equipment = self.db.query(Equipment).filter(Equipment.id == equipment_id).first()
        if not equipment:
            raise ValueError(f"Equipment {equipment_id} not found")
        
        # Get schedule statistics
        stats_query = text("""
            SELECT 
                COUNT(*) as total_schedules,
                COALESCE(SUM(EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0), 0) as total_hours,
                COALESCE(AVG(EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0), 0) as avg_duration,
                p.name as most_common_project
            FROM equipment_schedules es
            LEFT JOIN projects p ON es.project_id = p.id
            WHERE es.equipment_id = :equipment_id
                AND es.start_datetime >= :start_date
                AND es.end_datetime <= :end_date
                AND es.status IN ('scheduled', 'active', 'completed')
            GROUP BY p.name
            ORDER BY COUNT(*) DESC
            LIMIT 1
        """)
        
        result = self.db.execute(stats_query, {
            'equipment_id': equipment_id,
            'start_date': start_date,
            'end_date': end_date
        })
        
        row = result.fetchone()
        
        if not row or row.total_schedules == 0:
            # No schedules found
            return ScheduleStatistics(
                equipment_id=equipment_id,
                equipment_name=equipment.name,
                date_range_start=start_date,
                date_range_end=end_date,
                total_schedules=0,
                total_scheduled_hours=0.0,
                average_schedule_duration=0.0,
                utilization_rate=0.0,
                most_common_project=None,
                peak_usage_day=None
            )
        
        # Calculate utilization rate
        total_period_hours = (end_date - start_date).total_seconds() / 3600.0
        utilization_rate = (row.total_hours / total_period_hours * 100) if total_period_hours > 0 else 0.0
        
        return ScheduleStatistics(
            equipment_id=equipment_id,
            equipment_name=equipment.name,
            date_range_start=start_date,
            date_range_end=end_date,
            total_schedules=row.total_schedules,
            total_scheduled_hours=round(row.total_hours, 2),
            average_schedule_duration=round(row.avg_duration, 2),
            utilization_rate=round(utilization_rate, 2),
            most_common_project=row.most_common_project,
            peak_usage_day=None  # TODO: Implement day-of-week analysis
        )
    
    async def generate_smart_suggestions(
        self,
        request: SmartScheduleRequest
    ) -> SmartScheduleResponse:
        """
        Generate intelligent scheduling suggestions using availability analysis.
        
        Args:
            request: Smart scheduling request parameters
            
        Returns:
            List of suggested time slots with confidence scores
        """
        logger.info(f"Generating smart suggestions for equipment {request.equipment_id}")
        
        # Get equipment name
        equipment = self.db.query(Equipment).filter(Equipment.id == request.equipment_id).first()
        if not equipment:
            raise ValueError(f"Equipment {request.equipment_id} not found")
        
        # Get availability for the requested period
        availability = await self.get_equipment_availability(
            request.equipment_id,
            request.date_range_start,
            request.date_range_end
        )
        
        suggestions = []
        
        # Find slots that can accommodate the requested duration
        for slot in availability.available_slots:
            if slot.duration_hours >= request.desired_duration_hours:
                # Calculate confidence score based on various factors
                confidence_score = self._calculate_confidence_score(
                    slot, request, availability.utilization_percentage
                )
                
                # Calculate optimal start time within the slot
                if request.preferred_start and request.preferred_start >= slot.time_slot_start:
                    suggested_start = min(request.preferred_start, 
                                        slot.time_slot_end - timedelta(hours=request.desired_duration_hours))
                else:
                    suggested_start = slot.time_slot_start
                
                suggested_end = suggested_start + timedelta(hours=request.desired_duration_hours)
                
                suggestion = ScheduleSuggestion(
                    equipment_id=request.equipment_id,
                    suggested_start=suggested_start,
                    suggested_end=suggested_end,
                    confidence_score=confidence_score,
                    reason=self._generate_suggestion_reason(slot, request, confidence_score),
                    conflicts=[]  # No conflicts since we're using available slots
                )
                
                suggestions.append(suggestion)
        
        # Sort by confidence score
        suggestions.sort(key=lambda s: s.confidence_score, reverse=True)
        
        # Find best suggestion
        best_suggestion = suggestions[0] if suggestions else None
        
        return SmartScheduleResponse(
            equipment_id=request.equipment_id,
            equipment_name=equipment.name,
            requested_duration=request.desired_duration_hours,
            suggestions=suggestions[:5],  # Return top 5 suggestions
            best_suggestion=best_suggestion,
            alternative_equipment=[]  # TODO: Implement alternative equipment logic
        )
    
    def _calculate_confidence_score(
        self, 
        slot: TimeSlot, 
        request: SmartScheduleRequest,
        current_utilization: float
    ) -> float:
        """
        Calculate confidence score for a scheduling suggestion.
        
        Factors considered:
        - Slot duration vs requested duration
        - Preferred time proximity
        - Current equipment utilization
        - Priority level
        """
        base_score = 0.5
        
        # Slot duration factor (prefer slots that closely match requested duration)
        duration_ratio = request.desired_duration_hours / slot.duration_hours
        if duration_ratio > 0.8:  # Good fit
            base_score += 0.2
        elif duration_ratio > 0.5:  # Acceptable fit
            base_score += 0.1
        
        # Preferred time factor
        if request.preferred_start:
            time_diff = abs((slot.time_slot_start - request.preferred_start).total_seconds())
            if time_diff < 3600:  # Within 1 hour
                base_score += 0.2
            elif time_diff < 86400:  # Within 1 day
                base_score += 0.1
        
        # Utilization factor (prefer scheduling when equipment is already being used efficiently)
        if 60 <= current_utilization <= 80:  # Optimal utilization range
            base_score += 0.1
        
        # Priority factor
        priority_bonus = (request.priority - 1) * 0.05  # 0.0 to 0.2 bonus
        base_score += priority_bonus
        
        return min(1.0, base_score)  # Cap at 1.0
    
    def _generate_suggestion_reason(
        self, 
        slot: TimeSlot, 
        request: SmartScheduleRequest,
        confidence_score: float
    ) -> str:
        """Generate human-readable reason for suggestion"""
        if confidence_score > 0.8:
            return f"Excellent fit: {slot.duration_hours:.1f}h slot perfectly matches your {request.desired_duration_hours:.1f}h request"
        elif confidence_score > 0.6:
            return f"Good fit: {slot.duration_hours:.1f}h slot available for your {request.desired_duration_hours:.1f}h request"
        else:
            return f"Available slot: {slot.duration_hours:.1f}h slot can accommodate your {request.desired_duration_hours:.1f}h request"
