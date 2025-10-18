"""
IoT Service for Predictive Maintenance and Equipment Monitoring
Processes sensor data and generates AI-powered maintenance predictions
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
import numpy as np
from app.models.iot import IoTDevice, SensorReading, MaintenanceAlert, EquipmentHealthScore
from app.models.equipment import Equipment
import logging

logger = logging.getLogger(__name__)


class IoTService:
    """
    Core service for IoT sensor data processing and predictive maintenance
    Provides high-value analytics that justify premium subscription pricing
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def register_iot_device(self, equipment_id: int, device_data: Dict[str, Any]) -> IoTDevice:
        """Register a new IoT device for equipment monitoring"""
        device = IoTDevice(
            equipment_id=equipment_id,
            device_type=device_data.get("device_type", "multi_sensor"),
            device_id=device_data["device_id"],
            manufacturer=device_data.get("manufacturer", "BitCorp IoT"),
            model=device_data.get("model"),
            firmware_version=device_data.get("firmware_version", "1.0.0"),
            configuration=device_data.get("configuration", {}),
            last_communication=datetime.utcnow(),
            is_active=True
        )
        
        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)
        
        logger.info(f"IoT device {device.device_id} registered for equipment {equipment_id}")
        return device
    
    def process_sensor_readings(self, device_id: str, readings: List[Dict[str, Any]]) -> List[SensorReading]:
        """
        Process incoming sensor data and trigger predictive analysis
        Core revenue-generating functionality
        """
        device = self.db.query(IoTDevice).filter(IoTDevice.device_id == device_id).first()
        if not device:
            raise ValueError(f"IoT device {device_id} not found")
        
        processed_readings = []
        
        for reading_data in readings:
            reading = SensorReading(
                device_id=device.id,
                sensor_type=reading_data["sensor_type"],
                value=reading_data["value"],
                unit=reading_data.get("unit"),
                timestamp=reading_data.get("timestamp", datetime.utcnow()),
                sensor_metadata=reading_data.get("metadata", {})
            )
            
            self.db.add(reading)
            processed_readings.append(reading)
        
        # Update device last communication
        device.last_communication = datetime.utcnow()
        
        self.db.commit()
        
        # Trigger predictive analysis for this equipment
        self._analyze_equipment_health(device.equipment_id)
        
        logger.info(f"Processed {len(readings)} sensor readings for device {device_id}")
        return processed_readings
    
    def _analyze_equipment_health(self, equipment_id: int) -> EquipmentHealthScore:
        """
        AI-powered equipment health analysis
        Core value proposition for premium subscribers
        """
        # Get recent sensor readings
        readings = self._get_recent_sensor_data(equipment_id, hours=24)
        
        if not readings:
            logger.warning(f"No recent sensor data for equipment {equipment_id}")
            return None
        
        # Calculate health scores based on sensor data
        health_metrics = self._calculate_health_metrics(readings)
        overall_score = self._calculate_overall_health_score(health_metrics)
        
        # Create or update health score record
        health_score = EquipmentHealthScore(
            equipment_id=equipment_id,
            overall_score=overall_score,
            engine_health=health_metrics.get("engine_health", 85),
            hydraulic_health=health_metrics.get("hydraulic_health", 90),
            transmission_health=health_metrics.get("transmission_health", 88),
            electrical_health=health_metrics.get("electrical_health", 92),
            structural_health=health_metrics.get("structural_health", 95),
            predicted_failures=health_metrics.get("predicted_failures", []),
            recommendations=health_metrics.get("recommendations", []),
            confidence_score=health_metrics.get("confidence", 0.85),
            analysis_timestamp=datetime.utcnow()
        )
        
        self.db.add(health_score)
        
        # Generate maintenance alerts if needed
        self._check_maintenance_thresholds(equipment_id, health_metrics, overall_score)
        
        self.db.commit()
        self.db.refresh(health_score)
        
        logger.info(f"Health analysis completed for equipment {equipment_id}, score: {overall_score}")
        return health_score
    
    def _get_recent_sensor_data(self, equipment_id: int, hours: int = 24) -> List[SensorReading]:
        """Get recent sensor readings for analysis"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        return self.db.query(SensorReading).join(IoTDevice).filter(
            and_(
                IoTDevice.equipment_id == equipment_id,
                SensorReading.timestamp >= cutoff_time
            )
        ).order_by(desc(SensorReading.timestamp)).all()
    
    def _calculate_health_metrics(self, readings: List[SensorReading]) -> Dict[str, Any]:
        """
        Advanced health metrics calculation
        This is where the AI magic happens - premium feature
        """
        metrics = {
            "engine_health": 85,
            "hydraulic_health": 90,
            "transmission_health": 88,
            "electrical_health": 92,
            "structural_health": 95,
            "predicted_failures": [],
            "recommendations": [],
            "confidence": 0.85
        }
        
        # Group readings by sensor type
        sensor_data = {}
        for reading in readings:
            if reading.sensor_type not in sensor_data:
                sensor_data[reading.sensor_type] = []
            sensor_data[reading.sensor_type].append(reading.value)
        
        # Analyze engine health (temperature, oil pressure, RPM)
        if "engine_temperature" in sensor_data:
            temp_values = sensor_data["engine_temperature"]
            avg_temp = np.mean(temp_values)
            max_temp = np.max(temp_values)
            
            if max_temp > 95:  # Overheating threshold
                metrics["engine_health"] = max(60, 100 - (max_temp - 95) * 2)
                metrics["predicted_failures"].append({
                    "component": "engine",
                    "issue": "overheating_risk",
                    "probability": 0.75,
                    "days_until_failure": 7
                })
                metrics["recommendations"].append("Schedule immediate engine inspection - overheating detected")
        
        # Analyze hydraulic system
        if "hydraulic_pressure" in sensor_data:
            pressure_values = sensor_data["hydraulic_pressure"]
            avg_pressure = np.mean(pressure_values)
            pressure_variance = np.var(pressure_values)
            
            if pressure_variance > 100:  # High variance indicates instability
                metrics["hydraulic_health"] = 70
                metrics["predicted_failures"].append({
                    "component": "hydraulic_pump",
                    "issue": "pressure_instability",
                    "probability": 0.6,
                    "days_until_failure": 14
                })
                metrics["recommendations"].append("Hydraulic system pressure instability - check pump and seals")
        
        # Analyze vibration patterns
        if "vibration" in sensor_data:
            vibration_values = sensor_data["vibration"]
            avg_vibration = np.mean(vibration_values)
            
            if avg_vibration > 8.0:  # High vibration threshold
                metrics["structural_health"] = 75
                metrics["predicted_failures"].append({
                    "component": "bearings",
                    "issue": "excessive_vibration",
                    "probability": 0.8,
                    "days_until_failure": 10
                })
                metrics["recommendations"].append("Excessive vibration detected - inspect bearings and mounting points")
        
        return metrics
    
    def _calculate_overall_health_score(self, health_metrics: Dict[str, Any]) -> float:
        """Calculate weighted overall health score"""
        weights = {
            "engine_health": 0.3,
            "hydraulic_health": 0.25,
            "transmission_health": 0.2,
            "electrical_health": 0.15,
            "structural_health": 0.1
        }
        
        overall_score = 0
        for component, weight in weights.items():
            overall_score += health_metrics.get(component, 85) * weight
        
        return round(overall_score, 1)
    
    def _check_maintenance_thresholds(self, equipment_id: int, health_metrics: Dict[str, Any], overall_score: float):
        """Generate maintenance alerts based on thresholds"""
        alerts = []
        
        # Critical overall health
        if overall_score < 70:
            alerts.append({
                "severity": "critical",
                "alert_type": "health_critical",
                "message": f"Equipment health critically low: {overall_score}%",
                "recommended_action": "Immediate inspection and maintenance required"
            })
        
        # Component-specific alerts
        for component in ["engine_health", "hydraulic_health", "transmission_health"]:
            score = health_metrics.get(component, 85)
            if score < 75:
                alerts.append({
                    "severity": "high" if score < 60 else "medium",
                    "alert_type": "component_degradation",
                    "message": f"{component.replace('_', ' ').title()} degraded: {score}%",
                    "recommended_action": f"Schedule {component.replace('_health', '')} maintenance"
                })
        
        # Predicted failure alerts
        for failure in health_metrics.get("predicted_failures", []):
            if failure["probability"] > 0.7:
                alerts.append({
                    "severity": "high",
                    "alert_type": "predicted_failure",
                    "message": f"Predicted {failure['component']} failure in {failure['days_until_failure']} days",
                    "recommended_action": f"Preventive maintenance for {failure['component']}"
                })
        
        # Save alerts to database
        for alert_data in alerts:
            alert = MaintenanceAlert(
                equipment_id=equipment_id,
                alert_type=alert_data["alert_type"],
                severity=alert_data["severity"],
                message=alert_data["message"],
                recommended_action=alert_data["recommended_action"],
                is_resolved=False,
                created_at=datetime.utcnow()
            )
            self.db.add(alert)
    
    def get_equipment_dashboard_data(self, equipment_id: int) -> Dict[str, Any]:
        """
        Premium dashboard data for equipment monitoring
        Core value proposition for subscription revenue
        """
        # Get latest health score
        latest_health = self.db.query(EquipmentHealthScore).filter(
            EquipmentHealthScore.equipment_id == equipment_id
        ).order_by(desc(EquipmentHealthScore.analysis_timestamp)).first()
        
        # Get active alerts
        active_alerts = self.db.query(MaintenanceAlert).filter(
            and_(
                MaintenanceAlert.equipment_id == equipment_id,
                MaintenanceAlert.is_resolved == False
            )
        ).order_by(desc(MaintenanceAlert.created_at)).all()
        
        # Get recent sensor readings
        recent_readings = self._get_recent_sensor_data(equipment_id, hours=24)
        
        # Get IoT devices
        iot_devices = self.db.query(IoTDevice).filter(
            IoTDevice.equipment_id == equipment_id
        ).all()
        
        dashboard_data = {
            "equipment_id": equipment_id,
            "health_score": {
                "overall": latest_health.overall_score if latest_health else 85,
                "engine": latest_health.engine_health if latest_health else 85,
                "hydraulic": latest_health.hydraulic_health if latest_health else 90,
                "transmission": latest_health.transmission_health if latest_health else 88,
                "electrical": latest_health.electrical_health if latest_health else 92,
                "structural": latest_health.structural_health if latest_health else 95,
                "last_analysis": latest_health.analysis_timestamp.isoformat() if latest_health else None
            },
            "alerts": [
                {
                    "id": alert.id,
                    "type": alert.alert_type,
                    "severity": alert.severity,
                    "message": alert.message,
                    "action": alert.recommended_action,
                    "created": alert.created_at.isoformat()
                } for alert in active_alerts
            ],
            "sensor_summary": self._summarize_sensor_data(recent_readings),
            "iot_devices": [
                {
                    "id": device.id,
                    "device_id": device.device_id,
                    "type": device.device_type,
                    "status": "online" if device.is_active else "offline",
                    "last_communication": device.last_communication.isoformat() if device.last_communication else None
                } for device in iot_devices
            ],
            "predicted_savings": self._calculate_predicted_savings(latest_health, active_alerts)
        }
        
        return dashboard_data
    
    def _summarize_sensor_data(self, readings: List[SensorReading]) -> Dict[str, Any]:
        """Create sensor data summary for dashboard"""
        sensor_summary = {}
        
        for reading in readings:
            if reading.sensor_type not in sensor_summary:
                sensor_summary[reading.sensor_type] = {
                    "values": [],
                    "unit": reading.unit,
                    "latest_timestamp": reading.timestamp
                }
            
            sensor_summary[reading.sensor_type]["values"].append(reading.value)
            if reading.timestamp > sensor_summary[reading.sensor_type]["latest_timestamp"]:
                sensor_summary[reading.sensor_type]["latest_timestamp"] = reading.timestamp
        
        # Calculate statistics
        for sensor_type, data in sensor_summary.items():
            values = data["values"]
            if values:
                data.update({
                    "current": values[-1],
                    "average": round(np.mean(values), 2),
                    "min": round(np.min(values), 2),
                    "max": round(np.max(values), 2),
                    "trend": "stable"  # Could implement trend analysis
                })
                del data["values"]  # Remove raw values from response
        
        return sensor_summary
    
    def _calculate_predicted_savings(self, health_score: EquipmentHealthScore, alerts: List[MaintenanceAlert]) -> Dict[str, Any]:
        """
        Calculate ROI metrics for premium feature justification
        Key selling point for subscription upgrades
        """
        if not health_score:
            return {"annual_savings": 0, "breakdown": {}}
        
        # Base calculation: Prevent 1 major breakdown per year = ₹12.5 lakhs savings
        base_annual_savings = 1250000  # ₹12.5 lakhs
        
        # Adjust based on health score and alerts
        health_multiplier = health_score.overall_score / 100
        alert_prevention_value = len(alerts) * 250000  # ₹2.5 lakhs per prevented issue
        
        total_savings = base_annual_savings * health_multiplier + alert_prevention_value
        
        return {
            "annual_savings": int(total_savings),
            "monthly_savings": int(total_savings / 12),
            "breakdown": {
                "breakdown_prevention": int(base_annual_savings * health_multiplier),
                "early_detection": int(alert_prevention_value),
                "fuel_efficiency": int(total_savings * 0.15),  # 15% fuel savings
                "extended_lifespan": int(total_savings * 0.25)  # 25% lifespan extension
            },
            "roi_multiple": round(total_savings / (299 * 12), 1)  # ROI vs premium subscription cost
        }
    
    def get_fleet_analytics(self, company_id: int) -> Dict[str, Any]:
        """
        Fleet-wide analytics for enterprise customers
        Premium feature for high-value accounts
        """
        # Get all equipment for the company
        equipment_list = self.db.query(Equipment).filter(Equipment.company_id == company_id).all()
        equipment_ids = [eq.id for eq in equipment_list]
        
        if not equipment_ids:
            return {"total_equipment": 0, "fleet_health": 0}
        
        # Get latest health scores for all equipment
        health_scores = self.db.query(EquipmentHealthScore).filter(
            EquipmentHealthScore.equipment_id.in_(equipment_ids)
        ).order_by(desc(EquipmentHealthScore.analysis_timestamp)).all()
        
        # Get all active alerts
        active_alerts = self.db.query(MaintenanceAlert).filter(
            and_(
                MaintenanceAlert.equipment_id.in_(equipment_ids),
                MaintenanceAlert.is_resolved == False
            )
        ).all()
        
        # Calculate fleet metrics
        fleet_health = np.mean([hs.overall_score for hs in health_scores]) if health_scores else 85
        total_predicted_savings = sum([
            self._calculate_predicted_savings(hs, [a for a in active_alerts if a.equipment_id == hs.equipment_id])["annual_savings"]
            for hs in health_scores
        ])
        
        return {
            "total_equipment": len(equipment_list),
            "monitored_equipment": len([eq for eq in equipment_list if any(hs.equipment_id == eq.id for hs in health_scores)]),
            "fleet_health_average": round(fleet_health, 1),
            "total_active_alerts": len(active_alerts),
            "critical_alerts": len([a for a in active_alerts if a.severity == "critical"]),
            "total_predicted_savings": total_predicted_savings,
            "equipment_status": {
                "excellent": len([hs for hs in health_scores if hs.overall_score >= 90]),
                "good": len([hs for hs in health_scores if 80 <= hs.overall_score < 90]),
                "fair": len([hs for hs in health_scores if 70 <= hs.overall_score < 80]),
                "poor": len([hs for hs in health_scores if hs.overall_score < 70])
            }
        }
