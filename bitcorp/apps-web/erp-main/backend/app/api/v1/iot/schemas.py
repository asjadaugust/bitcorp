"""
IoT API Schemas - Premium Predictive Maintenance Data Models
Pydantic models for IoT device management and analytics
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class IoTDeviceCreate(BaseModel):
    equipment_id: int = Field(..., description="Equipment ID to monitor")
    device_id: str = Field(..., description="Unique device identifier")
    device_type: str = Field(default="multi_sensor", description="Type of IoT device")
    manufacturer: str = Field(default="BitCorp IoT", description="Device manufacturer")
    model: Optional[str] = Field(None, description="Device model")
    firmware_version: str = Field(default="1.0.0", description="Firmware version")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Device configuration")


class IoTDeviceResponse(BaseModel):
    id: int
    equipment_id: int
    device_id: str
    device_type: str
    manufacturer: str
    model: Optional[str]
    firmware_version: str
    configuration: Dict[str, Any]
    is_active: bool
    last_communication: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class SensorReadingCreate(BaseModel):
    sensor_type: str = Field(..., description="Type of sensor (e.g., temperature, pressure)")
    value: float = Field(..., description="Sensor reading value")
    unit: Optional[str] = Field(None, description="Unit of measurement")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow, description="Reading timestamp")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional sensor metadata")


class SensorReadingResponse(BaseModel):
    id: int
    device_id: int
    sensor_type: str
    value: float
    unit: Optional[str]
    timestamp: datetime
    metadata: Dict[str, Any]

    class Config:
        from_attributes = True


class HealthScoreResponse(BaseModel):
    overall: float = Field(..., description="Overall equipment health score (0-100)")
    engine: float = Field(..., description="Engine health score")
    hydraulic: float = Field(..., description="Hydraulic system health score")
    transmission: float = Field(..., description="Transmission health score")
    electrical: float = Field(..., description="Electrical system health score")
    structural: float = Field(..., description="Structural integrity score")
    last_analysis: Optional[str] = Field(None, description="Last analysis timestamp")


class AlertResponse(BaseModel):
    id: int
    type: str
    severity: str
    message: str
    action: str
    created: str


class SensorSummaryResponse(BaseModel):
    current: float
    average: float
    min: float
    max: float
    trend: str
    unit: Optional[str]
    latest_timestamp: datetime


class IoTDeviceStatusResponse(BaseModel):
    id: int
    device_id: str
    type: str
    status: str
    last_communication: Optional[str]


class PredictedSavingsResponse(BaseModel):
    annual_savings: int = Field(..., description="Predicted annual savings in INR")
    monthly_savings: int = Field(..., description="Predicted monthly savings in INR")
    breakdown: Dict[str, int] = Field(..., description="Savings breakdown by category")
    roi_multiple: float = Field(..., description="ROI multiple vs subscription cost")


class EquipmentDashboardResponse(BaseModel):
    equipment_id: int
    health_score: HealthScoreResponse
    alerts: List[AlertResponse]
    sensor_summary: Dict[str, SensorSummaryResponse]
    iot_devices: List[IoTDeviceStatusResponse]
    predicted_savings: PredictedSavingsResponse


class EquipmentStatusDistribution(BaseModel):
    excellent: int = Field(..., description="Equipment with health score >= 90")
    good: int = Field(..., description="Equipment with health score 80-89")
    fair: int = Field(..., description="Equipment with health score 70-79")
    poor: int = Field(..., description="Equipment with health score < 70")


class FleetAnalyticsResponse(BaseModel):
    total_equipment: int
    monitored_equipment: int
    fleet_health_average: float
    total_active_alerts: int
    critical_alerts: int
    total_predicted_savings: int
    equipment_status: EquipmentStatusDistribution


class MaintenanceAlertResponse(BaseModel):
    id: int
    equipment_id: int
    alert_type: str
    severity: str
    message: str
    recommended_action: str
    is_resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime]
    resolved_by: Optional[int]
    resolution_notes: Optional[str]

    class Config:
        from_attributes = True


class PredictedFailureResponse(BaseModel):
    component: str
    issue: str
    probability: float
    days_until_failure: int


class HealthAnalysisResponse(BaseModel):
    equipment_id: int
    overall_score: float
    engine_health: float
    hydraulic_health: float
    transmission_health: float
    electrical_health: float
    structural_health: float
    predicted_failures: List[PredictedFailureResponse]
    recommendations: List[str]
    confidence_score: float
    analysis_timestamp: datetime

    class Config:
        from_attributes = True
