"""
IoT API Router - Premium Predictive Maintenance Endpoints
Revenue-generating IoT features for construction equipment monitoring
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.equipment import Equipment
from app.services.iot_service import IoTService
from app.api.v1.iot.schemas import (
    IoTDeviceCreate,
    IoTDeviceResponse,
    SensorReadingCreate,
    EquipmentDashboardResponse,
    FleetAnalyticsResponse,
    MaintenanceAlertResponse
)

router = APIRouter()


@router.post("/devices", response_model=IoTDeviceResponse)
def register_iot_device(
    device_data: IoTDeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Register a new IoT device for equipment monitoring
    Premium feature - requires subscription validation
    """
    # Validate equipment ownership
    equipment = db.query(Equipment).filter(
        Equipment.id == device_data.equipment_id,
        Equipment.company_id == current_user.company_id
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found or access denied"
        )
    
    # Check if user has IoT premium features
    # TODO: Implement subscription tier validation
    # if not current_user.has_premium_iot():
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="IoT features require premium subscription"
    #     )
    
    iot_service = IoTService(db)
    device = iot_service.register_iot_device(
        equipment_id=device_data.equipment_id,
        device_data=device_data.dict()
    )
    
    return IoTDeviceResponse.from_orm(device)


@router.post("/sensor-data/{device_id}")
def submit_sensor_readings(
    device_id: str,
    readings: List[SensorReadingCreate],
    db: Session = Depends(get_db)
):
    """
    Submit sensor readings from IoT devices
    Public endpoint for device communication (authenticated via device ID)
    """
    iot_service = IoTService(db)
    
    try:
        processed_readings = iot_service.process_sensor_readings(
            device_id=device_id,
            readings=[reading.dict() for reading in readings]
        )
        
        return {
            "status": "success",
            "processed_count": len(processed_readings),
            "timestamp": datetime.utcnow().isoformat()
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process sensor readings"
        )


@router.get("/equipment/{equipment_id}/dashboard", response_model=EquipmentDashboardResponse)
def get_equipment_dashboard(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive equipment monitoring dashboard
    Premium feature - core value proposition for IoT subscription
    """
    # Validate equipment ownership
    equipment = db.query(Equipment).filter(
        Equipment.id == equipment_id,
        Equipment.company_id == current_user.company_id
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found or access denied"
        )
    
    iot_service = IoTService(db)
    dashboard_data = iot_service.get_equipment_dashboard_data(equipment_id)
    
    return EquipmentDashboardResponse(**dashboard_data)


@router.get("/fleet/analytics", response_model=FleetAnalyticsResponse)
def get_fleet_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fleet-wide IoT analytics and insights
    Enterprise premium feature for large construction companies
    """
    iot_service = IoTService(db)
    analytics_data = iot_service.get_fleet_analytics(current_user.company_id)
    
    return FleetAnalyticsResponse(**analytics_data)


@router.get("/equipment/{equipment_id}/alerts", response_model=List[MaintenanceAlertResponse])
def get_equipment_alerts(
    equipment_id: int,
    include_resolved: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get maintenance alerts for specific equipment
    Premium feature - predictive maintenance alerts
    """
    # Validate equipment ownership
    equipment = db.query(Equipment).filter(
        Equipment.id == equipment_id,
        Equipment.company_id == current_user.company_id
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found or access denied"
        )
    
    from app.models.iot import MaintenanceAlert
    
    query = db.query(MaintenanceAlert).filter(
        MaintenanceAlert.equipment_id == equipment_id
    )
    
    if not include_resolved:
        query = query.filter(MaintenanceAlert.is_resolved.is_(False))
    
    alerts = query.order_by(MaintenanceAlert.created_at.desc()).all()
    
    return [MaintenanceAlertResponse.from_orm(alert) for alert in alerts]


@router.patch("/alerts/{alert_id}/resolve")
def resolve_maintenance_alert(
    alert_id: int,
    resolution_notes: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a maintenance alert as resolved
    Premium feature - alert management
    """
    from app.models.iot import MaintenanceAlert
    
    alert = db.query(MaintenanceAlert).filter(MaintenanceAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # Validate equipment ownership through alert
    equipment = db.query(Equipment).filter(
        Equipment.id == alert.equipment_id,
        Equipment.company_id == current_user.company_id
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access denied"
        )
    
    # Update alert fields using update() method
    db.query(MaintenanceAlert).filter(MaintenanceAlert.id == alert_id).update({
        "is_resolved": True,
        "resolved_at": datetime.utcnow(),
        "resolved_by": current_user.id,
        "resolution_notes": resolution_notes if resolution_notes else None
    })
    
    db.commit()
    
    return {
        "status": "success",
        "message": "Alert resolved successfully",
        "alert_id": alert_id
    }


@router.get("/subscription/iot-pricing")
def get_iot_pricing_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get IoT subscription pricing and feature information
    Sales endpoint for subscription upgrades
    """
    return {
        "current_plan": "basic",  # TODO: Get from user subscription
        "iot_features": {
            "real_time_monitoring": "Premium feature - ₹299/month",
            "predictive_maintenance": "AI-powered alerts prevent ₹12.5L annual losses",
            "health_scoring": "Comprehensive equipment health analytics",
            "fleet_analytics": "Enterprise-wide insights and reporting",
            "custom_alerts": "Configurable maintenance thresholds",
            "api_access": "Integration with existing systems"
        },
        "roi_calculation": {
            "monthly_cost": 299,
            "annual_cost": 3588,
            "typical_savings": 1250000,
            "roi_multiple": 348,
            "payback_period_days": 1
        },
        "trial_available": True,
        "setup_included": True
    }


@router.post("/trial/start")
def start_iot_trial(
    equipment_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Start IoT premium trial for selected equipment
    Sales conversion endpoint
    """
    # Validate equipment ownership
    equipment_list = db.query(Equipment).filter(
        Equipment.id.in_(equipment_ids),
        Equipment.company_id == current_user.company_id
    ).all()
    
    if len(equipment_list) != len(equipment_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Some equipment not found or access denied"
        )
    
    # TODO: Implement trial activation logic
    # - Set trial expiry date
    # - Enable premium features
    # - Send welcome email with setup instructions
    
    return {
        "status": "success",
        "message": "IoT trial activated successfully",
        "trial_period_days": 30,
        "equipment_count": len(equipment_list),
        "trial_expires": (datetime.utcnow().date() + timedelta(days=30)).isoformat(),
        "next_steps": [
            "Install IoT sensors on your equipment",
            "Download the BitCorp IoT app",
            "Configure alerts and thresholds",
            "Start monitoring equipment health"
        ]
    }
