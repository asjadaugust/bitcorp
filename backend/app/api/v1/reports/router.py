"""
Reports and Analytics API router
Provides endpoints for equipment valuation, performance analytics, and cost analysis
"""

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.api.v1.reports.schemas import (
    ReportRequest, ReportResponse, KPIMetrics, EquipmentPerformanceReport,
    FinancialSummary, ReportListResponse
)

router = APIRouter()


@router.get("/kpis", response_model=KPIMetrics, summary="Get KPI Metrics")
def get_kpi_metrics(
    date_range: int = Query(30, description="Number of days for metrics calculation"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get Key Performance Indicators (KPIs) for equipment management
    
    Based on PRD requirements:
    - Equipment utilization rates
    - Cost savings vs rental
    - Timesheet completion rates
    - Daily report compliance
    - Equipment downtime
    - ROI analysis
    """
    
    # Check if user has permission to view reports
    user_permissions = [perm.name for role in current_user.roles for perm in role.permissions]
    if "report_view" not in user_permissions:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Mock KPI data - in real implementation, this would query the database
    # and calculate actual metrics based on equipment usage, costs, etc.
    return KPIMetrics(
        equipment_utilization_rate=87.0,
        cost_savings_vs_rental=2500000.0,
        timesheet_completion_rate=96.0,
        daily_report_compliance=98.0,
        equipment_downtime=4.2,
        average_equipment_roi=285.0,
        date_range=date_range,
        last_updated=datetime.now()
    )


@router.get("/equipment-performance", response_model=List[EquipmentPerformanceReport])
def get_equipment_performance(
    equipment_type: Optional[str] = Query(None, description="Filter by equipment type"),
    date_range: int = Query(30, description="Number of days for analysis"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get equipment performance analytics
    
    Returns detailed performance metrics for each equipment including:
    - Utilization rates
    - Operating costs
    - ROI calculations
    - Status tracking
    """
    
    # Check permissions
    user_permissions = [perm.name for role in current_user.roles for perm in role.permissions]
    if "report_view" not in user_permissions:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Mock equipment performance data
    equipment_data = [
        EquipmentPerformanceReport(
            id=1,
            equipment_name="CAT 320D Excavator",
            equipment_type="Excavator",
            utilization_rate=89.0,
            total_hours=186,
            cost_per_hour=1200.0,
            total_cost=223200.0,
            roi=340.0,
            status="active",
            last_maintenance=datetime.now() - timedelta(days=15),
            next_maintenance=datetime.now() + timedelta(days=45)
        ),
        EquipmentPerformanceReport(
            id=2,
            equipment_name="Volvo A40F Truck",
            equipment_type="Dump Truck",
            utilization_rate=92.0,
            total_hours=201,
            cost_per_hour=950.0,
            total_cost=190950.0,
            roi=280.0,
            status="active",
            last_maintenance=datetime.now() - timedelta(days=8),
            next_maintenance=datetime.now() + timedelta(days=52)
        ),
        EquipmentPerformanceReport(
            id=3,
            equipment_name="JCB 3CX Backhoe",
            equipment_type="Backhoe",
            utilization_rate=78.0,
            total_hours=156,
            cost_per_hour=800.0,
            total_cost=124800.0,
            roi=195.0,
            status="maintenance",
            last_maintenance=datetime.now() - timedelta(days=2),
            next_maintenance=datetime.now() + timedelta(days=58)
        ),
        EquipmentPerformanceReport(
            id=4,
            equipment_name="Liebherr LTM 1050",
            equipment_type="Mobile Crane",
            utilization_rate=85.0,
            total_hours=145,
            cost_per_hour=1800.0,
            total_cost=261000.0,
            roi=420.0,
            status="active",
            last_maintenance=datetime.now() - timedelta(days=22),
            next_maintenance=datetime.now() + timedelta(days=38)
        )
    ]
    
    # Filter by equipment type if specified
    if equipment_type:
        equipment_data = [eq for eq in equipment_data if eq.equipment_type.lower() == equipment_type.lower()]
    
    return equipment_data


@router.get("/financial-summary", response_model=FinancialSummary)
def get_financial_summary(
    date_range: int = Query(30, description="Number of days for financial analysis"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get financial summary for equipment operations
    
    Includes:
    - Total operational costs
    - Cost savings analysis
    - Budget adherence
    - Revenue projections
    """
    
    # Check permissions
    user_permissions = [perm.name for role in current_user.roles for perm in role.permissions]
    if "report_view" not in user_permissions:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return FinancialSummary(
        total_operational_cost=799950.0,
        total_revenue=2285000.0,
        cost_savings=2500000.0,
        budget_adherence=94.5,
        profit_margin=65.2,
        date_range=date_range,
        last_updated=datetime.now()
    )


@router.post("/generate", response_model=ReportResponse)
def generate_report(
    report_request: ReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a custom report based on request parameters
    
    Supports various report types:
    - equipment_valuation: Equipment usage statements and valuations
    - performance_analytics: Equipment costs, utilization, and ROI
    - cost_analysis: Equipment usage costs and budget adherence
    - operator_performance: Operator productivity and salary calculations
    - maintenance_schedule: Equipment maintenance tracking
    """
    
    # Check permissions
    user_permissions = [perm.name for role in current_user.roles for perm in role.permissions]
    if "report_view" not in user_permissions:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Validate report type
    valid_types = [
        "equipment_valuation", "performance_analytics", "cost_analysis",
        "operator_performance", "maintenance_schedule"
    ]
    
    if report_request.report_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid report type. Must be one of: {valid_types}")
    
    # In real implementation, this would:
    # 1. Query database based on filters
    # 2. Process data according to report type
    # 3. Generate PDF/Excel file
    # 4. Store file and return download URL
    
    return ReportResponse(
        report_id=f"RPT_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        report_type=report_request.report_type,
        status="completed",
        file_url=f"/api/v1/reports/download/{report_request.report_type}_{datetime.now().strftime('%Y%m%d')}.pdf",
        generated_at=datetime.now(),
        file_size=1024 * 256  # Mock file size in bytes
    )


@router.get("/export/{report_type}")
def export_report_pdf(
    report_type: str,
    date_range: int = Query(30, description="Number of days for report data"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export report as PDF
    
    Generates and returns a PDF file for the specified report type
    """
    
    # Check export permissions
    user_permissions = [perm.name for role in current_user.roles for perm in role.permissions]
    if "report_export" not in user_permissions:
        raise HTTPException(status_code=403, detail="Not enough permissions to export reports")
    
    # In real implementation, this would:
    # 1. Generate the report data
    # 2. Create PDF using reportlab or similar
    # 3. Return the PDF file as response
    
    # For now, return a success message
    return {
        "message": f"PDF export for {report_type} initiated",
        "file_name": f"{report_type}_{datetime.now().strftime('%Y%m%d')}.pdf",
        "status": "generating"
    }


@router.get("/available", response_model=ReportListResponse)
def get_available_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of available reports based on user permissions
    """
    
    # Check permissions
    user_permissions = [perm.name for role in current_user.roles for perm in role.permissions]
    if "report_view" not in user_permissions:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Base reports available to all users with view permission
    available_reports = [
        {
            "id": "equipment_valuation",
            "name": "Equipment Valuation Report",
            "description": "Comprehensive equipment usage statements and valuations",
            "type": "equipment",
            "last_generated": "2024-08-15",
            "format": "PDF"
        },
        {
            "id": "performance_analytics",
            "name": "Performance Analytics Dashboard",
            "description": "Equipment costs, utilization, and ROI analysis",
            "type": "operational",
            "last_generated": "2024-08-16",
            "format": "PDF"
        }
    ]
    
    # Additional reports for managers and admins
    if any(role.name in ["admin", "planning_engineer", "cost_engineer"] for role in current_user.roles):
        available_reports.extend([
            {
                "id": "cost_analysis",
                "name": "Cost Analysis Report",
                "description": "Equipment usage costs and budget adherence",
                "type": "financial",
                "last_generated": "2024-08-14",
                "format": "Excel"
            },
            {
                "id": "operator_performance",
                "name": "Operator Performance Report",
                "description": "Operator productivity and salary calculations",
                "type": "operational",
                "last_generated": "2024-08-13",
                "format": "PDF"
            }
        ])
    
    # Admin-only reports
    if any(role.name == "admin" for role in current_user.roles):
        available_reports.append({
            "id": "maintenance_schedule",
            "name": "Maintenance Schedule Report",
            "description": "Equipment maintenance tracking and optimization",
            "type": "maintenance",
            "last_generated": "2024-08-12",
            "format": "CSV"
        })
    
    return ReportListResponse(
        reports=available_reports,
        total_count=len(available_reports)
    )
