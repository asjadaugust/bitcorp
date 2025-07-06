# Clean Code Guidelines for Bitcorp ERP

*Based on principles from "Clean Code" by Robert C. Martin and "Clean Code in Python" by Mariano Anaya*

## 📋 Table of Contents
- [Naming Conventions](#naming-conventions)
- [Function Design](#function-design)
- [Class Design](#class-design)
- [Error Handling](#error-handling)
- [Comments and Documentation](#comments-and-documentation)
- [Python-Specific Guidelines](#python-specific-guidelines)
- [TypeScript/React Guidelines](#typescriptreact-guidelines)

## 🏷️ Naming Conventions

### General Principles
- **Intention-Revealing**: Names should tell you why it exists, what it does, and how it's used
- **Avoid Disinformation**: Don't leave false clues that obscure the meaning
- **Make Meaningful Distinctions**: Avoid noise words and number series

### Python Naming
```python
# ✅ Good - Clear intention
def calculate_total_equipment_value(equipment_list: List[Equipment]) -> Decimal:
    return sum(equipment.purchase_price for equipment in equipment_list)

# ❌ Bad - Unclear purpose
def calc(lst):
    return sum(x.price for x in lst)
```

### TypeScript/React Naming
```typescript
// ✅ Good - Component and props clearly named
interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipmentId: string) => void;
}

// ❌ Bad - Generic and unclear
interface Props {
  data: any;
  onClick: () => void;
}
```

## ⚙️ Function Design

### Single Responsibility Principle
Each function should do one thing and do it well.

```python
# ✅ Good - Single responsibility
def validate_equipment_serial_number(serial_number: str) -> bool:
    """Validate equipment serial number format."""
    pattern = r'^EQ-\d{4}-[A-Z]{2}-\d{6}$'
    return bool(re.match(pattern, serial_number))

def create_equipment_audit_log(equipment: Equipment, action: str, user: User) -> AuditLog:
    """Create audit log entry for equipment action."""
    return AuditLog(
        entity_type="Equipment",
        entity_id=equipment.id,
        action=action,
        user_id=user.id,
        timestamp=datetime.utcnow()
    )

# ❌ Bad - Multiple responsibilities
def process_equipment(serial_number: str, action: str, user: User):
    # Validation
    if not re.match(r'^EQ-\d{4}-[A-Z]{2}-\d{6}$', serial_number):
        raise ValueError("Invalid serial number")
    
    # Find equipment
    equipment = Equipment.query.filter_by(serial_number=serial_number).first()
    
    # Update equipment
    equipment.status = action
    
    # Log action
    log = AuditLog(entity_type="Equipment", action=action, user_id=user.id)
    db.session.add(log)
    
    # Send notification
    send_notification(user, f"Equipment {serial_number} {action}")
```

### Function Size and Arguments
- **Small**: Functions should be small (20 lines or fewer when possible)
- **Arguments**: Prefer 0-2 arguments, avoid 3+ arguments when possible

```python
# ✅ Good - Small, focused function
def calculate_equipment_depreciation(
    purchase_price: Decimal,
    depreciation_rate: Decimal,
    years_in_service: int
) -> Decimal:
    """Calculate equipment depreciation using straight-line method."""
    annual_depreciation = purchase_price * depreciation_rate
    return annual_depreciation * years_in_service

# ✅ Good - Use data classes for multiple parameters
@dataclass
class EquipmentMaintenanceRequest:
    equipment_id: str
    maintenance_type: MaintenanceType
    scheduled_date: datetime
    technician_id: str
    priority: Priority
    notes: str

def schedule_equipment_maintenance(request: EquipmentMaintenanceRequest) -> MaintenanceSchedule:
    """Schedule equipment maintenance using request object."""
    # Implementation here
    pass
```

## 🏛️ Class Design

### SOLID Principles Application

#### Single Responsibility
```python
# ✅ Good - Each class has one reason to change
class EquipmentRepository:
    """Handles equipment data persistence."""
    
    def find_by_id(self, equipment_id: str) -> Optional[Equipment]:
        return db.session.query(Equipment).filter_by(id=equipment_id).first()
    
    def save(self, equipment: Equipment) -> Equipment:
        db.session.add(equipment)
        db.session.commit()
        return equipment

class EquipmentValidator:
    """Handles equipment business rule validation."""
    
    def validate_serial_number(self, serial_number: str) -> ValidationResult:
        # Validation logic
        pass
    
    def validate_maintenance_schedule(self, equipment: Equipment) -> ValidationResult:
        # Validation logic
        pass

class EquipmentService:
    """Orchestrates equipment business operations."""
    
    def __init__(self, repository: EquipmentRepository, validator: EquipmentValidator):
        self.repository = repository
        self.validator = validator
    
    def create_equipment(self, equipment_data: dict) -> Equipment:
        # Orchestration logic
        pass
```

#### Open/Closed Principle
```python
# ✅ Good - Extensible notification system
from abc import ABC, abstractmethod

class NotificationChannel(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str) -> bool:
        pass

class EmailNotification(NotificationChannel):
    def send(self, recipient: str, message: str) -> bool:
        # Email implementation
        pass

class SMSNotification(NotificationChannel):
    def send(self, recipient: str, message: str) -> bool:
        # SMS implementation
        pass

class NotificationService:
    def __init__(self):
        self.channels: List[NotificationChannel] = []
    
    def add_channel(self, channel: NotificationChannel):
        self.channels.append(channel)
    
    def notify(self, recipient: str, message: str):
        for channel in self.channels:
            channel.send(recipient, message)
```

## 🚨 Error Handling

### Use Exceptions for Exceptional Cases
```python
# ✅ Good - Clear exception hierarchy
class EquipmentError(Exception):
    """Base exception for equipment-related errors."""
    pass

class EquipmentNotFoundError(EquipmentError):
    """Raised when equipment cannot be found."""
    
    def __init__(self, equipment_id: str):
        self.equipment_id = equipment_id
        super().__init__(f"Equipment with ID {equipment_id} not found")

class EquipmentValidationError(EquipmentError):
    """Raised when equipment data validation fails."""
    
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"Validation error in {field}: {message}")

# Usage
def get_equipment(equipment_id: str) -> Equipment:
    equipment = repository.find_by_id(equipment_id)
    if not equipment:
        raise EquipmentNotFoundError(equipment_id)
    return equipment
```

### TypeScript Error Handling
```typescript
// ✅ Good - Result pattern for error handling
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

class EquipmentService {
  async getEquipment(id: string): Promise<Result<Equipment, EquipmentError>> {
    try {
      const equipment = await this.repository.findById(id);
      if (!equipment) {
        return {
          success: false,
          error: new EquipmentNotFoundError(id)
        };
      }
      return { success: true, data: equipment };
    } catch (error) {
      return {
        success: false,
        error: error instanceof EquipmentError ? error : new EquipmentError('Unknown error')
      };
    }
  }
}
```

## 📝 Comments and Documentation

### When to Comment
- **Intent**: Explain why, not what
- **Clarification**: When code cannot be made clearer
- **Warning**: About consequences of changes
- **Amplification**: When subtle code is important

```python
# ✅ Good - Explains business rule and consequence
def calculate_overtime_equipment_cost(hours: int, hourly_rate: Decimal) -> Decimal:
    """
    Calculate overtime costs for equipment usage.
    
    Business rule: Equipment overtime rate is 1.5x after 8 hours daily.
    Critical: This affects billing calculations and must sync with
    the external billing system API calls.
    """
    regular_hours = min(hours, 8)
    overtime_hours = max(0, hours - 8)
    
    return (regular_hours * hourly_rate) + (overtime_hours * hourly_rate * Decimal('1.5'))

# ❌ Bad - Explains what code already shows
def calculate_overtime_equipment_cost(hours: int, hourly_rate: Decimal) -> Decimal:
    # Check if hours is greater than 8
    if hours > 8:
        # Calculate overtime hours
        overtime_hours = hours - 8
        # Return regular hours plus overtime
        return (8 * hourly_rate) + (overtime_hours * hourly_rate * 1.5)
    else:
        # Return regular hours
        return hours * hourly_rate
```

## 🐍 Python-Specific Guidelines

### Type Hints
```python
from typing import List, Dict, Optional, Union, Protocol
from datetime import datetime
from decimal import Decimal

# ✅ Use comprehensive type hints
class EquipmentRepository(Protocol):
    def find_by_status(self, status: EquipmentStatus) -> List[Equipment]:
        ...
    
    def update_maintenance_log(
        self, 
        equipment_id: str, 
        maintenance_data: Dict[str, Union[str, datetime, Decimal]]
    ) -> Optional[MaintenanceRecord]:
        ...
```

### Pythonic Patterns
```python
# ✅ Good - Use list comprehensions appropriately
active_equipment_ids = [eq.id for eq in equipment_list if eq.status == EquipmentStatus.ACTIVE]

# ✅ Good - Use context managers
def export_equipment_report(equipment_ids: List[str], file_path: str) -> None:
    with open(file_path, 'w', encoding='utf-8') as file:
        writer = csv.writer(file)
        for equipment_id in equipment_ids:
            equipment = repository.find_by_id(equipment_id)
            if equipment:
                writer.writerow([equipment.id, equipment.name, equipment.status])

# ✅ Good - Use dataclasses for data containers
@dataclass
class EquipmentSummary:
    total_count: int
    active_count: int
    maintenance_count: int
    retired_count: int
    total_value: Decimal
    
    @property
    def utilization_rate(self) -> float:
        if self.total_count == 0:
            return 0.0
        return self.active_count / self.total_count
```

## ⚛️ TypeScript/React Guidelines

### Component Design
```typescript
// ✅ Good - Small, focused components with clear props
interface EquipmentStatusBadgeProps {
  status: EquipmentStatus;
  size?: 'small' | 'medium' | 'large';
}

const EquipmentStatusBadge: React.FC<EquipmentStatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const getStatusColor = (status: EquipmentStatus): string => {
    switch (status) {
      case EquipmentStatus.ACTIVE:
        return 'success';
      case EquipmentStatus.MAINTENANCE:
        return 'warning';
      case EquipmentStatus.RETIRED:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={status}
      color={getStatusColor(status)}
      size={size}
    />
  );
};
```

### Custom Hooks
```typescript
// ✅ Good - Focused custom hook with clear responsibility
interface UseEquipmentFiltersResult {
  filteredEquipment: Equipment[];
  statusFilter: EquipmentStatus | 'all';
  searchTerm: string;
  setStatusFilter: (status: EquipmentStatus | 'all') => void;
  setSearchTerm: (term: string) => void;
}

const useEquipmentFilters = (equipment: Equipment[]): UseEquipmentFiltersResult => {
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEquipment = useMemo(() => {
    return equipment.filter(eq => {
      const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
      const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [equipment, statusFilter, searchTerm]);

  return {
    filteredEquipment,
    statusFilter,
    searchTerm,
    setStatusFilter,
    setSearchTerm
  };
};
```

## 🎯 Project-Specific Conventions

### Database Models
```python
# ✅ Consistent model structure
class Equipment(BaseModel):
    """Equipment entity with full audit trail."""
    
    __tablename__ = 'equipment'
    
    # Primary identification
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    serial_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    
    # Basic information
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Business fields
    status: Mapped[EquipmentStatus] = mapped_column(Enum(EquipmentStatus), default=EquipmentStatus.ACTIVE)
    purchase_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    purchase_price: Mapped[Decimal] = mapped_column(DECIMAL(precision=10, scale=2))
    
    # Relationships
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey('companies.id'))
    company: Mapped['Company'] = relationship(back_populates='equipment')
    
    # Audit fields (inherited from BaseModel)
    # created_at, updated_at, created_by, updated_by
```

### API Endpoints
```python
# ✅ Consistent API structure
@router.get("/equipment/{equipment_id}", response_model=EquipmentDetailResponse)
async def get_equipment(
    equipment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> EquipmentDetailResponse:
    """
    Get equipment by ID with full details.
    
    Requires: Equipment read permission
    Returns: Complete equipment information including maintenance history
    """
    # Permission check
    if not current_user.has_permission(Permission.EQUIPMENT_READ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to read equipment"
        )
    
    # Business logic
    equipment = equipment_service.get_equipment_with_details(equipment_id)
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with ID {equipment_id} not found"
        )
    
    return EquipmentDetailResponse.from_orm(equipment)
```

## 🔍 Code Review Checklist

### Before Submitting
- [ ] **Naming**: Are all names intention-revealing?
- [ ] **Functions**: Do functions do one thing and do it well?
- [ ] **Size**: Are functions and classes appropriately sized?
- [ ] **Dependencies**: Are dependencies minimized and explicit?
- [ ] **Tests**: Are there comprehensive tests covering edge cases?
- [ ] **Documentation**: Is complex business logic documented?
- [ ] **Error Handling**: Are all error cases handled appropriately?
- [ ] **Type Safety**: Are types used correctly throughout?

### During Review
- [ ] **Readability**: Can the code be understood without explanation?
- [ ] **Performance**: Are there obvious performance issues?
- [ ] **Security**: Are there potential security vulnerabilities?
- [ ] **Consistency**: Does the code follow project conventions?
- [ ] **Architecture**: Does the code fit the overall system design?

---

*This guide should be continuously updated as the project evolves and new patterns emerge.*
