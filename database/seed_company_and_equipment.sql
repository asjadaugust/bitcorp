-- Create company and equipment seed data for Bitcorp ERP

-- First, create a default company
INSERT INTO companies (
    name, tax_id, address, phone, email, website, 
    settings, is_active, created_at, updated_at
) VALUES (
    'Bitcorp Construction',
    'BC-123456789',
    '123 Construction Ave, City, State 12345',
    '+1-555-0123',
    'info@bitcorp.com',
    'https://bitcorp.com',
    '{}',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Get the company ID (should be 1 if this is the first company)
-- Equipment seed data follows...
