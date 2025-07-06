# Database Design Guidelines for Bitcorp ERP

> Based on principles from "Designing Data-Intensive Applications" by Martin Kleppmann, "SQL Antipatterns" by Bill Karwin, and PostgreSQL best practices

## Table of Contents

- [Core Principles](#core-principles)
- [Schema Design](#schema-design)
- [Data Modeling Patterns](#data-modeling-patterns)
- [Performance Optimization](#performance-optimization)
- [Data Integrity](#data-integrity)
- [Migrations and Versioning](#migrations-and-versioning)
- [Security Considerations](#security-considerations)
- [Monitoring and Observability](#monitoring-and-observability)

## Core Principles

### 1. Reliability

Data must be correct and complete, even when things go wrong.

```sql
-- ✅ Use transactions for multi-table operations
BEGIN;
  UPDATE equipment 
  SET status = 'maintenance' 
  WHERE id = '123';
  
  INSERT INTO maintenance_records (equipment_id, scheduled_date, type)
  VALUES ('123', '2023-01-15', 'preventive');
  
  INSERT INTO audit_logs (entity_type, entity_id, action, user_id)
  VALUES ('equipment', '123', 'status_change', '456');
COMMIT;
```

### 2. Scalability

Design for growth in data volume, read/write throughput, and complexity.

```sql
-- ✅ Partition large tables by date
CREATE TABLE equipment_logs (
    id UUID DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE equipment_logs_2023_01 PARTITION OF equipment_logs
FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');

CREATE TABLE equipment_logs_2023_02 PARTITION OF equipment_logs
FOR VALUES FROM ('2023-02-01') TO ('2023-03-01');
```

### 3. Availability

System should remain operational even during failures.

```sql
-- ✅ Use read replicas for reporting queries
-- Master database for writes
-- Read replicas for reports and analytics

-- Connection string examples:
-- Write: postgresql://user:pass@master-db:5432/bitcorp
-- Read:  postgresql://user:pass@replica-db:5432/bitcorp
```

## Schema Design

### Base Entity Pattern

```sql
-- ✅ Standard base table structure
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Base audit fields for all entities
CREATE TABLE IF NOT EXISTS base_entity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    version INTEGER NOT NULL DEFAULT 1,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Core Domain Tables

```sql
-- Companies table
CREATE TABLE companies (
    -- Base fields
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Business fields
    name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    
    -- Status and metadata
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT companies_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT companies_status_valid CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Equipment table with proper relationships
CREATE TABLE equipment (
    -- Base fields
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Business fields
    name VARCHAR(200) NOT NULL,
    description TEXT,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    
    -- Financial data
    purchase_date DATE NOT NULL,
    purchase_price NUMERIC(12,2) NOT NULL,
    current_value NUMERIC(12,2),
    depreciation_rate NUMERIC(5,4),
    
    -- Operational data
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    location VARCHAR(200),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    -- Relationships
    company_id UUID NOT NULL,
    category_id UUID,
    
    -- Metadata
    specifications JSONB DEFAULT '{}',
    tags TEXT[],
    
    -- Constraints
    CONSTRAINT equipment_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT equipment_serial_not_empty CHECK (length(trim(serial_number)) > 0),
    CONSTRAINT equipment_purchase_price_positive CHECK (purchase_price > 0),
    CONSTRAINT equipment_status_valid CHECK (status IN ('active', 'maintenance', 'retired', 'disposed')),
    
    -- Foreign keys
    CONSTRAINT fk_equipment_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_equipment_category FOREIGN KEY (category_id) REFERENCES equipment_categories(id)
);

-- Equipment categories for hierarchical classification
CREATE TABLE equipment_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID,
    path LTREE, -- PostgreSQL ltree for hierarchical queries
    
    -- Self-referencing foreign key
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES equipment_categories(id),
    CONSTRAINT category_name_not_empty CHECK (length(trim(name)) > 0)
);
```

### Relationship Tables

```sql
-- Many-to-many: Users to Companies (with roles)
CREATE TABLE user_company_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assigned_by UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Constraints
    CONSTRAINT fk_ucr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ucr_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_ucr_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id),
    CONSTRAINT ucr_role_valid CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
    
    -- Unique constraint to prevent duplicate role assignments
    UNIQUE(user_id, company_id, role)
);

-- Equipment assignments (who is using what equipment)
CREATE TABLE equipment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assigned_by UUID NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    returned_by UUID,
    notes TEXT,
    
    -- Constraints
    CONSTRAINT fk_ea_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT fk_ea_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_ea_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id),
    CONSTRAINT fk_ea_returned_by FOREIGN KEY (returned_by) REFERENCES users(id),
    
    -- Business rules
    CONSTRAINT ea_returned_after_assigned CHECK (returned_at IS NULL OR returned_at >= assigned_at),
    CONSTRAINT ea_returned_by_required CHECK (
        (returned_at IS NULL AND returned_by IS NULL) OR 
        (returned_at IS NOT NULL AND returned_by IS NOT NULL)
    )
);
```

## Data Modeling Patterns

### Temporal Data Pattern

```sql
-- Equipment status history using temporal pattern
CREATE TABLE equipment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE,
    changed_by UUID NOT NULL,
    reason TEXT,
    
    -- Constraints
    CONSTRAINT fk_esh_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT fk_esh_changed_by FOREIGN KEY (changed_by) REFERENCES users(id),
    CONSTRAINT esh_status_valid CHECK (status IN ('active', 'maintenance', 'retired', 'disposed')),
    CONSTRAINT esh_effective_period CHECK (effective_to IS NULL OR effective_to > effective_from),
    
    -- Only one current status per equipment
    EXCLUDE USING gist (
        equipment_id WITH =,
        tsrange(effective_from, effective_to, '[)') WITH &&
    )
);

-- Function to get current equipment status
CREATE OR REPLACE FUNCTION get_current_equipment_status(eq_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    current_status VARCHAR(20);
BEGIN
    SELECT status INTO current_status
    FROM equipment_status_history
    WHERE equipment_id = eq_id
    AND effective_from <= NOW()
    AND (effective_to IS NULL OR effective_to > NOW());
    
    RETURN current_status;
END;
$$ LANGUAGE plpgsql;
```

### Event Sourcing Pattern

```sql
-- Event store for audit trail and state reconstruction
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_version INTEGER NOT NULL,
    event_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    recorded_by UUID,
    
    -- Constraints
    CONSTRAINT de_aggregate_type_valid CHECK (aggregate_type IN ('equipment', 'company', 'user')),
    CONSTRAINT de_event_version_positive CHECK (event_version > 0)
);

-- Create index for event replay
CREATE INDEX idx_domain_events_aggregate ON domain_events (aggregate_id, aggregate_type, event_version);
CREATE INDEX idx_domain_events_type_time ON domain_events (event_type, occurred_at);

-- Example event data structure
/*
{
  "event_type": "equipment_status_changed",
  "data": {
    "equipment_id": "123e4567-e89b-12d3-a456-426614174000",
    "old_status": "active",
    "new_status": "maintenance",
    "reason": "Scheduled preventive maintenance"
  },
  "metadata": {
    "user_id": "456e7890-e89b-12d3-a456-426614174000",
    "ip_address": "192.168.1.100",
    "user_agent": "BitcorpERP/1.0"
  }
}
*/
```

### Aggregated Data Pattern

```sql
-- Equipment utilization metrics (materialized view)
CREATE MATERIALIZED VIEW equipment_utilization_monthly AS
SELECT 
    e.id as equipment_id,
    e.name as equipment_name,
    DATE_TRUNC('month', ea.assigned_at) as month,
    COUNT(ea.id) as assignment_count,
    AVG(EXTRACT(epoch FROM (COALESCE(ea.returned_at, NOW()) - ea.assigned_at)) / 3600) as avg_hours_assigned,
    SUM(EXTRACT(epoch FROM (COALESCE(ea.returned_at, NOW()) - ea.assigned_at)) / 3600) as total_hours_assigned
FROM equipment e
LEFT JOIN equipment_assignments ea ON e.id = ea.equipment_id
WHERE ea.assigned_at >= NOW() - INTERVAL '2 years'
GROUP BY e.id, e.name, DATE_TRUNC('month', ea.assigned_at);

-- Create index for fast queries
CREATE INDEX idx_equipment_util_monthly_equipment ON equipment_utilization_monthly (equipment_id, month);

-- Refresh schedule (run daily via cron or scheduler)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY equipment_utilization_monthly;
```

## Performance Optimization

### Indexing Strategy

```sql
-- Primary indexes for frequent queries
CREATE INDEX idx_equipment_company_status ON equipment (company_id, status);
CREATE INDEX idx_equipment_serial_number ON equipment (serial_number);
CREATE INDEX idx_equipment_next_maintenance ON equipment (next_maintenance_date) WHERE next_maintenance_date IS NOT NULL;

-- Composite index for filtering and sorting
CREATE INDEX idx_equipment_company_created ON equipment (company_id, created_at DESC);

-- Partial indexes for specific use cases
CREATE INDEX idx_equipment_active ON equipment (name, serial_number) WHERE status = 'active';
CREATE INDEX idx_equipment_maintenance_due ON equipment (id, next_maintenance_date) 
WHERE next_maintenance_date <= CURRENT_DATE + INTERVAL '7 days';

-- GIN index for JSONB data
CREATE INDEX idx_equipment_specifications ON equipment USING GIN (specifications);
CREATE INDEX idx_equipment_tags ON equipment USING GIN (tags);

-- Text search index
CREATE INDEX idx_equipment_search ON equipment USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || serial_number)
);
```

### Query Optimization

```sql
-- ✅ Efficient equipment search with proper indexing
CREATE OR REPLACE FUNCTION search_equipment(
    p_company_id UUID,
    p_search_term TEXT DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    serial_number VARCHAR(100),
    status VARCHAR(20),
    last_maintenance_date DATE,
    next_maintenance_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        e.serial_number,
        e.status,
        e.last_maintenance_date,
        e.next_maintenance_date
    FROM equipment e
    WHERE e.company_id = p_company_id
    AND (p_status IS NULL OR e.status = p_status)
    AND (p_search_term IS NULL OR 
         to_tsvector('english', e.name || ' ' || COALESCE(e.description, '') || ' ' || e.serial_number) 
         @@ plainto_tsquery('english', p_search_term))
    ORDER BY e.name
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

### Connection Pooling

```python
# SQLAlchemy connection pool configuration
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,                    # Number of connections to maintain
    max_overflow=30,                 # Additional connections when pool is full
    pool_pre_ping=True,              # Validate connections before use
    pool_recycle=3600,               # Recycle connections every hour
    echo=False,                      # Set to True for query logging
    query_cache_size=1200,           # Size of query cache
    connect_args={
        "options": "-c timezone=utc",
        "application_name": "bitcorp_erp",
        "connect_timeout": 10,
    }
)
```

## Data Integrity

### Constraints and Validation

```sql
-- Complex business rule constraints
ALTER TABLE equipment ADD CONSTRAINT equipment_maintenance_dates_logical
CHECK (
    last_maintenance_date IS NULL OR 
    next_maintenance_date IS NULL OR 
    next_maintenance_date > last_maintenance_date
);

-- JSON schema validation for specifications
ALTER TABLE equipment ADD CONSTRAINT equipment_specifications_schema
CHECK (
    specifications IS NULL OR
    jsonb_typeof(specifications) = 'object'
);

-- Custom validation function
CREATE OR REPLACE FUNCTION validate_equipment_serial_number(serial_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Format: EQ-YYYY-XX-NNNNNN
    RETURN serial_number ~ '^EQ-[0-9]{4}-[A-Z]{2}-[0-9]{6}$';
END;
$$ LANGUAGE plpgsql;

ALTER TABLE equipment ADD CONSTRAINT equipment_serial_format
CHECK (validate_equipment_serial_number(serial_number));
```

### Triggers for Business Logic

```sql
-- Automatic maintenance scheduling trigger
CREATE OR REPLACE FUNCTION calculate_next_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate next maintenance based on category and usage
    IF NEW.last_maintenance_date IS NOT NULL THEN
        SELECT 
            NEW.last_maintenance_date + (maintenance_interval_days || ' days')::INTERVAL
        INTO NEW.next_maintenance_date
        FROM equipment_categories ec
        WHERE ec.id = NEW.category_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_next_maintenance
    BEFORE INSERT OR UPDATE OF last_maintenance_date, category_id ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION calculate_next_maintenance();
```

## Migrations and Versioning

### Migration Structure

```sql
-- Migration: 001_create_base_tables.sql
-- Description: Create base entity structure and core tables
-- Author: Development Team
-- Date: 2023-01-15

BEGIN;

-- Version tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(14) PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    applied_by VARCHAR(100) NOT NULL DEFAULT current_user
);

-- Your migration code here
CREATE TABLE companies (
    -- table definition
);

-- Record this migration
INSERT INTO schema_migrations (version, description)
VALUES ('20230115001', 'Create base tables for companies and equipment');

COMMIT;
```

### Safe Migration Practices

```sql
-- ✅ Safe column addition (non-breaking)
ALTER TABLE equipment 
ADD COLUMN warranty_expires_at DATE;

-- ✅ Safe index creation (concurrent)
CREATE INDEX CONCURRENTLY idx_equipment_warranty 
ON equipment (warranty_expires_at) 
WHERE warranty_expires_at IS NOT NULL;

-- ✅ Safe constraint addition (validate first)
ALTER TABLE equipment 
ADD CONSTRAINT equipment_warranty_future 
CHECK (warranty_expires_at IS NULL OR warranty_expires_at > purchase_date) 
NOT VALID;

-- Validate the constraint in a separate step
ALTER TABLE equipment 
VALIDATE CONSTRAINT equipment_warranty_future;

-- ⚠️ Potentially blocking operations (do during maintenance window)
-- ALTER TABLE equipment ALTER COLUMN name SET NOT NULL;
-- ALTER TABLE equipment DROP COLUMN deprecated_field;
```

## Security Considerations

### Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see equipment from their companies
CREATE POLICY equipment_company_isolation ON equipment
FOR ALL
TO application_user
USING (
    company_id IN (
        SELECT company_id 
        FROM user_company_roles 
        WHERE user_id = current_setting('app.current_user_id')::UUID
        AND is_active = true
    )
);

-- Policy: Company admins can see all company data
CREATE POLICY equipment_admin_access ON equipment
FOR ALL
TO application_user
USING (
    EXISTS (
        SELECT 1 
        FROM user_company_roles ucr
        WHERE ucr.user_id = current_setting('app.current_user_id')::UUID
        AND ucr.company_id = equipment.company_id
        AND ucr.role = 'admin'
        AND ucr.is_active = true
    )
);
```

### Data Encryption

```sql
-- Encrypt sensitive data at rest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Store encrypted tax IDs
ALTER TABLE companies 
ADD COLUMN tax_id_encrypted BYTEA;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_tax_id(tax_id TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(tax_id, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_tax_id(encrypted_data BYTEA)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Monitoring and Observability

### Performance Monitoring

```sql
-- Create monitoring views
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    stddev_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100  -- Queries slower than 100ms
ORDER BY mean_time DESC;

-- Table usage statistics
CREATE VIEW table_usage_stats AS
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    ROUND(100 * idx_scan / nullif(seq_scan + idx_scan, 0), 2) AS index_usage_percent
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;
```

### Backup and Recovery

```bash
#!/bin/bash
# Automated backup script

BACKUP_DIR="/backups/postgresql"
DATABASE="bitcorp_erp"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Full database backup
pg_dump \
    --host=localhost \
    --port=5432 \
    --username=postgres \
    --format=custom \
    --compress=9 \
    --file="${BACKUP_DIR}/bitcorp_erp_${TIMESTAMP}.backup" \
    ${DATABASE}

# Schema-only backup
pg_dump \
    --host=localhost \
    --port=5432 \
    --username=postgres \
    --schema-only \
    --file="${BACKUP_DIR}/bitcorp_erp_schema_${TIMESTAMP}.sql" \
    ${DATABASE}

# Cleanup old backups (keep last 30 days)
find ${BACKUP_DIR} -name "*.backup" -mtime +30 -delete
find ${BACKUP_DIR} -name "*_schema_*.sql" -mtime +30 -delete
```

---

*This guide should be regularly updated to reflect database evolution and new patterns.*
