"""
Analytics API Router - Token-gated premium features
Provides advanced analytics and reporting capabilities
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import math

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.equipment import Equipment
from app.middleware.license_middleware import get_license_service
from app.services.license_service import LicenseService
from pydantic import BaseModel

router = APIRouter()


# Response models
class EquipmentUtilizationResponse(BaseModel):
    equipment_id: int
    equipment_name: str
    total_hours: float
    utilization_percentage: float
    revenue_generated: Decimal
    efficiency_score: float


class EquipmentTypeBreakdownResponse(BaseModel):
    equipment_type: str
    count: int
    total_value: Decimal
    average_age: float
    utilization_rate: float


class MonthlyRevenueResponse(BaseModel):
    month: str
    total_revenue: Decimal
    equipment_count: int
    average_hourly_rate: Decimal


class AIInsightResponse(BaseModel):
    insight_type: str
    title: str
    description: str
    impact_score: int  # 1-10
    recommended_actions: List[str]
    data_points: Dict[str, Any]


@router.get("/utilization-report", response_model=List[EquipmentUtilizationResponse])
async def get_equipment_utilization_report(
    days: int = Query(30, ge=1, le=365, description="Days to analyze"),
    min_hours: float = Query(0, ge=0, description="Minimum hours filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    license_service: LicenseService = Depends(get_license_service)
):
    """
    Generate equipment utilization report - Requires 5 tokens
    Shows which equipment is being used most efficiently
    """
    
    # Check and consume tokens
    license_service.consume_tokens(
        str(current_user.id),
        "utilization_report",
        5,
        "/analytics/utilization-report"
    )
    
    # Note: Date range would be used for actual database queries in production
    # end_date = datetime.utcnow()
    # start_date = end_date - timedelta(days=days)
    
    # Get equipment with calculated utilization
    # This would normally join with actual usage/scheduling data
    # For demo, we'll calculate mock utilization
    equipment_query = db.query(Equipment).filter(Equipment.is_active.is_(True))
    
    utilization_data = []
    for equipment in equipment_query.all():
        # Mock calculations - in real app, this would use actual scheduling/usage data
        mock_hours = float(equipment.hourly_rate) * 0.5  # Mock total hours
        max_possible_hours = days * 24.0  # Theoretical maximum
        utilization_percentage = min((mock_hours / max_possible_hours) * 100, 100)
        revenue_generated = equipment.hourly_rate * Decimal(str(mock_hours))
        efficiency_score = utilization_percentage * 0.01 * 10  # Convert to 1-10 scale
        
        if mock_hours >= min_hours:
            utilization_data.append(EquipmentUtilizationResponse(
                equipment_id=equipment.id,
                equipment_name=equipment.name,
                total_hours=mock_hours,
                utilization_percentage=utilization_percentage,
                revenue_generated=revenue_generated,
                efficiency_score=efficiency_score
            ))
    
    # Sort by utilization percentage descending
    utilization_data.sort(key=lambda x: x.utilization_percentage, reverse=True)
    
    return utilization_data


@router.get("/equipment-breakdown", response_model=List[EquipmentTypeBreakdownResponse])
async def get_equipment_type_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    license_service: LicenseService = Depends(get_license_service)
):
    """
    Analyze equipment by type - Requires 3 tokens
    Provides breakdown of equipment portfolio by type
    """
    
    # Check and consume tokens
    license_service.consume_tokens(
        str(current_user.id),
        "equipment_breakdown",
        3,
        "/analytics/equipment-breakdown"
    )
    
    # Group equipment by type and calculate metrics
    type_stats = db.query(
        Equipment.equipment_type,
        func.count(Equipment.id).label('count'),
        func.sum(Equipment.purchase_price).label('total_value'),
        func.avg(2024 - Equipment.year_manufactured).label('average_age'),
        func.avg(Equipment.hourly_rate).label('avg_rate')
    ).filter(
        Equipment.is_active.is_(True)
    ).group_by(Equipment.equipment_type).all()
    
    breakdown_data = []
    for stat in type_stats:
        # Mock utilization rate calculation
        mock_utilization = min(float(stat.avg_rate or 0) * 1.5, 95.0)
        
        breakdown_data.append(EquipmentTypeBreakdownResponse(
            equipment_type=stat.equipment_type,
            count=stat.count,
            total_value=stat.total_value or Decimal('0'),
            average_age=float(stat.average_age or 0),
            utilization_rate=mock_utilization
        ))
    
    return breakdown_data


@router.get("/ai-insights", response_model=List[AIInsightResponse])
async def get_ai_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    license_service: LicenseService = Depends(get_license_service)
):
    """
    AI-powered business insights - Requires 10 tokens
    Advanced analytics using machine learning algorithms
    """
    
    # Check and consume tokens
    license_service.consume_tokens(
        str(current_user.id),
        "ai_insights",
        10,
        "/analytics/ai-insights"
    )
    
    # Get equipment data for analysis
    equipment_count = db.query(Equipment).filter(Equipment.is_active.is_(True)).count()
    avg_age = db.query(func.avg(2024 - Equipment.year_manufactured)).filter(
        Equipment.is_active.is_(True)
    ).scalar() or 0
    
    total_value = db.query(func.sum(Equipment.purchase_price)).filter(
        Equipment.is_active.is_(True)
    ).scalar() or Decimal('0')
    
    # Generate mock AI insights based on data analysis
    insights = []
    
    # Fleet age insight
    if avg_age > 8:
        insights.append(AIInsightResponse(
            insight_type="fleet_modernization",
            title="Equipment Fleet Aging",
            description=f"Your fleet has an average age of {avg_age:.1f} years. Aging equipment may impact productivity and increase maintenance costs.",
            impact_score=7,
            recommended_actions=[
                "Consider replacement plan for equipment older than 10 years",
                "Increase preventive maintenance frequency",
                "Evaluate lease vs. purchase options for newer models"
            ],
            data_points={
                "average_age": avg_age,
                "equipment_count": equipment_count,
                "maintenance_cost_increase": "15-25%"
            }
        ))
    
    # Utilization optimization insight
    insights.append(AIInsightResponse(
        insight_type="utilization_optimization",
        title="Equipment Utilization Opportunities",
        description="Analysis shows potential for 20% improvement in equipment utilization through better scheduling.",
        impact_score=8,
        recommended_actions=[
            "Implement dynamic scheduling system",
            "Cross-train operators on multiple equipment types",
            "Consider equipment sharing between projects"
        ],
        data_points={
            "current_utilization": "65%",
            "potential_utilization": "85%",
            "estimated_revenue_increase": f"${float(total_value) * 0.15:.0f}"
        }
    ))
    
    # Financial optimization insight
    if equipment_count > 5:
        insights.append(AIInsightResponse(
            insight_type="financial_optimization",
            title="Portfolio Optimization",
            description="Your equipment portfolio shows opportunity for cost optimization through strategic consolidation.",
            impact_score=6,
            recommended_actions=[
                "Analyze equipment overlap and redundancy",
                "Consider selling underutilized assets",
                "Optimize insurance and financing structures"
            ],
            data_points={
                "total_portfolio_value": str(total_value),
                "optimization_potential": "8-12%",
                "equipment_count": equipment_count
            }
        ))
    
    return insights


@router.get("/monthly-revenue", response_model=List[MonthlyRevenueResponse])
async def get_monthly_revenue_trends(
    months: int = Query(12, ge=1, le=24, description="Number of months to analyze"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    license_service: LicenseService = Depends(get_license_service)
):
    """
    Monthly revenue trend analysis - Requires 5 tokens
    Shows revenue patterns and seasonality
    """
    
    # Check and consume tokens
    license_service.consume_tokens(
        str(current_user.id),
        "revenue_trends",
        5,
        "/analytics/monthly-revenue"
    )
    
    # Get equipment data
    equipment_stats = db.query(
        func.count(Equipment.id).label('count'),
        func.avg(Equipment.hourly_rate).label('avg_rate')
    ).filter(Equipment.is_active.is_(True)).first()
    
    # Generate mock monthly data
    revenue_data = []
    base_date = datetime.utcnow() - timedelta(days=months * 30)
    
    for i in range(months):
        month_date = base_date + timedelta(days=i * 30)
        month_name = month_date.strftime("%Y-%m")
        
        # Mock revenue calculation with seasonal variation
        seasonal_factor = 1.0 + 0.2 * math.sin(i * 0.5)  # Simulate seasonality
        base_revenue = float(equipment_stats.avg_rate or 50) * (equipment_stats.count or 1) * 100
        monthly_revenue = Decimal(str(base_revenue * seasonal_factor))
        
        revenue_data.append(MonthlyRevenueResponse(
            month=month_name,
            total_revenue=monthly_revenue,
            equipment_count=equipment_stats.count or 0,
            average_hourly_rate=equipment_stats.avg_rate or Decimal('0')
        ))
    
    return revenue_data


@router.get("/custom-dashboard")
async def get_custom_dashboard_data(
    widgets: str = Query(..., description="Comma-separated list of widget types"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    license_service: LicenseService = Depends(get_license_service)
):
    """
    Custom dashboard data - Requires 8 tokens
    Generates data for user-defined dashboard widgets
    """
    
    # Check and consume tokens
    license_service.consume_tokens(
        str(current_user.id),
        "custom_dashboard",
        8,
        "/analytics/custom-dashboard"
    )
    
    widget_list = [w.strip() for w in widgets.split(',')]
    dashboard_data = {}
    
    # Generate data based on requested widgets
    for widget in widget_list:
        if widget == "summary_cards":
            equipment_count = db.query(Equipment).filter(Equipment.is_active.is_(True)).count()
            total_value = db.query(func.sum(Equipment.purchase_price)).filter(
                Equipment.is_active.is_(True)
            ).scalar() or Decimal('0')
            
            dashboard_data["summary_cards"] = {
                "total_equipment": equipment_count,
                "total_value": str(total_value),
                "active_percentage": 95.2,
                "monthly_revenue": "45,780"
            }
        
        elif widget == "utilization_chart":
            dashboard_data["utilization_chart"] = {
                "labels": ["Excavators", "Bulldozers", "Cranes", "Trucks"],
                "data": [85.2, 78.9, 92.1, 67.4]
            }
        
        elif widget == "maintenance_alerts":
            dashboard_data["maintenance_alerts"] = [
                {"equipment": "CAT 320 Excavator", "type": "Scheduled", "due_date": "2024-01-15"},
                {"equipment": "John Deere 850K", "type": "Overdue", "due_date": "2024-01-10"},
                {"equipment": "Komatsu PC290", "type": "Upcoming", "due_date": "2024-01-20"}
            ]
    
    return {
        "dashboard_data": dashboard_data,
        "generated_at": datetime.utcnow().isoformat(),
        "widgets_included": widget_list
    }


import math
