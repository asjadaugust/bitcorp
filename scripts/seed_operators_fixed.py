#!/usr/bin/env python3
"""
Seed Operator Users
Creates dummy operator accounts for testing the operator module
"""

import sys
import os
from datetime import datetime

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import SQLAlchemy for direct database connection
try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
except ImportError:
    print("SQLAlchemy not installed. Please install with: pip install sqlalchemy psycopg2-binary")
    sys.exit(1)

try:
    from backend.app.models.user import User
    from backend.app.models.daily_report import OperatorProfile
    from backend.app.core.security import get_password_hash
except ImportError as e:
    print(f"Error importing backend modules: {e}")
    sys.exit(1)

# Direct database connection
DATABASE_URL = "postgresql://bitcorp:password@localhost:5433/bitcorp_erp"


def create_operator_users():
    """Create dummy operator users for testing"""
    
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        
        # Operator users data
        operators_data = [
            {
                "user": {
                    "username": "john.operator",
                    "email": "john.operator@bitcorp.com",
                    "full_name": "John Operator",
                    "password": "operator123",  # Will be hashed
                    "is_active": True,
                },
                "profile": {
                    "employee_id": "OP-2024-001",
                    "phone_number": "+1-555-0123",
                    "emergency_contact": "Jane Operator",
                    "emergency_phone": "+1-555-0124",
                    "license_number": "CDL-123456789",
                    "license_expiry": datetime(2025, 12, 31),
                    "certifications": '["Heavy Equipment Operator", "Safety Training Certificate", "Crane Operator License", "Forklift Certification"]',
                    "equipment_skills": '["Excavator", "Bulldozer", "Wheel Loader", "Backhoe", "Crane", "Compactor"]',
                    "hire_date": datetime(2023, 1, 15),
                    "hourly_rate": 35.00,
                    "employment_status": "active"
                }
            },
            {
                "user": {
                    "username": "maria.garcia",
                    "email": "maria.garcia@bitcorp.com",
                    "full_name": "Maria Garcia",
                    "password": "operator123",
                    "is_active": True,
                },
                "profile": {
                    "employee_id": "OP-2024-002",
                    "phone_number": "+1-555-0125",
                    "emergency_contact": "Carlos Garcia",
                    "emergency_phone": "+1-555-0126",
                    "license_number": "CDL-987654321",
                    "license_expiry": datetime(2025, 8, 15),
                    "certifications": '["Heavy Equipment Operator", "Safety Training Certificate", "Dozer Operator License"]',
                    "equipment_skills": '["Bulldozer", "Grader", "Compactor", "Dump Truck"]',
                    "hire_date": datetime(2022, 6, 10),
                    "hourly_rate": 38.50,
                    "employment_status": "active"
                }
            },
            {
                "user": {
                    "username": "mike.johnson",
                    "email": "mike.johnson@bitcorp.com",
                    "full_name": "Mike Johnson",
                    "password": "operator123",
                    "is_active": True,
                },
                "profile": {
                    "employee_id": "OP-2024-003",
                    "phone_number": "+1-555-0127",
                    "emergency_contact": "Sarah Johnson",
                    "emergency_phone": "+1-555-0128",
                    "license_number": "CDL-456789123",
                    "license_expiry": datetime(2026, 3, 20),
                    "certifications": '["Heavy Equipment Operator", "Safety Training Certificate", "Crane Operator License", "Rigger Certification"]',
                    "equipment_skills": '["Crane", "Excavator", "Wheel Loader", "Skid Steer"]',
                    "hire_date": datetime(2021, 11, 5),
                    "hourly_rate": 42.00,
                    "employment_status": "active"
                }
            }
        ]
        
        created_count = 0
        
        for operator_data in operators_data:
            user_data = operator_data["user"]
            profile_data = operator_data["profile"]
            
            # Check if user already exists
            existing_user = session.query(User).filter(User.username == user_data["username"]).first()
            if existing_user:
                print(f"User {user_data['username']} already exists, skipping...")
                continue
            
            # Create user
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
                is_active=user_data["is_active"],
                company_id=1  # Default company
            )
            
            session.add(user)
            session.flush()  # Flush to get the user ID
            
            # Create operator profile
            profile = OperatorProfile(
                user_id=user.id,
                employee_id=profile_data["employee_id"],
                phone_number=profile_data["phone_number"],
                emergency_contact=profile_data["emergency_contact"],
                emergency_phone=profile_data["emergency_phone"],
                license_number=profile_data["license_number"],
                license_expiry=profile_data["license_expiry"],
                certifications=profile_data["certifications"],
                equipment_skills=profile_data["equipment_skills"],
                hire_date=profile_data["hire_date"],
                hourly_rate=profile_data["hourly_rate"],
                employment_status=profile_data["employment_status"],
                total_hours_worked=0.0,
                total_reports_submitted=0
            )
            
            session.add(profile)
            created_count += 1
            
            print(f"✅ Created operator: {user_data['full_name']} ({user_data['username']})")
            print(f"   Employee ID: {profile_data['employee_id']}")
            print(f"   Skills: {len(eval(profile_data['equipment_skills']))} equipment types")
            print(f"   Password: operator123")
            print()
        
        # Commit all changes
        session.commit()
        
        print(f"🎉 Successfully created {created_count} operator accounts!")
        print("\n📱 You can now test the operator module with these accounts:")
        print("   - Username: john.operator, Password: operator123")
        print("   - Username: maria.garcia, Password: operator123")
        print("   - Username: mike.johnson, Password: operator123")
        print("\n🔗 Access the operator portal at: http://localhost:3000/operator")
        
    except Exception as e:
        print(f"❌ Error creating operator users: {e}")
        session.rollback()
    finally:
        session.close()


def create_sample_reports():
    """Create some sample daily reports for testing"""
    
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        
        # Import the DailyReport model
        from backend.app.models.daily_report import DailyReport
        
        # Get first operator user
        operator = session.query(User).filter(User.username == "john.operator").first()
        if not operator:
            print("No operator user found. Please run create_operator_users first.")
            return
        
        # Sample report data
        sample_reports = [
            {
                "report_date": datetime(2024, 1, 15, 8, 0),
                "shift_start": datetime(2024, 1, 15, 8, 0),
                "shift_end": datetime(2024, 1, 15, 16, 0),
                "operator_id": operator.id,
                "operator_name": operator.full_name,
                "equipment_id": 1,  # Assuming equipment exists
                "equipment_code": "EXC-001",
                "equipment_name": "CAT 320 Excavator",
                "project_name": "Highway Construction Phase 2",
                "site_location": "Site A - Section 3",
                "work_zone": "Zone A",
                "initial_hourmeter": 1500.0,
                "final_hourmeter": 1508.0,
                "initial_fuel_level": 80.0,
                "final_fuel_level": 45.0,
                "activities_performed": "Excavation and material loading",
                "work_description": "Excavated foundation area for bridge supports. Loaded trucks with excavated material.",
                "equipment_issues": None,
                "maintenance_needed": False,
                "safety_incidents": None,
                "weather_conditions": "Clear",
                "status": "approved",
                "hours_worked": 8.0,
                "fuel_consumed": 35.0
            }
        ]
        
        created_reports = 0
        for report_data in sample_reports:
            report = DailyReport(**report_data)
            session.add(report)
            created_reports += 1
        
        session.commit()
        print(f"✅ Created {created_reports} sample daily reports")
        
    except Exception as e:
        print(f"❌ Error creating sample reports: {e}")
        session.rollback()
    finally:
        session.close()


def main():
    """Main function"""
    print("🚀 Setting up Bitcorp ERP Operator Module")
    print("=" * 50)
    
    create_operator_users()
    print()
    create_sample_reports()
    
    print("\n🎯 Setup complete! The operator module is ready for testing.")


if __name__ == "__main__":
    main()
