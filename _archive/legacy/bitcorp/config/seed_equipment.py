#!/usr/bin/env python3
"""
Database seeding script for Bitcorp ERP
Creates realistic demo equipment data for development and testing
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Add the backend app to the Python path
sys.path.append('/Users/klm95441/Documents/asjad/BitCorp/bitcorp/backend')

from app.core.database import get_session
from app.models.equipment import Equipment, EquipmentStatus, EquipmentType, FuelType

# Realistic equipment data for construction industry
EQUIPMENT_SEED_DATA = [
    {
        "name": "CAT 320 Hydraulic Excavator",
        "model": "320",
        "brand": "Caterpillar",
        "equipment_type": EquipmentType.EXCAVATOR,
        "serial_number": "CAT320-2024-001",
        "year_manufactured": 2024,
        "purchase_cost": Decimal("350000.00"),
        "current_value": Decimal("320000.00"),
        "hourly_rate": Decimal("150.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("400.0"),
        "status": EquipmentStatus.AVAILABLE,
        "hourmeter_reading": 245,
        "notes": "Primary excavator for foundation and utility work",
        "company_id": 1,
        "specifications": {
            "operating_weight": "20,300 kg",
            "engine_power": "122 kW",
            "bucket_capacity": "1.0 m³",
            "max_digging_depth": "6.7 m"
        }
    },
    {
        "name": "John Deere 850K Bulldozer",
        "model": "850K",
        "brand": "John Deere",
        "equipment_type": EquipmentType.BULLDOZER,
        "serial_number": "JD850K-2023-102",
        "year_manufactured": 2023,
        "purchase_cost": Decimal("485000.00"),
        "current_value": Decimal("445000.00"),
        "hourly_rate": Decimal("180.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("520.0"),
        "status": EquipmentStatus.IN_USE,
        "hourmeter_reading": 1247,
        "notes": "Heavy-duty dozer for site preparation and grading",
        "company_id": 1,
        "specifications": {
            "operating_weight": "18,370 kg",
            "engine_power": "149 kW",
            "blade_capacity": "3.8 m³",
            "max_blade_height": "0.98 m"
        }
    },
    {
        "name": "Liebherr LTM 1070-4.2 Mobile Crane",
        "model": "LTM 1070-4.2",
        "brand": "Liebherr",
        "equipment_type": EquipmentType.CRANE,
        "serial_number": "LH1070-2022-078",
        "year_manufactured": 2022,
        "purchase_cost": Decimal("750000.00"),
        "current_value": Decimal("680000.00"),
        "hourly_rate": Decimal("275.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("350.0"),
        "status": EquipmentStatus.MAINTENANCE,
        "hourmeter_reading": 2156,
        "notes": "All-terrain mobile crane, annual safety inspection due",
        "company_id": 1,
        "specifications": {
            "max_lifting_capacity": "70 tonnes",
            "boom_length": "50 m",
            "max_reach": "46 m",
            "travel_speed": "85 km/h"
        }
    },
    {
        "name": "CAT 924K Wheel Loader",
        "model": "924K",
        "brand": "Caterpillar",
        "equipment_type": EquipmentType.LOADER,
        "serial_number": "CAT924K-2023-215",
        "year_manufactured": 2023,
        "purchase_cost": Decimal("285000.00"),
        "current_value": Decimal("260000.00"),
        "hourly_rate": Decimal("125.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("280.0"),
        "status": EquipmentStatus.AVAILABLE,
        "hourmeter_reading": 856,
        "notes": "Versatile loader for material handling and loading trucks",
        "company_id": 1,
        "specifications": {
            "operating_weight": "12,770 kg",
            "engine_power": "129 kW",
            "bucket_capacity": "2.3 m³",
            "max_dump_height": "2.8 m"
        }
    },
    {
        "name": "Volvo A40G Articulated Hauler",
        "model": "A40G",
        "brand": "Volvo",
        "equipment_type": EquipmentType.TRUCK,
        "serial_number": "VO-A40G-2024-089",
        "year_manufactured": 2024,
        "purchase_cost": Decimal("420000.00"),
        "current_value": Decimal("395000.00"),
        "hourly_rate": Decimal("160.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("480.0"),
        "status": EquipmentStatus.AVAILABLE,
        "hourmeter_reading": 324,
        "notes": "Heavy-duty hauler for transporting materials across rough terrain",
        "company_id": 1,
        "specifications": {
            "payload_capacity": "37 tonnes",
            "body_capacity": "24 m³",
            "max_speed": "55 km/h",
            "gradeability": "35%"
        }
    },
    {
        "name": "Bomag BW 213 D-5 Soil Compactor",
        "model": "BW 213 D-5",
        "brand": "Bomag",
        "equipment_type": EquipmentType.COMPACTOR,
        "serial_number": "BM213D5-2023-156",
        "year_manufactured": 2023,
        "purchase_cost": Decimal("95000.00"),
        "current_value": Decimal("85000.00"),
        "hourly_rate": Decimal("65.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("95.0"),
        "status": EquipmentStatus.AVAILABLE,
        "hourmeter_reading": 678,
        "notes": "Single drum compactor for soil and asphalt compaction",
        "company_id": 1,
        "specifications": {
            "operating_weight": "13,500 kg",
            "drum_width": "2,130 mm",
            "compaction_force": "320 kN",
            "travel_speed": "12 km/h"
        }
    },
    {
        "name": "Genie S-125 Telescopic Boom Lift",
        "model": "S-125",
        "brand": "Genie",
        "equipment_type": EquipmentType.LIFT,
        "serial_number": "GE-S125-2022-321",
        "year_manufactured": 2022,
        "purchase_cost": Decimal("185000.00"),
        "current_value": Decimal("165000.00"),
        "hourly_rate": Decimal("85.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("151.0"),
        "status": EquipmentStatus.RETIRED,
        "hourmeter_reading": 3245,
        "notes": "Retired from service due to age, scheduled for auction",
        "company_id": 1,
        "specifications": {
            "max_platform_height": "38.15 m",
            "max_reach": "24.38 m",
            "platform_capacity": "340 kg",
            "platform_size": "2.44 x 1.22 m"
        }
    },
    {
        "name": "Hitachi ZX350LC-6 Excavator",
        "model": "ZX350LC-6",
        "brand": "Hitachi",
        "equipment_type": EquipmentType.EXCAVATOR,
        "serial_number": "HI-ZX350-2023-467",
        "year_manufactured": 2023,
        "purchase_cost": Decimal("385000.00"),
        "current_value": Decimal("355000.00"),
        "hourly_rate": Decimal("165.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("450.0"),
        "status": EquipmentStatus.OUT_OF_ORDER,
        "hourmeter_reading": 987,
        "notes": "Hydraulic pump failure - awaiting parts for repair",
        "company_id": 1,
        "specifications": {
            "operating_weight": "34,900 kg",
            "engine_power": "202 kW",
            "bucket_capacity": "1.6 m³",
            "max_digging_depth": "7.2 m"
        }
    },
    {
        "name": "CAT CS54B Vibratory Roller",
        "model": "CS54B",
        "brand": "Caterpillar",
        "equipment_type": EquipmentType.COMPACTOR,
        "serial_number": "CAT-CS54B-2024-178",
        "year_manufactured": 2024,
        "purchase_cost": Decimal("125000.00"),
        "current_value": Decimal("115000.00"),
        "hourly_rate": Decimal("75.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("110.0"),
        "status": EquipmentStatus.AVAILABLE,
        "hourmeter_reading": 156,
        "notes": "New double drum roller for asphalt compaction",
        "company_id": 1,
        "specifications": {
            "operating_weight": "10,500 kg",
            "drum_width": "1,680 mm",
            "vibration_frequency": "67 Hz",
            "travel_speed": "11 km/h"
        }
    },
    {
        "name": "JCB 3CX Backhoe Loader",
        "model": "3CX",
        "brand": "JCB",
        "equipment_type": EquipmentType.LOADER,
        "serial_number": "JCB-3CX-2023-892",
        "year_manufactured": 2023,
        "purchase_cost": Decimal("145000.00"),
        "current_value": Decimal("135000.00"),
        "hourly_rate": Decimal("95.00"),
        "fuel_type": FuelType.DIESEL,
        "fuel_capacity": Decimal("185.0"),
        "status": EquipmentStatus.IN_USE,
        "hourmeter_reading": 1455,
        "notes": "Versatile backhoe for utility and small excavation work",
        "company_id": 1,
        "specifications": {
            "operating_weight": "8,200 kg",
            "engine_power": "74 kW",
            "loader_capacity": "1.0 m³",
            "backhoe_capacity": "0.25 m³"
        }
    }
]

async def seed_equipment_data():
    """Seed the database with realistic equipment data"""
    
    print("🌱 Starting equipment database seeding...")
    
    session = get_session()
    
    try:
        # Check if equipment already exists
        existing_count = session.query(Equipment).count()
        if existing_count > 0:
            print(f"⚠️  Database already contains {existing_count} equipment records.")
            response = input("Do you want to add more equipment anyway? (y/N): ")
            if response.lower() != 'y':
                print("❌ Seeding cancelled.")
                return
        
        # Create equipment records
        created_count = 0
        
        for equipment_data in EQUIPMENT_SEED_DATA:
            # Check if this specific equipment already exists (by serial number)
            existing = session.query(Equipment).filter(
                Equipment.serial_number == equipment_data['serial_number']
            ).first()
            
            if existing:
                print(f"⏭️  Skipping {equipment_data['name']} - already exists")
                continue
            
            # Create new equipment
            equipment = Equipment(**equipment_data)
            session.add(equipment)
            created_count += 1
            print(f"✅ Created: {equipment_data['name']} ({equipment_data['status'].value})")
        
        # Commit all changes
        session.commit()
        
        print(f"\n🎉 Successfully created {created_count} equipment records!")
        print(f"📊 Total equipment in database: {session.query(Equipment).count()}")
        
        # Show status distribution
        print("\n📈 Equipment Status Distribution:")
        for status in EquipmentStatus:
            count = session.query(Equipment).filter(Equipment.status == status).count()
            print(f"   {status.value.upper()}: {count}")
            
    except Exception as e:
        session.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        session.close()

async def clear_equipment_data():
    """Clear all equipment data (use with caution!)"""
    
    print("🗑️  DANGER: This will delete ALL equipment data!")
    response = input("Are you absolutely sure? Type 'DELETE ALL' to confirm: ")
    
    if response != 'DELETE ALL':
        print("❌ Operation cancelled.")
        return
    
    session = get_session()
    
    try:
        deleted_count = session.query(Equipment).count()
        session.query(Equipment).delete()
        session.commit()
        
        print(f"🗑️  Deleted {deleted_count} equipment records.")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error clearing database: {e}")
        raise
    finally:
        session.close()

async def show_equipment_summary():
    """Show current equipment summary"""
    
    session = get_session()
    
    try:
        total_count = session.query(Equipment).count()
        
        if total_count == 0:
            print("📭 No equipment found in database.")
            return
        
        print(f"📊 Current Equipment Summary ({total_count} total):")
        print("="*50)
        
        # Status breakdown
        print("\n🔧 By Status:")
        for status in EquipmentStatus:
            count = session.query(Equipment).filter(Equipment.status == status).count()
            if count > 0:
                print(f"   {status.value.upper()}: {count}")
        
        # Type breakdown
        print("\n🚜 By Equipment Type:")
        for eq_type in EquipmentType:
            count = session.query(Equipment).filter(Equipment.equipment_type == eq_type).count()
            if count > 0:
                print(f"   {eq_type.value.upper()}: {count}")
        
        # Value summary
        total_value = session.query(Equipment).with_entities(
            session.query(Equipment.current_value).filter(
                Equipment.current_value.isnot(None)
            ).all()
        )
        
        current_values = [eq.current_value for eq in session.query(Equipment).all() if eq.current_value]
        if current_values:
            total_value = sum(current_values)
            print(f"\n💰 Total Fleet Value: ${total_value:,.2f}")
        
        print("\n📋 Recent Equipment:")
        recent_equipment = session.query(Equipment).order_by(Equipment.created_at.desc()).limit(5).all()
        for eq in recent_equipment:
            print(f"   • {eq.name} ({eq.status.value})")
            
    except Exception as e:
        print(f"❌ Error fetching equipment summary: {e}")
        raise
    finally:
        session.close()

def main():
    """Main CLI interface"""
    
    if len(sys.argv) < 2:
        print("🛠️  Bitcorp ERP Equipment Database Seeder")
        print("="*45)
        print("Usage:")
        print("  python seed_equipment.py seed     - Add sample equipment data")
        print("  python seed_equipment.py summary  - Show current equipment summary") 
        print("  python seed_equipment.py clear    - Delete all equipment (DANGER!)")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'seed':
        asyncio.run(seed_equipment_data())
    elif command == 'summary':
        asyncio.run(show_equipment_summary())
    elif command == 'clear':
        asyncio.run(clear_equipment_data())
    else:
        print(f"❌ Unknown command: {command}")
        print("Available commands: seed, summary, clear")

if __name__ == "__main__":
    main()
