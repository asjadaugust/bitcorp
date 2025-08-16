"""
Reports and Analytics Pydantic schemas
Data models for reports API endpoints
"""

from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field


class ReportRequest(BaseModel):
    """Request model for generating reports"""
    report_type: str = Field(..., description="Type of report to generate")
    date_from: Optional[datetime] = Field(None, description="Start date for report data")
    date_to: Optional[datetime] = Field(None, description="End date for report data")
    equipment_filter: Optional[str] = Field(None, description="Filter reports by equipment type")
    format: str = Field("PDF", description="Report format (PDF, Excel, CSV)")
    include_charts: bool = Field(True, description="Include charts and visualizations")
    filters: Optional[Dict[str, Any]] = Field(None, description="Additional filters")


class ReportResponse(BaseModel):
    """Response model for generated reports"""
    report_id: str = Field(..., description="Unique identifier for the report")
    report_type: str = Field(..., description="Type of report generated")
    status: str = Field(..., description="Generation status (generating, completed, failed)")
    file_url: Optional[str] = Field(None, description="Download URL for the report file")
    generated_at: datetime = Field(..., description="Timestamp when report was generated")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    error_message: Optional[str] = Field(None, description="Error message if generation failed")


class KPIMetrics(BaseModel):
    """Key Performance Indicators for equipment management"""
    equipment_utilization_rate: float = Field(..., description="Overall equipment utilization percentage")
    cost_savings_vs_rental: float = Field(..., description="Cost savings compared to rental in currency")
    timesheet_completion_rate: float = Field(..., description="Percentage of completed timesheets")
    daily_report_compliance: float = Field(..., description="Percentage of completed daily reports")
    equipment_downtime: float = Field(..., description="Percentage of equipment downtime")
    average_equipment_roi: float = Field(..., description="Average return on investment percentage")
    date_range: int = Field(..., description="Number of days included in calculations")
    last_updated: datetime = Field(..., description="Last time metrics were calculated")


class EquipmentPerformanceReport(BaseModel):
    """Equipment performance analytics model"""
    id: int = Field(..., description="Equipment ID")
    equipment_name: str = Field(..., description="Equipment name/identifier")
    equipment_type: str = Field(..., description="Type of equipment")
    utilization_rate: float = Field(..., description="Equipment utilization percentage")
    total_hours: int = Field(..., description="Total operating hours in period")
    cost_per_hour: float = Field(..., description="Operating cost per hour")
    total_cost: float = Field(..., description="Total operational cost")
    roi: float = Field(..., description="Return on investment percentage")
    status: str = Field(..., description="Current equipment status")
    last_maintenance: Optional[datetime] = Field(None, description="Date of last maintenance")
    next_maintenance: Optional[datetime] = Field(None, description="Date of next scheduled maintenance")
    
    class Config:
        from_attributes = True


class FinancialSummary(BaseModel):
    """Financial summary for equipment operations"""
    total_operational_cost: float = Field(..., description="Total operational costs")
    total_revenue: float = Field(..., description="Total revenue generated")
    cost_savings: float = Field(..., description="Cost savings vs alternatives")
    budget_adherence: float = Field(..., description="Budget adherence percentage")
    profit_margin: float = Field(..., description="Profit margin percentage")
    date_range: int = Field(..., description="Number of days included in calculations")
    last_updated: datetime = Field(..., description="Last time summary was calculated")


class ReportListItem(BaseModel):
    """Individual report in the available reports list"""
    id: str = Field(..., description="Report identifier")
    name: str = Field(..., description="Report display name")
    description: str = Field(..., description="Report description")
    type: str = Field(..., description="Report category (equipment, financial, operational, maintenance)")
    last_generated: str = Field(..., description="Date when report was last generated")
    format: str = Field(..., description="Available format (PDF, Excel, CSV)")


class ReportListResponse(BaseModel):
    """Response model for available reports list"""
    reports: List[ReportListItem] = Field(..., description="List of available reports")
    total_count: int = Field(..., description="Total number of available reports")


class OperatorPerformanceReport(BaseModel):
    """Operator performance analytics model"""
    operator_id: int = Field(..., description="Operator ID")
    operator_name: str = Field(..., description="Operator name")
    total_hours: int = Field(..., description="Total working hours")
    equipment_operated: List[str] = Field(..., description="List of equipment operated")
    productivity_score: float = Field(..., description="Productivity score (0-100)")
    safety_incidents: int = Field(..., description="Number of safety incidents")
    efficiency_rating: float = Field(..., description="Efficiency rating percentage")
    salary_calculation: float = Field(..., description="Calculated salary/compensation")
    
    class Config:
        from_attributes = True


class MaintenanceScheduleReport(BaseModel):
    """Maintenance scheduling and tracking model"""
    equipment_id: int = Field(..., description="Equipment ID")
    equipment_name: str = Field(..., description="Equipment name")
    last_maintenance: datetime = Field(..., description="Date of last maintenance")
    next_maintenance: datetime = Field(..., description="Next scheduled maintenance")
    maintenance_type: str = Field(..., description="Type of maintenance required")
    estimated_cost: float = Field(..., description="Estimated maintenance cost")
    priority: str = Field(..., description="Maintenance priority (low, medium, high, critical)")
    status: str = Field(..., description="Current maintenance status")
    
    class Config:
        from_attributes = True


class CostAnalysisReport(BaseModel):
    """Cost analysis breakdown model"""
    category: str = Field(..., description="Cost category")
    budgeted_amount: float = Field(..., description="Budgeted amount")
    actual_amount: float = Field(..., description="Actual amount spent")
    variance: float = Field(..., description="Variance (actual - budget)")
    variance_percentage: float = Field(..., description="Variance as percentage")
    trend: str = Field(..., description="Spending trend (increasing, decreasing, stable)")


class EquipmentValuationReport(BaseModel):
    """Equipment valuation and depreciation model"""
    equipment_id: int = Field(..., description="Equipment ID")
    equipment_name: str = Field(..., description="Equipment name")
    purchase_value: float = Field(..., description="Original purchase value")
    current_value: float = Field(..., description="Current estimated value")
    depreciation_rate: float = Field(..., description="Annual depreciation rate")
    accumulated_depreciation: float = Field(..., description="Total accumulated depreciation")
    remaining_useful_life: int = Field(..., description="Remaining useful life in years")
    insurance_value: float = Field(..., description="Insurance replacement value")
    
    class Config:
        from_attributes = True


# Export and download models
class ExportRequest(BaseModel):
    """Request model for exporting reports"""
    report_type: str = Field(..., description="Type of report to export")
    format: str = Field("PDF", description="Export format")
    include_raw_data: bool = Field(False, description="Include raw data in export")
    
    
class ExportResponse(BaseModel):
    """Response model for export requests"""
    export_id: str = Field(..., description="Export job identifier")
    status: str = Field(..., description="Export status")
    download_url: Optional[str] = Field(None, description="Download URL when ready")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")
