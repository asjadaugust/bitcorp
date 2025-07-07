-- Equipment Scheduling System Database Schema
-- Phase 1 Feature 1: Equipment Scheduling and Conflict Detection

-- Projects Table (ensuring it exists for scheduling)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_code VARCHAR(50) UNIQUE,
    client_name VARCHAR(255),
    client_contact VARCHAR(255),
    start_date DATE,
    end_date DATE,
    estimated_budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'planning', -- planning, active, on_hold, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    project_manager_id INTEGER REFERENCES users(id),
    location POINT,
    address TEXT,
    specifications JSONB DEFAULT '{}',
    documents JSONB DEFAULT '[]',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Schedules Table  
CREATE TABLE equipment_schedules (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    operator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure logical date ranges
    CONSTRAINT valid_date_range CHECK (start_datetime < end_datetime),
    -- Prevent scheduling too far in the past
    CONSTRAINT not_too_old CHECK (start_datetime >= CURRENT_TIMESTAMP - INTERVAL '7 days')
);

-- Create indexes for performance
CREATE INDEX idx_equipment_schedules_equipment_date ON equipment_schedules(equipment_id, start_datetime, end_datetime);
CREATE INDEX idx_equipment_schedules_project ON equipment_schedules(project_id);
CREATE INDEX idx_equipment_schedules_operator ON equipment_schedules(operator_id);
CREATE INDEX idx_equipment_schedules_status_date ON equipment_schedules(status, start_datetime);

-- Equipment Schedule Conflicts Log (for audit and analysis)
CREATE TABLE schedule_conflicts_log (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id),
    conflicting_schedule_id INTEGER REFERENCES equipment_schedules(id),
    attempted_start TIMESTAMP WITH TIME ZONE NOT NULL,
    attempted_end TIMESTAMP WITH TIME ZONE NOT NULL,
    conflict_type VARCHAR(50) NOT NULL, -- overlap, adjacent, maintenance_conflict
    severity VARCHAR(20) NOT NULL, -- error, warning, info
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by INTEGER REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Availability View for quick queries
CREATE OR REPLACE VIEW equipment_availability AS
SELECT 
    e.id,
    e.name,
    e.equipment_type,
    e.status as equipment_status,
    CASE 
        WHEN e.status NOT IN ('available', 'in_use') THEN false
        WHEN EXISTS (
            SELECT 1 FROM equipment_schedules es 
            WHERE es.equipment_id = e.id 
            AND es.status IN ('scheduled', 'active')
            AND es.start_datetime <= CURRENT_TIMESTAMP + INTERVAL '1 hour'
            AND es.end_datetime >= CURRENT_TIMESTAMP
        ) THEN false
        ELSE true
    END as currently_available,
    (
        SELECT COUNT(*) 
        FROM equipment_schedules es 
        WHERE es.equipment_id = e.id 
        AND es.status IN ('scheduled', 'active')
        AND es.start_datetime >= CURRENT_TIMESTAMP
    ) as upcoming_schedules,
    (
        SELECT MIN(es.start_datetime)
        FROM equipment_schedules es 
        WHERE es.equipment_id = e.id 
        AND es.status IN ('scheduled', 'active')
        AND es.start_datetime >= CURRENT_TIMESTAMP
    ) as next_scheduled_time
FROM equipment e
WHERE e.is_active = true;

-- Function to check for schedule conflicts
CREATE OR REPLACE FUNCTION check_schedule_conflicts(
    p_equipment_id INTEGER,
    p_start_datetime TIMESTAMP WITH TIME ZONE,
    p_end_datetime TIMESTAMP WITH TIME ZONE,
    p_exclude_schedule_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    conflicting_schedule_id INTEGER,
    conflict_start TIMESTAMP WITH TIME ZONE,
    conflict_end TIMESTAMP WITH TIME ZONE,
    overlap_hours DECIMAL,
    severity VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        es.id as conflicting_schedule_id,
        GREATEST(es.start_datetime, p_start_datetime) as conflict_start,
        LEAST(es.end_datetime, p_end_datetime) as conflict_end,
        ROUND(
            EXTRACT(EPOCH FROM (
                LEAST(es.end_datetime, p_end_datetime) - 
                GREATEST(es.start_datetime, p_start_datetime)
            )) / 3600.0, 2
        ) as overlap_hours,
        CASE 
            WHEN (es.start_datetime < p_end_datetime AND es.end_datetime > p_start_datetime) THEN 'error'::VARCHAR(20)
            WHEN (es.end_datetime = p_start_datetime OR es.start_datetime = p_end_datetime) THEN 'warning'::VARCHAR(20)
            ELSE 'info'::VARCHAR(20)
        END as severity
    FROM equipment_schedules es
    WHERE es.equipment_id = p_equipment_id
        AND es.status IN ('scheduled', 'active')
        AND (p_exclude_schedule_id IS NULL OR es.id != p_exclude_schedule_id)
        AND (
            -- Direct overlap
            (es.start_datetime < p_end_datetime AND es.end_datetime > p_start_datetime)
            OR
            -- Adjacent schedules (within 1 hour)
            (ABS(EXTRACT(EPOCH FROM (es.end_datetime - p_start_datetime))) <= 3600)
            OR 
            (ABS(EXTRACT(EPOCH FROM (es.start_datetime - p_end_datetime))) <= 3600)
        );
END;
$$ LANGUAGE plpgsql;

-- Function to get equipment availability in a date range
CREATE OR REPLACE FUNCTION get_equipment_availability(
    p_equipment_id INTEGER,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    time_slot_start TIMESTAMP WITH TIME ZONE,
    time_slot_end TIMESTAMP WITH TIME ZONE,
    duration_hours DECIMAL,
    slot_type VARCHAR(20)
) AS $$
DECLARE
    current_slot_time TIMESTAMP WITH TIME ZONE := p_start_date;
    schedule_record RECORD;
BEGIN
    -- Get all schedules in the date range, ordered by start time
    FOR schedule_record IN 
        SELECT start_datetime, end_datetime 
        FROM equipment_schedules 
        WHERE equipment_id = p_equipment_id
        AND status IN ('scheduled', 'active')
        AND start_datetime < p_end_date
        AND end_datetime > p_start_date
        ORDER BY start_datetime
    LOOP
        -- If there's a gap before this schedule
        IF current_slot_time < schedule_record.start_datetime THEN
            RETURN QUERY SELECT 
                current_slot_time,
                schedule_record.start_datetime,
                ROUND(EXTRACT(EPOCH FROM (schedule_record.start_datetime - current_slot_time)) / 3600.0, 2),
                'available'::VARCHAR(20);
        END IF;
        
        -- Mark the scheduled time as occupied
        RETURN QUERY SELECT 
            GREATEST(current_slot_time, schedule_record.start_datetime),
            schedule_record.end_datetime,
            ROUND(EXTRACT(EPOCH FROM (
                schedule_record.end_datetime - GREATEST(current_slot_time, schedule_record.start_datetime)
            )) / 3600.0, 2),
            'scheduled'::VARCHAR(20);
        
        -- Move current_slot_time past this schedule
        current_slot_time := GREATEST(current_slot_time, schedule_record.end_datetime);
    END LOOP;
    
    -- Check for availability after the last schedule
    IF current_slot_time < p_end_date THEN
        RETURN QUERY SELECT 
            current_slot_time,
            p_end_date,
            ROUND(EXTRACT(EPOCH FROM (p_end_date - current_slot_time)) / 3600.0, 2),
            'available'::VARCHAR(20);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update equipment status when schedules change
CREATE OR REPLACE FUNCTION update_equipment_status_from_schedule()
RETURNS TRIGGER AS $$
BEGIN
    -- Update equipment status based on current schedules
    UPDATE equipment 
    SET status = CASE 
        WHEN EXISTS (
            SELECT 1 FROM equipment_schedules 
            WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
            AND status = 'active'
            AND start_datetime <= CURRENT_TIMESTAMP 
            AND end_datetime >= CURRENT_TIMESTAMP
        ) THEN 'in_use'
        WHEN EXISTS (
            SELECT 1 FROM equipment_schedules 
            WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
            AND status = 'scheduled'
            AND start_datetime > CURRENT_TIMESTAMP
        ) THEN 'available'
        ELSE 'available'
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.equipment_id, OLD.equipment_id)
    AND status NOT IN ('maintenance', 'retired', 'out_of_order');
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_schedule_status_update
    AFTER INSERT OR UPDATE OR DELETE ON equipment_schedules
    FOR EACH ROW EXECUTE FUNCTION update_equipment_status_from_schedule();

-- Create some sample projects for testing
INSERT INTO projects (
    company_id, name, description, project_code, client_name,
    start_date, end_date, status, priority, specifications
) VALUES 
(
    1,
    'Highway 101 Expansion',
    'Major highway expansion project involving road widening and infrastructure improvements',
    'HWY101-2024',
    'State Department of Transportation',
    '2024-01-15',
    '2024-12-31',
    'active',
    'high',
    '{"scope": "road_expansion", "lanes": 6, "length_km": 25}'
),
(
    1,
    'Downtown Bridge Repair',
    'Emergency repair and reinforcement of downtown bridge structure',
    'DBR-2024-001',
    'City Engineering Department',
    '2024-02-01',
    '2024-06-30',
    'active',
    'urgent',
    '{"scope": "bridge_repair", "bridge_type": "concrete", "repair_type": "structural"}'
),
(
    1,
    'Industrial Park Access Road',
    'Construction of new access road to industrial park development',
    'IPAR-2024-002',
    'Industrial Development Corp',
    '2024-03-01',
    '2024-08-15',
    'planning',
    'medium',
    '{"scope": "new_construction", "road_length_km": 5.2, "surface_type": "asphalt"}'
) ON CONFLICT (project_code) DO NOTHING;

-- Create some sample equipment schedules for testing
INSERT INTO equipment_schedules (
    equipment_id, project_id, start_datetime, end_datetime, 
    status, notes, created_by
) VALUES
-- Schedule the CAT 320 Excavator for the highway project
(
    1, 1, 
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    CURRENT_TIMESTAMP + INTERVAL '8 days',
    'scheduled',
    'Primary excavation work for highway expansion',
    1
),
-- Schedule the Volvo A40G Hauler for the bridge project
(
    2, 2,
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    'scheduled',
    'Material transport for bridge repair',
    1
),
-- Schedule the CAT 924K Loader for industrial park project
(
    3, 3,
    CURRENT_TIMESTAMP + INTERVAL '1 week',
    CURRENT_TIMESTAMP + INTERVAL '2 weeks',
    'scheduled',
    'Site preparation and material handling',
    1
);

-- Summary: Equipment Scheduling System Ready
-- Features implemented:
-- 1. Equipment schedules table with constraints
-- 2. Conflict detection function
-- 3. Availability calculation function  
-- 4. Equipment status auto-update triggers
-- 5. Sample projects and schedules for testing
-- 6. Performance indexes for fast queries
