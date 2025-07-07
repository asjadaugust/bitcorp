-- Equipment seed data for Bitcorp ERP
-- This script populates the database with realistic construction equipment data

-- Clear existing data (optional)
-- DELETE FROM equipment WHERE company_id = 1;

-- Insert comprehensive equipment data
INSERT INTO equipment (
    name, model, brand, equipment_type, serial_number, year_manufactured,
    purchase_cost, current_value, hourly_rate, fuel_type, fuel_capacity,
    status, hourmeter_reading, odometer_reading, images, notes, company_id, specifications,
    created_at, updated_at, is_active
) VALUES 
-- CAT 320 Hydraulic Excavator
(
    'CAT 320 Hydraulic Excavator',
    '320',
    'Caterpillar',
    'excavator',
    'CAT320-2024-001',
    2024,
    350000.00,
    320000.00,
    150.00,
    'diesel',
    400.0,
    'available',
    245,
    NULL,
    '[]',
    'Primary excavator for foundation and utility work',
    1,
    '{"operating_weight": "20,300 kg", "engine_power": "122 kW", "bucket_capacity": "1.0 m³", "max_digging_depth": "6.7 m"}',
    NOW(),
    NOW(),
    true
),

-- John Deere 850K Bulldozer
-- John Deere 850K Bulldozer
(
    'John Deere 850K Bulldozer',
    '850K',
    'John Deere',
    'bulldozer',
    'JD850K-2023-102',
    2023,
    485000.00,
    445000.00,
    180.00,
    'diesel',
    520.0,
    'in_use',
    1247,
    NULL,
    '[]',
    'Heavy-duty dozer for site preparation and grading',
    1,
    '{"operating_weight": "18,370 kg", "engine_power": "149 kW", "blade_capacity": "3.8 m³", "max_blade_height": "0.98 m"}',
    NOW(),
    NOW(),
    true
),

-- Liebherr LTM 1070-4.2 Mobile Crane
(
    'Liebherr LTM 1070-4.2 Mobile Crane',
    'LTM 1070-4.2',
    'Liebherr',
    'crane',
    'LH1070-2022-078',
    2022,
    750000.00,
    680000.00,
    275.00,
    'diesel',
    350.0,
    'maintenance',
    2156,
    45230,
    '[]',
    'All-terrain mobile crane, annual safety inspection due',
    1,
    '{"max_lifting_capacity": "70 tonnes", "boom_length": "50 m", "max_reach": "46 m", "travel_speed": "85 km/h"}',
    NOW(),
    NOW(),
    true
),

-- CAT 924K Wheel Loader
(
    'CAT 924K Wheel Loader',
    '924K',
    'Caterpillar',
    'loader',
    'CAT924K-2023-215',
    2023,
    285000.00,
    260000.00,
    125.00,
    'diesel',
    280.0,
    'available',
    856,
    NULL,
    '[]',
    'Versatile loader for material handling and loading trucks',
    1,
    '{"operating_weight": "12,770 kg", "engine_power": "129 kW", "bucket_capacity": "2.3 m³", "max_dump_height": "2.8 m"}',
    NOW(),
    NOW(),
    true
),

-- Volvo A40G Articulated Hauler
(
    'Volvo A40G Articulated Hauler',
    'A40G',
    'Volvo',
    'truck',
    'VO-A40G-2024-089',
    2024,
    420000.00,
    395000.00,
    160.00,
    'diesel',
    480.0,
    'available',
    324,
    8950,
    '[]',
    'Heavy-duty hauler for transporting materials across rough terrain',
    1,
    '{"payload_capacity": "37 tonnes", "body_capacity": "24 m³", "max_speed": "55 km/h", "gradeability": "35%"}',
    NOW(),
    NOW(),
    true
),

-- Bomag BW 213 D-5 Soil Compactor
(
    'Bomag BW 213 D-5 Soil Compactor',
    'BW 213 D-5',
    'Bomag',
    'compactor',
    'BM213D5-2023-156',
    2023,
    95000.00,
    85000.00,
    65.00,
    'diesel',
    95.0,
    'available',
    678,
    NULL,
    '[]',
    'Single drum compactor for soil and asphalt compaction',
    1,
    '{"operating_weight": "13,500 kg", "drum_width": "2,130 mm", "compaction_force": "320 kN", "travel_speed": "12 km/h"}',
    NOW(),
    NOW(),
    true
),

-- Genie S-125 Telescopic Boom Lift
(
    'Genie S-125 Telescopic Boom Lift',
    'S-125',
    'Genie',
    'lift',
    'GE-S125-2022-321',
    2022,
    185000.00,
    165000.00,
    85.00,
    'diesel',
    151.0,
    'retired',
    3245,
    NULL,
    '[]',
    'Retired from service due to age, scheduled for auction',
    1,
    '{"max_platform_height": "38.15 m", "max_reach": "24.38 m", "platform_capacity": "340 kg", "platform_size": "2.44 x 1.22 m"}',
    NOW(),
    NOW(),
    true
),

-- Hitachi ZX350LC-6 Excavator
(
    'Hitachi ZX350LC-6 Excavator',
    'ZX350LC-6',
    'Hitachi',
    'excavator',
    'HI-ZX350-2023-467',
    2023,
    385000.00,
    355000.00,
    165.00,
    'diesel',
    450.0,
    'out_of_order',
    987,
    NULL,
    '[]',
    'Hydraulic pump failure - awaiting parts for repair',
    1,
    '{"operating_weight": "34,900 kg", "engine_power": "202 kW", "bucket_capacity": "1.6 m³", "max_digging_depth": "7.2 m"}',
    NOW(),
    NOW(),
    true
),

-- CAT CS54B Vibratory Roller
(
    'CAT CS54B Vibratory Roller',
    'CS54B',
    'Caterpillar',
    'compactor',
    'CAT-CS54B-2024-178',
    2024,
    125000.00,
    115000.00,
    75.00,
    'diesel',
    110.0,
    'available',
    156,
    NULL,
    '[]',
    'New double drum roller for asphalt compaction',
    1,
    '{"operating_weight": "10,500 kg", "drum_width": "1,680 mm", "vibration_frequency": "67 Hz", "travel_speed": "11 km/h"}',
    NOW(),
    NOW(),
    true
),

-- JCB 3CX Backhoe Loader
(
    'JCB 3CX Backhoe Loader',
    '3CX',
    'JCB',
    'loader',
    'JCB-3CX-2023-892',
    2023,
    145000.00,
    135000.00,
    95.00,
    'diesel',
    185.0,
    'in_use',
    1455,
    NULL,
    '[]',
    'Versatile backhoe for utility and small excavation work',
    1,
    '{"operating_weight": "8,200 kg", "engine_power": "74 kW", "loader_capacity": "1.0 m³", "backhoe_capacity": "0.25 m³"}',
    NOW(),
    NOW(),
    true
);

-- Verify the data was inserted
SELECT 
    COUNT(*) as total_equipment,
    status,
    COUNT(*) as count_by_status
FROM equipment 
WHERE company_id = 1
GROUP BY status
ORDER BY status;

-- Show equipment summary
SELECT 
    'Total Equipment' as metric,
    COUNT(*) as value
FROM equipment
WHERE company_id = 1 AND is_active = true
UNION ALL
SELECT 
    'Total Fleet Value',
    ROUND(SUM(current_value), 2)
FROM equipment 
WHERE company_id = 1 AND is_active = true AND current_value IS NOT NULL
UNION ALL
SELECT 
    'Average Hourly Rate',
    ROUND(AVG(hourly_rate), 2)
FROM equipment 
WHERE company_id = 1 AND is_active = true AND hourly_rate IS NOT NULL;

-- Show recent equipment
SELECT 
    name,
    brand,
    equipment_type,
    status,
    hourly_rate
FROM equipment 
WHERE company_id = 1 AND is_active = true
ORDER BY created_at DESC
LIMIT 10;
