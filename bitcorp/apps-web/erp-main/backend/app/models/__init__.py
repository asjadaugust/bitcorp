# Models package
from .base import Base, BaseModel
from .user import User, Role, Permission
from .company import Company
from .equipment import Equipment
from .iot import IoTDevice, SensorReading, MaintenanceAlert, PredictiveModel, EquipmentHealthScore

# Make sure all models are imported for SQLAlchemy relationships
__all__ = [
    "Base",
    "BaseModel",
    "User",
    "Role",
    "Permission",
    "Company",
    "Equipment",
    "IoTDevice",
    "SensorReading",
    "MaintenanceAlert",
    "PredictiveModel",
    "EquipmentHealthScore"
]
