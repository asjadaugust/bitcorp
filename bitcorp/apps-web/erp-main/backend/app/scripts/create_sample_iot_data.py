#!/usr/bin/env python3
"""
Sample IoT Data Generator for Bitcorp ERP
Creates sample construction equipment with IoT sensors and predictive maintenance data
Demonstrates the ₹12.5 lakhs annual savings potential
"""

import sys
import os
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.equipment import Equipment
from app.models.iot import (
    IoTDevice, SensorReading, MaintenanceAlert, 
    PredictiveModel, EquipmentHealthScore
)

def create_sample_data():
    """Create comprehensive sample IoT data for demonstration"""
    print("🚀 Creating sample IoT data for Bitcorp ERP...")
    
    # Get database session
    db = next(get_db())
    
    try:
        # 1. Create sample equipment if not exists
        print("📦 Creating sample construction equipment...")
        
        equipment_data = [
            {
                "name": "Excavator CAT 320D",
                "type": "Heavy Machinery",
                "model": "320D",
                "serial_number": "CAT320D001",
                "purchase_date": datetime.now() - timedelta(days=365*2),
                "maintenance_schedule": "Every 250 hours",
                "status": "Active",
                "location": "Construction Site A",
                "value": Decimal("2500000")  # ₹25 lakhs
            },
            {
                "name": "Concrete Mixer Truck",
                "type": "Transport",
                "model": "CM-12",
                "serial_number": "CMT001",
                "purchase_date": datetime.now() - timedelta(days=365*3),
                "maintenance_schedule": "Every 200 hours",
                "status": "Active", 
                "location": "Construction Site B",
                "value": Decimal("1800000")  # ₹18 lakhs
            },
            {
                "name": "Tower Crane TC-200",
                "type": "Heavy Machinery",
                "model": "TC-200",
                "serial_number": "TC200001",
                "purchase_date": datetime.now() - timedelta(days=365*4),
                "maintenance_schedule": "Every 300 hours",
                "status": "Active",
                "location": "Construction Site A", 
                "value": Decimal("3500000")  # ₹35 lakhs
            }
        ]
        
        equipment_list = []
        for eq_data in equipment_data:
            # Check if equipment already exists
            existing = db.query(Equipment).filter(
                Equipment.serial_number == eq_data["serial_number"]
            ).first()
            
            if not existing:
                equipment = Equipment(**eq_data)
                db.add(equipment)
                db.flush()
                equipment_list.append(equipment)
                print(f"   ✅ Created equipment: {equipment.name}")
            else:
                equipment_list.append(existing)
                print(f"   ♻️  Using existing equipment: {existing.name}")
        
        db.commit()
        
        # 2. Create IoT devices for each equipment
        print("\n🔌 Creating IoT devices and sensors...")
        
        iot_devices = []
        for equipment in equipment_list:
            # Check if IoT device already exists
            existing_device = db.query(IoTDevice).filter(
                IoTDevice.equipment_id == equipment.id
            ).first()
            
            if not existing_device:
                device = IoTDevice(
                    name=f"{equipment.name} IoT Monitor",
                    device_type="Multi-Sensor Hub",
                    equipment_id=equipment.id,
                    mac_address=f"00:1B:44:11:3A:{random.randint(10,99):02d}",
                    firmware_version="v2.1.0",
                    installation_date=datetime.now() - timedelta(days=30),
                    last_seen=datetime.now(),
                    battery_level=random.randint(75, 100),
                    signal_strength=random.randint(-60, -30),
                    status="Active"
                )
                db.add(device)
                db.flush()
                iot_devices.append(device)
                print(f"   ✅ Created IoT device for: {equipment.name}")
            else:
                iot_devices.append(existing_device)
                print(f"   ♻️  Using existing IoT device for: {equipment.name}")
        
        db.commit()
        
        # 3. Create sensor readings over the past 30 days
        print("\n📊 Generating sensor readings (past 30 days)...")
        
        sensor_types = [
            ("temperature", "°C", 20, 80),
            ("vibration", "mm/s", 0, 25),
            ("pressure", "bar", 0, 300),
            ("rpm", "RPM", 0, 2500),
            ("fuel_level", "%", 0, 100),
            ("oil_pressure", "PSI", 20, 60),
            ("hydraulic_pressure", "bar", 100, 250),
            ("engine_hours", "hours", 0, 10000)
        ]
        
        base_date = datetime.now() - timedelta(days=30)
        readings_created = 0
        
        for device in iot_devices:
            for day in range(30):
                current_date = base_date + timedelta(days=day)
                
                # Create 12 readings per day (every 2 hours) for realistic data
                for hour in range(0, 24, 2):
                    timestamp = current_date.replace(hour=hour, minute=random.randint(0, 59))
                    
                    for sensor_type, unit, min_val, max_val in sensor_types:
                        # Add some realistic patterns to the data
                        base_value = random.uniform(min_val, max_val)
                        
                        # Add wear patterns for predictive maintenance
                        wear_factor = day / 30.0  # Gradual degradation over time
                        if sensor_type == "vibration":
                            base_value += wear_factor * 5  # Increasing vibration
                        elif sensor_type == "oil_pressure" and day > 20:
                            base_value -= wear_factor * 10  # Decreasing oil pressure
                        
                        reading = SensorReading(
                            device_id=device.id,
                            sensor_type=sensor_type,
                            value=round(base_value, 2),
                            unit=unit,
                            timestamp=timestamp
                        )
                        db.add(reading)
                        readings_created += 1
            
            print(f"   ✅ Generated readings for device: {device.name}")
        
        db.commit()
        print(f"   📈 Total sensor readings created: {readings_created:,}")
        
        # 4. Create predictive models
        print("\n🤖 Creating AI predictive models...")
        
        model_types = [
            ("vibration_analysis", "Bearing failure prediction based on vibration patterns", 0.89),
            ("temperature_monitoring", "Overheating prevention model", 0.92),
            ("oil_analysis", "Oil degradation and filter replacement prediction", 0.87),
            ("fuel_efficiency", "Fuel consumption optimization model", 0.84),
            ("maintenance_scheduler", "Optimal maintenance timing predictor", 0.91)
        ]
        
        for equipment in equipment_list:
            for model_name, description, accuracy in model_types:
                existing_model = db.query(PredictiveModel).filter(
                    PredictiveModel.equipment_id == equipment.id,
                    PredictiveModel.model_name == model_name
                ).first()
                
                if not existing_model:
                    model = PredictiveModel(
                        equipment_id=equipment.id,
                        model_name=model_name,
                        model_type="Neural Network",
                        description=description,
                        accuracy=accuracy,
                        created_date=datetime.now() - timedelta(days=random.randint(10, 30)),
                        last_trained=datetime.now() - timedelta(days=random.randint(1, 7)),
                        version="1.2.0",
                        status="Active"
                    )
                    db.add(model)
                    print(f"   ✅ Created model: {model_name} for {equipment.name}")
        
        db.commit()
        
        # 5. Create equipment health scores
        print("\n💚 Calculating equipment health scores...")
        
        for equipment in equipment_list:
            existing_score = db.query(EquipmentHealthScore).filter(
                EquipmentHealthScore.equipment_id == equipment.id
            ).order_by(EquipmentHealthScore.timestamp.desc()).first()
            
            # Create daily health scores for the past 30 days
            for day in range(30):
                score_date = base_date + timedelta(days=day)
                
                # Simulate declining health over time with some randomness
                base_health = 95 - (day * 0.5) + random.uniform(-3, 3)
                health_score = max(60, min(100, base_health))  # Keep between 60-100
                
                # Determine risk level based on health score
                if health_score >= 85:
                    risk_level = "Low"
                elif health_score >= 70:
                    risk_level = "Medium"
                else:
                    risk_level = "High"
                
                # Calculate potential savings (higher risk = higher savings potential)
                if risk_level == "High":
                    potential_savings = random.uniform(300000, 500000)  # ₹3-5 lakhs
                elif risk_level == "Medium":
                    potential_savings = random.uniform(150000, 300000)  # ₹1.5-3 lakhs
                else:
                    potential_savings = random.uniform(50000, 150000)   # ₹0.5-1.5 lakhs
                
                score = EquipmentHealthScore(
                    equipment_id=equipment.id,
                    overall_health=round(health_score, 1),
                    mechanical_health=round(health_score + random.uniform(-5, 5), 1),
                    electrical_health=round(health_score + random.uniform(-3, 3), 1),
                    hydraulic_health=round(health_score + random.uniform(-4, 4), 1),
                    risk_level=risk_level,
                    predicted_failure_date=score_date + timedelta(days=random.randint(30, 180)),
                    recommended_actions=f"Monitor {['vibration', 'temperature', 'oil pressure'][random.randint(0,2)]} levels",
                    potential_cost_savings=Decimal(str(round(potential_savings, 2))),
                    confidence_score=random.uniform(0.75, 0.95),
                    timestamp=score_date
                )
                db.add(score)
            
            print(f"   ✅ Created health scores for: {equipment.name}")
        
        db.commit()
        
        # 6. Create maintenance alerts
        print("\n🚨 Creating predictive maintenance alerts...")
        
        alert_types = [
            ("High Vibration Detected", "Bearing replacement recommended within 2 weeks", "High"),
            ("Oil Pressure Declining", "Oil change required soon", "Medium"),
            ("Temperature Spike", "Cooling system check needed", "Medium"),
            ("Unusual Noise Pattern", "Mechanical inspection recommended", "Low"),
            ("Fuel Efficiency Drop", "Engine tuning suggested", "Low")
        ]
        
        alerts_created = 0
        for equipment in equipment_list:
            # Create 2-3 alerts per equipment
            num_alerts = random.randint(2, 3)
            for i in range(num_alerts):
                alert_type, message, severity = random.choice(alert_types)
                
                # Calculate cost impact based on severity
                if severity == "High":
                    cost_impact = random.uniform(200000, 400000)  # ₹2-4 lakhs
                elif severity == "Medium":
                    cost_impact = random.uniform(75000, 200000)   # ₹75k-2 lakhs
                else:
                    cost_impact = random.uniform(25000, 75000)    # ₹25k-75k
                
                alert = MaintenanceAlert(
                    equipment_id=equipment.id,
                    alert_type=alert_type,
                    severity=severity,
                    message=message,
                    created_date=datetime.now() - timedelta(days=random.randint(1, 10)),
                    status="Open",
                    estimated_cost_impact=Decimal(str(round(cost_impact, 2))),
                    recommended_action_date=datetime.now() + timedelta(days=random.randint(3, 21)),
                    confidence_level=random.uniform(0.7, 0.95)
                )
                db.add(alert)
                alerts_created += 1
        
        db.commit()
        print(f"   ⚠️  Created {alerts_created} maintenance alerts")
        
        # 7. Print summary with ROI calculations
        print("\n" + "="*60)
        print("🎉 SAMPLE IOT DATA CREATION COMPLETE!")
        print("="*60)
        
        # Calculate total equipment value
        total_value = sum([Decimal(str(eq.value)) for eq in equipment_list])
        
        # Calculate potential annual savings
        total_alerts = db.query(MaintenanceAlert).count()
        total_cost_impact = db.query(MaintenanceAlert).all()
        potential_savings = sum([alert.estimated_cost_impact for alert in total_cost_impact])
        
        print(f"📊 Equipment Portfolio Summary:")
        print(f"   • Total Equipment Value: ₹{total_value:,}")
        print(f"   • Number of IoT Devices: {len(iot_devices)}")
        print(f"   • Sensor Readings Generated: {readings_created:,}")
        print(f"   • Active Maintenance Alerts: {total_alerts}")
        print(f"   • Potential Cost Savings: ₹{potential_savings:,}")
        
        print(f"\n💰 ROI Analysis:")
        monthly_subscription = 25000  # ₹25,000/month for IoT premium
        annual_subscription = monthly_subscription * 12  # ₹3,00,000/year
        roi_multiplier = float(potential_savings) / annual_subscription
        
        print(f"   • Annual IoT Subscription: ₹{annual_subscription:,}")
        print(f"   • Projected Annual Savings: ₹{potential_savings:,}")
        print(f"   • ROI Multiple: {roi_multiplier:.1f}x")
        print(f"   • Break-even Time: {12/roi_multiplier:.1f} months")
        
        print(f"\n🚀 Next Steps:")
        print(f"   1. Visit http://localhost:8001/docs to test API endpoints")
        print(f"   2. Access IoT Dashboard: GET /api/v1/iot/dashboard")
        print(f"   3. View Equipment Health: GET /api/v1/iot/equipment/{{id}}/health")
        print(f"   4. Check Maintenance Alerts: GET /api/v1/iot/alerts")
        print(f"   5. Activate IoT Trial: POST /api/v1/iot/trial/activate")
        
        print(f"\n✨ Demo completed! Your construction ERP now has a fully functional")
        print(f"   IoT predictive maintenance system worth ₹{potential_savings:,} in annual savings!")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
