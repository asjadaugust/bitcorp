#!/usr/bin/env python3
"""
Seed Operator Users
Creates dummy operator accounts for testing the operator module
"""

import sys
import os
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.models.user import User, UserRole
from backend.app.models.daily_report import OperatorProfile
from backend.app.core.security import get_password_hash

# Direct database connection
DATABASE_URL = "postgresql://bitcorp:password@localhost:5433/bitcorp_erp"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_operator_users():
    """Create dummy operator users for testing"""
    
    session = SessionLocal()
    
    try:
    
    try:
        # Operator users data
        operators_data = [
            {
                "user": {
                    "username": "john.operator",
                    "email": "john.operator@bitcorp.com",
                    "full_name": "John Operator",
                    "password": "operator123",  # Will be hashed
                    "role": UserRole.OPERATOR,
                    "is_active": True,
                    "company_id": 1
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
                    "employment_status": "active",
                    "total_hours_worked": 1840.5,
                    "total_reports_submitted": 245,
                    "average_rating": 4.7
                }
            },
            {
                "user": {
                    "username": "maria.gonzalez",
                    "email": "maria.gonzalez@bitcorp.com",
                    "full_name": "Maria Gonzalez",
                    "password": "operator123",
                    "role": UserRole.OPERATOR,
                    "is_active": True,
                    "company_id": 1
                },
                "profile": {
                    "employee_id": "OP-2024-002",
                    "phone_number": "+1-555-0125",
                    "emergency_contact": "Carlos Gonzalez",
                    "emergency_phone": "+1-555-0126",
                    "license_number": "CDL-987654321",
                    "license_expiry": datetime(2026, 6, 15),
                    "certifications": '["Heavy Equipment Operator", "Safety Training Certificate", "Excavator Specialist"]',
                    "equipment_skills": '["Excavator", "Bulldozer", "Wheel Loader"]',
                    "hire_date": datetime(2023, 3, 20),
                    "hourly_rate": 32.50,
                    "employment_status": "active",
                    "total_hours_worked": 1560.0,
                    "total_reports_submitted": 198,
                    "average_rating": 4.5
                }
            },
            {
                "user": {
                    "username": "mike.johnson",
                    "email": "mike.johnson@bitcorp.com",
                    "full_name": "Mike Johnson",
                    "password": "operator123",
                    "role": UserRole.OPERATOR,
                    "is_active": True,
                    "company_id": 1
                },
                "profile": {
                    "employee_id": "OP-2024-003",
                    "phone_number": "+1-555-0127",
                    "emergency_contact": "Sarah Johnson",
                    "emergency_phone": "+1-555-0128",
                    "license_number": "CDL-456789123",
                    "license_expiry": datetime(2025, 9, 30),
                    "certifications": '["Heavy Equipment Operator", "Safety Training Certificate", "Crane Operator License", "OSHA 30"]',
                    "equipment_skills": '["Crane", "Excavator", "Bulldozer", "Compactor", "Loader"]',
                    "hire_date": datetime(2022, 8, 10),
                    "hourly_rate": 38.00,
                    "employment_status": "active",
                    "total_hours_worked": 2280.5,
                    "total_reports_submitted": 312,
                    "average_rating": 4.8
                }
            }
        ]

        created_users = []
        
        for operator_data in operators_data:
            # Check if user already exists
            existing_user = session.query(User).filter(
                User.username == operator_data["user"]["username"]
            ).first()
            
            if existing_user:
                print(f"👤 User {operator_data['user']['username']} already exists, skipping...")
                continue
            
            # Create user
            user_data = operator_data["user"].copy()
            user_data["password_hash"] = get_password_hash(user_data.pop("password"))
            
            user = User(**user_data)
            session.add(user)
            session.flush()  # Get the user ID
            
            # Create operator profile
            profile_data = operator_data["profile"].copy()
            profile_data["user_id"] = user.id
            
            profile = OperatorProfile(**profile_data)
            session.add(profile)
            
            created_users.append(user.username)
            print(f"✅ Created operator: {user.full_name} ({user.username})")
        
        session.commit()
        
        if created_users:
            print(f"\n🎉 Successfully created {len(created_users)} operator accounts!")
            print("\n📋 Operator Login Credentials:")
            print("="*50)
            for username in created_users:
                print(f"Username: {username}")
                print(f"Password: operator123")
                print("-" * 30)
            
            print("\n🔑 These accounts can be used to test the operator module.")
            print("💡 All operators have the same password for testing: operator123")
        else:
            print("ℹ️ No new operator accounts were created (all already exist).")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error creating operator users: {e}")
        raise
    finally:
        session.close()


async def show_existing_operators():
    """Show existing operator accounts"""
    session = get_session()
    
    try:
        operators = session.query(User).filter(User.role == UserRole.OPERATOR).all()
        
        if not operators:
            print("📭 No operator accounts found in database.")
            return
        
        print(f"👥 Found {len(operators)} operator accounts:")
        print("="*60)
        
        for operator in operators:
            profile = session.query(OperatorProfile).filter(
                OperatorProfile.user_id == operator.id
            ).first()
            
            print(f"Name: {operator.full_name}")
            print(f"Username: {operator.username}")
            print(f"Email: {operator.email}")
            if profile:
                print(f"Employee ID: {profile.employee_id}")
                print(f"Status: {profile.employment_status}")
                print(f"Hours Worked: {profile.total_hours_worked}")
            print(f"Active: {'Yes' if operator.is_active else 'No'}")
            print("-" * 60)
            
    except Exception as e:
        print(f"❌ Error fetching operators: {e}")
        raise
    finally:
        session.close()


async def main():
    """Main function"""
    print("🚀 Bitcorp ERP - Operator User Seeder")
    print("="*50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--show":
        await show_existing_operators()
    else:
        await create_operator_users()


if __name__ == "__main__":
    asyncio.run(main())
