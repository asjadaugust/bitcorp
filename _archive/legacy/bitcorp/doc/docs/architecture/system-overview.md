# System Architecture Overview - Bitcorp ERP

> Based on principles from "Domain-Driven Design" by Eric Evans, "Patterns of Enterprise Application Architecture" by Martin Fowler, and "Designing Data-Intensive Applications" by Martin Kleppmann

## Table of Contents

- [Architecture Philosophy](#architecture-philosophy)
- [Domain Model](#domain-model)
- [System Architecture](#system-architecture)
- [Bounded Contexts](#bounded-contexts)
- [Data Architecture](#data-architecture)
- [Integration Patterns](#integration-patterns)
- [Scalability Strategy](#scalability-strategy)
- [Security Architecture](#security-architecture)

## Architecture Philosophy

### Core Principles

1. **Domain-Driven Design**: Structure the system around business domains
2. **Separation of Concerns**: Clear boundaries between layers and components
3. **Scalability by Design**: Build for growth from day one
4. **Testability**: Every component should be easily testable
5. **Maintainability**: Code should be easy to understand and modify

### Architectural Patterns

```text
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Web Frontend  │ │   Mobile PWA    │ │   Admin Panel   ││
│  │   (Next.js)     │ │   (Next.js)     │ │   (Next.js)     ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                       │
│                     (FastAPI Router)                        │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Equipment       │ │   User Mgmt     │ │    Reports      ││
│  │ Services        │ │   Services      │ │   Services      ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Equipment       │ │   Company       │ │     User        ││
│  │ Aggregate       │ │   Aggregate     │ │   Aggregate     ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   PostgreSQL    │ │     Redis       │ │  File Storage   ││
│  │   Database      │ │     Cache       │ │     (S3)        ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Domain Model

### Core Aggregates

```python
# Equipment Aggregate Root
class Equipment:
    """
    Equipment aggregate root - controls all operations on equipment entities.
    
    Business Rules:
    - Equipment must have unique serial number within company
    - Status transitions follow predefined workflow
    - Maintenance scheduling follows business rules
    - Depreciation calculations use company policies
    """
    
    def __init__(self, name: str, serial_number: str, company_id: str):
        self._id = EquipmentId.generate()
        self._name = EquipmentName(name)
        self._serial_number = SerialNumber(serial_number)
        self._company_id = CompanyId(company_id)
        self._status = EquipmentStatus.ACTIVE
        self._events: List[DomainEvent] = []
        
        # Raise domain event
        self._events.append(EquipmentCreated(
            equipment_id=self._id,
            name=self._name.value,
            serial_number=self._serial_number.value,
            company_id=self._company_id.value
        ))
    
    def schedule_maintenance(self, maintenance_type: MaintenanceType, scheduled_date: date) -> None:
        """Schedule maintenance following business rules."""
        if not self._can_schedule_maintenance():
            raise EquipmentBusinessRuleViolation("Equipment cannot be scheduled for maintenance")
        
        if scheduled_date <= date.today():
            raise EquipmentBusinessRuleViolation("Maintenance cannot be scheduled in the past")
        
        self._status = EquipmentStatus.MAINTENANCE_SCHEDULED
        self._events.append(MaintenanceScheduled(
            equipment_id=self._id,
            maintenance_type=maintenance_type,
            scheduled_date=scheduled_date
        ))
    
    def complete_maintenance(self, completed_by: UserId, notes: str = None) -> None:
        """Complete maintenance and update equipment status."""
        if self._status != EquipmentStatus.MAINTENANCE_SCHEDULED:
            raise EquipmentBusinessRuleViolation("Equipment is not scheduled for maintenance")
        
        self._status = EquipmentStatus.ACTIVE
        self._last_maintenance_date = date.today()
        
        self._events.append(MaintenanceCompleted(
            equipment_id=self._id,
            completed_by=completed_by,
            completed_date=date.today(),
            notes=notes
        ))
    
    def retire(self, reason: str, retired_by: UserId) -> None:
        """Retire equipment following business rules."""
        if self._status == EquipmentStatus.RETIRED:
            raise EquipmentBusinessRuleViolation("Equipment is already retired")
        
        if self._has_active_assignments():
            raise EquipmentBusinessRuleViolation("Cannot retire equipment with active assignments")
        
        self._status = EquipmentStatus.RETIRED
        self._retired_date = date.today()
        
        self._events.append(EquipmentRetired(
            equipment_id=self._id,
            reason=reason,
            retired_by=retired_by,
            retired_date=date.today()
        ))
    
    def get_uncommitted_events(self) -> List[DomainEvent]:
        """Get events that haven't been published yet."""
        return self._events.copy()
    
    def mark_events_as_committed(self) -> None:
        """Mark events as published."""
        self._events.clear()

# Company Aggregate Root
class Company:
    """
    Company aggregate root - manages company-wide policies and settings.
    """
    
    def __init__(self, name: str, tax_id: str):
        self._id = CompanyId.generate()
        self._name = CompanyName(name)
        self._tax_id = TaxId(tax_id)
        self._status = CompanyStatus.ACTIVE
        self._settings = CompanySettings.default()
        self._events: List[DomainEvent] = []
        
        self._events.append(CompanyCreated(
            company_id=self._id,
            name=self._name.value,
            tax_id=self._tax_id.value
        ))
    
    def add_user(self, user_id: UserId, role: UserRole, added_by: UserId) -> None:
        """Add user to company with specific role."""
        if not self._is_active():
            raise CompanyBusinessRuleViolation("Cannot add users to inactive company")
        
        if role == UserRole.ADMIN and not self._can_add_admin(added_by):
            raise CompanyBusinessRuleViolation("Only existing admins can add new admins")
        
        self._events.append(UserAddedToCompany(
            company_id=self._id,
            user_id=user_id,
            role=role,
            added_by=added_by
        ))
    
    def update_maintenance_policy(self, policy: MaintenancePolicy, updated_by: UserId) -> None:
        """Update company maintenance policy."""
        if not self._has_admin_permission(updated_by):
            raise CompanyBusinessRuleViolation("Only admins can update maintenance policy")
        
        self._settings.maintenance_policy = policy
        
        self._events.append(MaintenancePolicyUpdated(
            company_id=self._id,
            policy=policy,
            updated_by=updated_by
        ))

# Value Objects
@dataclass(frozen=True)
class SerialNumber:
    """Value object for equipment serial numbers."""
    value: str
    
    def __post_init__(self):
        if not self._is_valid_format(self.value):
            raise ValueError(f"Invalid serial number format: {self.value}")
    
    @staticmethod
    def _is_valid_format(serial: str) -> bool:
        """Validate serial number format: EQ-YYYY-XX-NNNNNN"""
        import re
        pattern = r'^EQ-\d{4}-[A-Z]{2}-\d{6}$'
        return bool(re.match(pattern, serial))

@dataclass(frozen=True)
class EquipmentName:
    """Value object for equipment names."""
    value: str
    
    def __post_init__(self):
        if not self.value or len(self.value.strip()) == 0:
            raise ValueError("Equipment name cannot be empty")
        if len(self.value) > 200:
            raise ValueError("Equipment name cannot exceed 200 characters")

# Domain Events
@dataclass(frozen=True)
class EquipmentCreated(DomainEvent):
    equipment_id: EquipmentId
    name: str
    serial_number: str
    company_id: str
    occurred_at: datetime = field(default_factory=datetime.utcnow)

@dataclass(frozen=True)
class MaintenanceScheduled(DomainEvent):
    equipment_id: EquipmentId
    maintenance_type: MaintenanceType
    scheduled_date: date
    occurred_at: datetime = field(default_factory=datetime.utcnow)

@dataclass(frozen=True)
class MaintenanceCompleted(DomainEvent):
    equipment_id: EquipmentId
    completed_by: UserId
    completed_date: date
    notes: Optional[str]
    occurred_at: datetime = field(default_factory=datetime.utcnow)
```

## System Architecture

### Microservices Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                             │
│                  (Kong / NGINX)                             │
│  - Request Routing        - Rate Limiting                   │
│  - Authentication         - Load Balancing                  │
│  - Response Transformation                                  │
└─────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Equipment      │ │   User Mgmt     │ │   Reporting     │
│  Service        │ │   Service       │ │   Service       │
│                 │ │                 │ │                 │
│  - Equipment    │ │  - Users        │ │  - Analytics    │
│  - Maintenance  │ │  - Roles        │ │  - Dashboards   │
│  - Assignments  │ │  - Permissions  │ │  - Exports      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │   PostgreSQL    │ │   ClickHouse    │
│   Database      │ │   Database      │ │   (Analytics)   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Service Communication

```python
# Event-Driven Communication
class EventBus:
    """Domain event bus for inter-service communication."""
    
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.handlers: Dict[str, List[Callable]] = {}
    
    def publish(self, event: DomainEvent) -> None:
        """Publish domain event to all subscribers."""
        event_data = {
            "event_type": event.__class__.__name__,
            "aggregate_id": str(event.aggregate_id),
            "data": asdict(event),
            "timestamp": event.occurred_at.isoformat(),
            "version": 1
        }
        
        # Publish to Redis streams
        self.redis.xadd(
            f"events:{event.__class__.__name__}",
            event_data
        )
        
        # Also publish to general event stream
        self.redis.xadd("events:all", event_data)
    
    def subscribe(self, event_type: str, handler: Callable[[DomainEvent], None]) -> None:
        """Subscribe to specific event type."""
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler)
    
    async def start_consuming(self) -> None:
        """Start consuming events from Redis streams."""
        consumer_group = "bitcorp_erp_consumers"
        
        # Create consumer group if it doesn't exist
        try:
            self.redis.xgroup_create("events:all", consumer_group, id="0", mkstream=True)
        except ResponseError:
            pass  # Group already exists
        
        while True:
            try:
                messages = self.redis.xreadgroup(
                    consumer_group,
                    "consumer-1",
                    {"events:all": ">"},
                    count=10,
                    block=1000
                )
                
                for stream, msgs in messages:
                    for msg_id, fields in msgs:
                        await self._process_message(msg_id, fields)
                        
            except Exception as e:
                logger.error(f"Error consuming events: {e}")
                await asyncio.sleep(5)
    
    async def _process_message(self, msg_id: str, fields: Dict[str, str]) -> None:
        """Process individual event message."""
        try:
            event_type = fields["event_type"]
            
            if event_type in self.handlers:
                # Deserialize event
                event_data = json.loads(fields["data"])
                event = self._deserialize_event(event_type, event_data)
                
                # Call all handlers
                for handler in self.handlers[event_type]:
                    await handler(event)
                
                # Acknowledge message
                self.redis.xack("events:all", "bitcorp_erp_consumers", msg_id)
                
        except Exception as e:
            logger.error(f"Error processing message {msg_id}: {e}")

# Example Event Handlers
class EquipmentEventHandlers:
    """Event handlers for equipment-related events."""
    
    def __init__(self, notification_service: NotificationService):
        self.notification_service = notification_service
    
    async def handle_equipment_created(self, event: EquipmentCreated) -> None:
        """Handle equipment creation event."""
        # Send notification to admins
        await self.notification_service.notify_admins(
            f"New equipment created: {event.name}",
            notification_type="equipment_created"
        )
        
        # Update search index
        await self._update_search_index(event.equipment_id)
    
    async def handle_maintenance_scheduled(self, event: MaintenanceScheduled) -> None:
        """Handle maintenance scheduling event."""
        # Send notification to maintenance team
        await self.notification_service.notify_maintenance_team(
            f"Maintenance scheduled for {event.equipment_id}",
            scheduled_date=event.scheduled_date
        )
        
        # Create calendar entry
        await self._create_calendar_entry(event)
    
    async def handle_maintenance_completed(self, event: MaintenanceCompleted) -> None:
        """Handle maintenance completion event."""
        # Update equipment analytics
        await self._update_maintenance_analytics(event)
        
        # Generate maintenance report
        await self._generate_maintenance_report(event)
```

## Bounded Contexts

### Context Map

```text
┌─────────────────────────────────────────────────────────────┐
│                Equipment Management Context                  │
│                                                             │
│  Entities:                                                  │
│  - Equipment        - MaintenanceRecord                    │
│  - EquipmentCategory - Assignment                          │
│                                                             │
│  Services:                                                  │
│  - EquipmentService     - MaintenanceService               │
│  - AssignmentService    - InventoryService                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Customer/Supplier)
                              │
┌─────────────────────────────────────────────────────────────┐
│                 User Management Context                     │
│                                                             │
│  Entities:                                                  │
│  - User             - Role                                  │
│  - Company          - Permission                           │
│                                                             │
│  Services:                                                  │
│  - UserService          - AuthenticationService           │
│  - CompanyService       - AuthorizationService            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Conformist)
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Reporting Context                          │
│                                                             │
│  Entities:                                                  │
│  - Report           - Dashboard                            │
│  - Metric           - Visualization                       │
│                                                             │
│  Services:                                                  │
│  - ReportingService     - AnalyticsService                │
│  - ExportService        - VisualizationService            │
└─────────────────────────────────────────────────────────────┘
```

### Anti-Corruption Layer

```python
# Anti-corruption layer for external integrations
class ExternalSystemAdapter:
    """Adapter for external ERP systems."""
    
    def __init__(self, external_client: ExternalERPClient):
        self.client = external_client
    
    def import_equipment(self, external_equipment_data: Dict) -> Equipment:
        """Import equipment from external system, converting to our domain model."""
        
        # Map external fields to our domain
        mapped_data = self._map_external_equipment(external_equipment_data)
        
        # Validate using our business rules
        self._validate_equipment_data(mapped_data)
        
        # Create domain object
        return Equipment(
            name=mapped_data["name"],
            serial_number=mapped_data["serial_number"],
            company_id=mapped_data["company_id"]
        )
    
    def _map_external_equipment(self, external_data: Dict) -> Dict:
        """Map external system fields to our domain model."""
        return {
            "name": external_data.get("equipment_name", "Unknown"),
            "serial_number": self._convert_serial_number(external_data.get("asset_id")),
            "company_id": self._resolve_company_id(external_data.get("organization_code")),
            "purchase_price": self._convert_currency(external_data.get("cost")),
            "status": self._map_status(external_data.get("state"))
        }
    
    def _convert_serial_number(self, external_id: str) -> str:
        """Convert external asset ID to our serial number format."""
        if not external_id:
            raise ValueError("External asset ID is required")
        
        # Convert to our format: EQ-YYYY-XX-NNNNNN
        current_year = datetime.now().year
        return f"EQ-{current_year}-EX-{external_id.zfill(6)}"
    
    def _map_status(self, external_status: str) -> EquipmentStatus:
        """Map external status to our status enum."""
        status_mapping = {
            "ACTIVE": EquipmentStatus.ACTIVE,
            "IN_USE": EquipmentStatus.ACTIVE,
            "MAINTENANCE": EquipmentStatus.MAINTENANCE,
            "REPAIR": EquipmentStatus.MAINTENANCE,
            "RETIRED": EquipmentStatus.RETIRED,
            "DISPOSED": EquipmentStatus.RETIRED
        }
        
        return status_mapping.get(external_status, EquipmentStatus.ACTIVE)
```

## Data Architecture

### CQRS Pattern Implementation

```python
# Command Model (Write Side)
class EquipmentCommandModel:
    """Command model for equipment operations."""
    
    def __init__(self, repository: EquipmentRepository, event_bus: EventBus):
        self.repository = repository
        self.event_bus = event_bus
    
    async def create_equipment(self, command: CreateEquipmentCommand) -> EquipmentId:
        """Handle equipment creation command."""
        
        # Load company aggregate to validate
        company = await self.repository.get_company(command.company_id)
        if not company or not company.is_active():
            raise CompanyNotFoundError(command.company_id)
        
        # Create equipment aggregate
        equipment = Equipment(
            name=command.name,
            serial_number=command.serial_number,
            company_id=command.company_id
        )
        
        # Save aggregate
        await self.repository.save_equipment(equipment)
        
        # Publish events
        for event in equipment.get_uncommitted_events():
            await self.event_bus.publish(event)
        
        equipment.mark_events_as_committed()
        
        return equipment.id

# Query Model (Read Side)
class EquipmentQueryModel:
    """Query model for equipment read operations."""
    
    def __init__(self, read_db: ReadDatabase):
        self.read_db = read_db
    
    async def get_equipment_list(self, query: EquipmentListQuery) -> EquipmentListResult:
        """Get paginated equipment list with filtering."""
        
        sql = """
        SELECT 
            e.id,
            e.name,
            e.serial_number,
            e.status,
            e.purchase_price,
            e.current_value,
            c.name as company_name,
            cat.name as category_name
        FROM equipment_read_model e
        JOIN company_read_model c ON e.company_id = c.id
        LEFT JOIN equipment_category_read_model cat ON e.category_id = cat.id
        WHERE 1=1
        """
        
        params = {}
        
        if query.status:
            sql += " AND e.status = :status"
            params["status"] = query.status
        
        if query.company_id:
            sql += " AND e.company_id = :company_id"
            params["company_id"] = query.company_id
        
        if query.search:
            sql += " AND (e.name ILIKE :search OR e.serial_number ILIKE :search)"
            params["search"] = f"%{query.search}%"
        
        sql += " ORDER BY e.name LIMIT :limit OFFSET :offset"
        params["limit"] = query.limit
        params["offset"] = query.offset
        
        results = await self.read_db.fetch_all(sql, params)
        
        return EquipmentListResult(
            items=[EquipmentListItem(**row) for row in results],
            total=await self._count_equipment(query),
            limit=query.limit,
            offset=query.offset
        )

# Event Projections
class EquipmentProjection:
    """Project equipment events to read model."""
    
    def __init__(self, read_db: ReadDatabase):
        self.read_db = read_db
    
    async def handle_equipment_created(self, event: EquipmentCreated) -> None:
        """Project equipment creation to read model."""
        
        await self.read_db.execute("""
            INSERT INTO equipment_read_model (
                id, name, serial_number, status, company_id, created_at
            ) VALUES (
                :id, :name, :serial_number, :status, :company_id, :created_at
            )
        """, {
            "id": str(event.equipment_id),
            "name": event.name,
            "serial_number": event.serial_number,
            "status": "active",
            "company_id": event.company_id,
            "created_at": event.occurred_at
        })
    
    async def handle_maintenance_completed(self, event: MaintenanceCompleted) -> None:
        """Update read model when maintenance is completed."""
        
        await self.read_db.execute("""
            UPDATE equipment_read_model 
            SET 
                status = 'active',
                last_maintenance_date = :completed_date,
                updated_at = :updated_at
            WHERE id = :equipment_id
        """, {
            "equipment_id": str(event.equipment_id),
            "completed_date": event.completed_date,
            "updated_at": event.occurred_at
        })
```

## Integration Patterns

### API Gateway Configuration

```yaml
# Kong API Gateway configuration
_format_version: "2.1"

services:
  - name: equipment-service
    url: http://equipment-service:8000
    routes:
      - name: equipment-routes
        paths:
          - /api/v1/equipment
        methods:
          - GET
          - POST
          - PUT
          - DELETE
    plugins:
      - name: rate-limiting
        config:
          minute: 1000
          hour: 10000
      - name: jwt
        config:
          secret_is_base64: false
          key_claim_name: kid
      - name: cors
        config:
          origins:
            - http://localhost:3000
            - https://bitcorp-erp.com

  - name: user-service
    url: http://user-service:8000
    routes:
      - name: auth-routes
        paths:
          - /api/v1/auth
        methods:
          - POST
      - name: user-routes
        paths:
          - /api/v1/users
        methods:
          - GET
          - POST
          - PUT
          - DELETE
    plugins:
      - name: rate-limiting
        config:
          minute: 500
          hour: 5000

  - name: reporting-service
    url: http://reporting-service:8000
    routes:
      - name: report-routes
        paths:
          - /api/v1/reports
        methods:
          - GET
          - POST
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
      - name: response-transformer
        config:
          add:
            headers:
              - "Cache-Control: max-age=300"
```

## Scalability Strategy

### Horizontal Scaling

```yaml
# Kubernetes deployment for equipment service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: equipment-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: equipment-service
  template:
    metadata:
      labels:
        app: equipment-service
    spec:
      containers:
      - name: equipment-service
        image: bitcorp/equipment-service:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: equipment-service
spec:
  selector:
    app: equipment-service
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: equipment-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: equipment-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

```python
# Database sharding strategy
class DatabaseSharding:
    """Database sharding for horizontal scaling."""
    
    def __init__(self, shard_configs: List[DatabaseConfig]):
        self.shards = {
            shard.name: create_engine(shard.url)
            for shard in shard_configs
        }
    
    def get_shard_for_company(self, company_id: str) -> Engine:
        """Route company data to specific shard."""
        # Simple hash-based sharding
        shard_hash = hash(company_id) % len(self.shards)
        shard_name = f"shard_{shard_hash}"
        return self.shards[shard_name]
    
    def get_shard_for_equipment(self, equipment_id: str, company_id: str) -> Engine:
        """Route equipment data to company's shard."""
        return self.get_shard_for_company(company_id)

# Read replica routing
class ReadReplicaRouter:
    """Route read queries to read replicas."""
    
    def __init__(self, master_url: str, replica_urls: List[str]):
        self.master = create_engine(master_url)
        self.replicas = [create_engine(url) for url in replica_urls]
        self.current_replica = 0
    
    def get_read_engine(self) -> Engine:
        """Get read replica in round-robin fashion."""
        engine = self.replicas[self.current_replica]
        self.current_replica = (self.current_replica + 1) % len(self.replicas)
        return engine
    
    def get_write_engine(self) -> Engine:
        """Get master database for writes."""
        return self.master
```

## Security Architecture

### Zero Trust Security Model

```python
# Security middleware
class SecurityMiddleware:
    """Comprehensive security middleware."""
    
    def __init__(self, jwt_service: JWTService, rbac_service: RBACService):
        self.jwt_service = jwt_service
        self.rbac_service = rbac_service
    
    async def __call__(self, request: Request, call_next):
        # 1. Request logging and rate limiting
        await self._log_request(request)
        await self._check_rate_limit(request)
        
        # 2. Authentication
        user = await self._authenticate_user(request)
        
        # 3. Authorization
        await self._authorize_request(request, user)
        
        # 4. Input validation and sanitization
        await self._validate_input(request)
        
        # 5. Process request
        response = await call_next(request)
        
        # 6. Response security headers
        self._add_security_headers(response)
        
        return response
    
    async def _authenticate_user(self, request: Request) -> Optional[User]:
        """Authenticate user from JWT token."""
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        
        try:
            payload = self.jwt_service.verify_token(token)
            user = await self._get_user(payload["sub"])
            
            # Check if user is still active
            if not user or not user.is_active:
                raise AuthenticationError("User account is inactive")
            
            return user
            
        except (JWTError, AuthenticationError):
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials"
            )
    
    async def _authorize_request(self, request: Request, user: Optional[User]) -> None:
        """Check if user has permission for this request."""
        if not user:
            if self._requires_authentication(request):
                raise HTTPException(status_code=401, detail="Authentication required")
            return
        
        required_permission = self._get_required_permission(request)
        if required_permission and not await self.rbac_service.has_permission(user, required_permission):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    def _add_security_headers(self, response: Response) -> None:
        """Add security headers to response."""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"

# Role-Based Access Control
class RBACService:
    """Role-based access control service."""
    
    def __init__(self, cache: Redis):
        self.cache = cache
    
    async def has_permission(self, user: User, permission: str) -> bool:
        """Check if user has specific permission."""
        # Check cache first
        cache_key = f"permissions:{user.id}"
        cached_permissions = await self.cache.get(cache_key)
        
        if cached_permissions:
            permissions = json.loads(cached_permissions)
        else:
            # Load from database
            permissions = await self._load_user_permissions(user)
            # Cache for 5 minutes
            await self.cache.setex(
                cache_key, 
                300, 
                json.dumps(permissions)
            )
        
        return permission in permissions
    
    async def _load_user_permissions(self, user: User) -> List[str]:
        """Load user permissions from database."""
        # Load user roles and their permissions
        user_roles = await self._get_user_roles(user.id)
        
        permissions = set()
        for role in user_roles:
            role_permissions = await self._get_role_permissions(role.id)
            permissions.update(role_permissions)
        
        return list(permissions)
```

---

*This architecture overview should be continuously updated as the system evolves and new patterns emerge.*
