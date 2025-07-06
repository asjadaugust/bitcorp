# Comprehensive Testing Strategy

## Overview

This testing strategy document outlines our approach to ensuring code quality, reliability, and maintainability for the Bitcorp ERP system. It is based on industry best practices from "Clean Code", "Refactoring" by Martin Fowler, and modern testing methodologies.

## Testing Philosophy

### Core Principles

1. **Test-Driven Development (TDD)**: Write tests before implementation
2. **Test Pyramid**: Emphasize unit tests, support with integration tests, validate with E2E tests
3. **Fail Fast**: Tests should fail quickly and provide clear feedback
4. **Test Independence**: Each test should be isolated and independent
5. **Maintainable Tests**: Tests should be as clean and maintainable as production code

### Testing Goals

- **Quality Assurance**: Prevent bugs from reaching production
- **Regression Prevention**: Ensure new changes don't break existing functionality
- **Documentation**: Tests serve as living documentation of system behavior
- **Confidence**: Enable safe refactoring and feature development
- **Performance**: Validate system performance under various conditions

## Test Pyramid Structure

### Unit Tests (70%)

Focus on testing individual functions, methods, and classes in isolation.

#### Backend Unit Tests

```python
# tests/unit/test_equipment_service.py

import pytest
from unittest.mock import Mock, patch
from app.services.equipment_service import EquipmentService
from app.models.equipment import Equipment
from app.schemas.equipment import EquipmentCreate

class TestEquipmentService:
    def setup_method(self):
        self.mock_db = Mock()
        self.service = EquipmentService(self.mock_db)
    
    def test_create_equipment_success(self):
        """Test successful equipment creation"""
        # Arrange
        equipment_data = EquipmentCreate(
            name="Test Excavator",
            serial_number="TEST-001",
            cost=100000.00,
            category="excavator"
        )
        
        mock_equipment = Equipment(
            id="eq_123",
            name="Test Excavator",
            serial_number="TEST-001",
            cost=100000.00,
            category="excavator"
        )
        
        self.mock_db.add.return_value = None
        self.mock_db.commit.return_value = None
        self.mock_db.refresh.return_value = None
        
        # Act
        result = self.service.create_equipment(equipment_data, "user_123")
        
        # Assert
        assert result.name == "Test Excavator"
        assert result.serial_number == "TEST-001"
        assert result.cost == 100000.00
        self.mock_db.add.assert_called_once()
        self.mock_db.commit.assert_called_once()
    
    def test_create_equipment_duplicate_serial_number(self):
        """Test equipment creation with duplicate serial number"""
        # Arrange
        equipment_data = EquipmentCreate(
            name="Test Excavator",
            serial_number="EXISTING-001",
            cost=100000.00,
            category="excavator"
        )
        
        self.service.get_equipment_by_serial = Mock(
            return_value=Mock(id="existing_eq")
        )
        
        # Act & Assert
        with pytest.raises(ValueError, match="Serial number already exists"):
            self.service.create_equipment(equipment_data, "user_123")
    
    @patch('app.services.equipment_service.datetime')
    def test_calculate_next_maintenance_date(self, mock_datetime):
        """Test maintenance date calculation"""
        # Arrange
        mock_datetime.utcnow.return_value = datetime(2024, 1, 15)
        equipment = Equipment(
            last_maintenance=datetime(2024, 1, 1),
            maintenance_interval_days=30
        )
        
        # Act
        next_date = self.service.calculate_next_maintenance_date(equipment)
        
        # Assert
        expected_date = datetime(2024, 1, 31)
        assert next_date == expected_date
    
    def test_get_equipment_statistics(self):
        """Test equipment statistics calculation"""
        # Arrange
        mock_equipment_list = [
            Mock(status="active", cost=100000),
            Mock(status="active", cost=150000),
            Mock(status="maintenance", cost=200000),
            Mock(status="retired", cost=50000)
        ]
        
        self.service.get_all_equipment = Mock(return_value=mock_equipment_list)
        
        # Act
        stats = self.service.get_equipment_statistics("user_123")
        
        # Assert
        assert stats["total_count"] == 4
        assert stats["active_count"] == 2
        assert stats["maintenance_count"] == 1
        assert stats["retired_count"] == 1
        assert stats["total_value"] == 500000
        assert stats["average_value"] == 125000
```

#### Frontend Unit Tests

```typescript
// frontend/src/components/__tests__/EquipmentCard.test.tsx

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import EquipmentCard from '../EquipmentCard'
import { Equipment } from '../../types/equipment'

const theme = createTheme()

const mockEquipment: Equipment = {
  id: 'eq_123',
  name: 'Test Excavator',
  serialNumber: 'TEST-001',
  status: 'active',
  cost: 100000,
  category: 'excavator',
  location: 'Site A',
  assignedOperator: {
    id: 'op_123',
    name: 'John Operator',
    email: 'john@example.com'
  }
}

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('EquipmentCard', () => {
  it('renders equipment information correctly', () => {
    const onSelect = jest.fn()
    
    renderWithTheme(
      <EquipmentCard equipment={mockEquipment} onSelect={onSelect} />
    )
    
    expect(screen.getByText('Test Excavator')).toBeInTheDocument()
    expect(screen.getByText('TEST-001')).toBeInTheDocument()
    expect(screen.getByText('$100,000')).toBeInTheDocument()
    expect(screen.getByText('John Operator')).toBeInTheDocument()
  })
  
  it('shows correct status chip color', () => {
    const onSelect = jest.fn()
    
    renderWithTheme(
      <EquipmentCard equipment={mockEquipment} onSelect={onSelect} />
    )
    
    const statusChip = screen.getByText('active')
    expect(statusChip).toHaveClass('MuiChip-colorSuccess')
  })
  
  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn()
    
    renderWithTheme(
      <EquipmentCard equipment={mockEquipment} onSelect={onSelect} />
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(mockEquipment)
  })
  
  it('handles missing operator gracefully', () => {
    const equipmentWithoutOperator = {
      ...mockEquipment,
      assignedOperator: null
    }
    const onSelect = jest.fn()
    
    renderWithTheme(
      <EquipmentCard equipment={equipmentWithoutOperator} onSelect={onSelect} />
    )
    
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })
})
```

### Integration Tests (20%)

Test the interaction between different components and services.

#### Backend Integration Tests

```python
# tests/integration/test_equipment_api.py

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import get_db, Base
from app.core.security import create_access_token

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

class TestEquipmentAPI:
    def setup_method(self):
        Base.metadata.create_all(bind=engine)
        
        # Create test user and get auth token
        self.test_user = self.create_test_user()
        self.auth_headers = {
            "Authorization": f"Bearer {create_access_token(self.test_user.id)}"
        }
    
    def teardown_method(self):
        Base.metadata.drop_all(bind=engine)
    
    def create_test_user(self):
        """Create a test user for authentication"""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "password": "testpassword123"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 201
        return response.json()["data"]["user"]
    
    def test_create_and_get_equipment(self):
        """Test complete equipment creation and retrieval flow"""
        # Create equipment
        equipment_data = {
            "name": "Integration Test Excavator",
            "serial_number": "INT-TEST-001",
            "category": "excavator",
            "cost": 150000.00,
            "manufacturer": "TestCorp",
            "model": "TX-100"
        }
        
        create_response = client.post(
            "/api/v1/equipment",
            json=equipment_data,
            headers=self.auth_headers
        )
        
        assert create_response.status_code == 201
        created_equipment = create_response.json()["data"]["equipment"]
        
        # Verify creation
        assert created_equipment["name"] == equipment_data["name"]
        assert created_equipment["serial_number"] == equipment_data["serial_number"]
        equipment_id = created_equipment["id"]
        
        # Get equipment by ID
        get_response = client.get(
            f"/api/v1/equipment/{equipment_id}",
            headers=self.auth_headers
        )
        
        assert get_response.status_code == 200
        retrieved_equipment = get_response.json()["data"]["equipment"]
        assert retrieved_equipment["id"] == equipment_id
        assert retrieved_equipment["name"] == equipment_data["name"]
        
        # Get equipment list
        list_response = client.get(
            "/api/v1/equipment",
            headers=self.auth_headers
        )
        
        assert list_response.status_code == 200
        equipment_list = list_response.json()["data"]
        assert len(equipment_list) == 1
        assert equipment_list[0]["id"] == equipment_id
    
    def test_equipment_update_workflow(self):
        """Test equipment update operations"""
        # Create equipment first
        equipment_data = {
            "name": "Update Test Equipment",
            "serial_number": "UPD-TEST-001",
            "category": "bulldozer",
            "cost": 200000.00
        }
        
        create_response = client.post(
            "/api/v1/equipment",
            json=equipment_data,
            headers=self.auth_headers
        )
        
        equipment_id = create_response.json()["data"]["equipment"]["id"]
        
        # Update equipment
        update_data = {
            "name": "Updated Equipment Name",
            "status": "maintenance",
            "location": "Maintenance Yard"
        }
        
        update_response = client.put(
            f"/api/v1/equipment/{equipment_id}",
            json=update_data,
            headers=self.auth_headers
        )
        
        assert update_response.status_code == 200
        updated_equipment = update_response.json()["data"]["equipment"]
        
        assert updated_equipment["name"] == update_data["name"]
        assert updated_equipment["status"] == update_data["status"]
        assert updated_equipment["location"] == update_data["location"]
        
        # Verify unchanged fields
        assert updated_equipment["serial_number"] == equipment_data["serial_number"]
        assert updated_equipment["cost"] == equipment_data["cost"]
    
    def test_equipment_search_and_filtering(self):
        """Test search and filtering functionality"""
        # Create multiple equipment items
        equipment_items = [
            {
                "name": "Excavator Alpha",
                "serial_number": "EXC-001",
                "category": "excavator",
                "status": "active",
                "cost": 100000.00
            },
            {
                "name": "Bulldozer Beta",
                "serial_number": "BUL-001",
                "category": "bulldozer",
                "status": "maintenance",
                "cost": 150000.00
            },
            {
                "name": "Excavator Gamma",
                "serial_number": "EXC-002",
                "category": "excavator",
                "status": "active",
                "cost": 120000.00
            }
        ]
        
        for equipment_data in equipment_items:
            client.post(
                "/api/v1/equipment",
                json=equipment_data,
                headers=self.auth_headers
            )
        
        # Test search by name
        search_response = client.get(
            "/api/v1/equipment?search=Excavator",
            headers=self.auth_headers
        )
        
        assert search_response.status_code == 200
        search_results = search_response.json()["data"]
        assert len(search_results) == 2
        
        # Test filter by category
        category_response = client.get(
            "/api/v1/equipment?category=bulldozer",
            headers=self.auth_headers
        )
        
        assert category_response.status_code == 200
        category_results = category_response.json()["data"]
        assert len(category_results) == 1
        assert category_results[0]["category"] == "bulldozer"
        
        # Test filter by status
        status_response = client.get(
            "/api/v1/equipment?status=active",
            headers=self.auth_headers
        )
        
        assert status_response.status_code == 200
        status_results = status_response.json()["data"]
        assert len(status_results) == 2
        assert all(item["status"] == "active" for item in status_results)
```

#### Frontend Integration Tests

```typescript
// frontend/src/__tests__/EquipmentManagement.integration.test.tsx

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EquipmentManagement from '../pages/EquipmentManagement'
import { equipmentAPI } from '../services/api'

// Mock API
jest.mock('../services/api')
const mockEquipmentAPI = equipmentAPI as jest.Mocked<typeof equipmentAPI>

const theme = createTheme()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('Equipment Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('loads and displays equipment list', async () => {
    const mockEquipment = [
      {
        id: 'eq_1',
        name: 'Excavator 1',
        serialNumber: 'EXC-001',
        status: 'active',
        cost: 100000,
        category: 'excavator'
      },
      {
        id: 'eq_2',
        name: 'Bulldozer 1',
        serialNumber: 'BUL-001',
        status: 'maintenance',
        cost: 150000,
        category: 'bulldozer'
      }
    ]
    
    mockEquipmentAPI.getEquipment.mockResolvedValue({
      data: mockEquipment,
      pagination: {
        current_page: 1,
        per_page: 20,
        total_items: 2,
        total_pages: 1,
        has_next: false,
        has_previous: false
      }
    })
    
    render(<EquipmentManagement />, { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(screen.getByText('Excavator 1')).toBeInTheDocument()
      expect(screen.getByText('Bulldozer 1')).toBeInTheDocument()
    })
    
    expect(mockEquipmentAPI.getEquipment).toHaveBeenCalledWith({
      page: 1,
      per_page: 20
    })
  })
  
  it('creates new equipment through form submission', async () => {
    mockEquipmentAPI.getEquipment.mockResolvedValue({
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      }
    })
    
    const newEquipment = {
      id: 'eq_new',
      name: 'New Excavator',
      serialNumber: 'NEW-001',
      status: 'active',
      cost: 200000,
      category: 'excavator'
    }
    
    mockEquipmentAPI.createEquipment.mockResolvedValue(newEquipment)
    
    render(<EquipmentManagement />, { wrapper: createWrapper() })
    
    // Open create form
    fireEvent.click(screen.getByText('Add Equipment'))
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Equipment Name'), {
      target: { value: 'New Excavator' }
    })
    fireEvent.change(screen.getByLabelText('Serial Number'), {
      target: { value: 'NEW-001' }
    })
    fireEvent.change(screen.getByLabelText('Cost'), {
      target: { value: '200000' }
    })
    
    // Submit form
    fireEvent.click(screen.getByText('Create Equipment'))
    
    await waitFor(() => {
      expect(mockEquipmentAPI.createEquipment).toHaveBeenCalledWith({
        name: 'New Excavator',
        serial_number: 'NEW-001',
        cost: 200000,
        category: 'excavator'
      })
    })
  })
  
  it('filters equipment by search term', async () => {
    const allEquipment = [
      { id: 'eq_1', name: 'Excavator Alpha', serialNumber: 'EXC-001' },
      { id: 'eq_2', name: 'Bulldozer Beta', serialNumber: 'BUL-001' },
      { id: 'eq_3', name: 'Excavator Gamma', serialNumber: 'EXC-002' }
    ]
    
    const filteredEquipment = [
      { id: 'eq_1', name: 'Excavator Alpha', serialNumber: 'EXC-001' },
      { id: 'eq_3', name: 'Excavator Gamma', serialNumber: 'EXC-002' }
    ]
    
    mockEquipmentAPI.getEquipment
      .mockResolvedValueOnce({ data: allEquipment, pagination: {} })
      .mockResolvedValueOnce({ data: filteredEquipment, pagination: {} })
    
    render(<EquipmentManagement />, { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(screen.getByText('Excavator Alpha')).toBeInTheDocument()
      expect(screen.getByText('Bulldozer Beta')).toBeInTheDocument()
    })
    
    // Search for "Excavator"
    fireEvent.change(screen.getByPlaceholderText('Search equipment...'), {
      target: { value: 'Excavator' }
    })
    
    await waitFor(() => {
      expect(mockEquipmentAPI.getEquipment).toHaveBeenCalledWith({
        page: 1,
        per_page: 20,
        search: 'Excavator'
      })
    })
  })
})
```

### End-to-End Tests (10%)

Test complete user workflows from the UI perspective.

#### E2E Tests with Playwright

```typescript
// tests/e2e/equipment-management.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Equipment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[data-testid=username]', 'test@example.com')
    await page.fill('[data-testid=password]', 'testpassword123')
    await page.click('[data-testid=login-button]')
    await expect(page).toHaveURL('/dashboard')
  })
  
  test('complete equipment creation workflow', async ({ page }) => {
    // Navigate to equipment page
    await page.click('[data-testid=nav-equipment]')
    await expect(page).toHaveURL('/equipment')
    
    // Open create equipment dialog
    await page.click('[data-testid=add-equipment-button]')
    await expect(page.locator('[data-testid=create-equipment-dialog]')).toBeVisible()
    
    // Fill equipment form
    await page.fill('[data-testid=equipment-name]', 'E2E Test Excavator')
    await page.fill('[data-testid=serial-number]', 'E2E-001')
    await page.selectOption('[data-testid=category]', 'excavator')
    await page.fill('[data-testid=cost]', '150000')
    await page.fill('[data-testid=manufacturer]', 'TestCorp')
    await page.fill('[data-testid=model]', 'TX-150')
    
    // Submit form
    await page.click('[data-testid=create-equipment-submit]')
    
    // Verify success
    await expect(page.locator('[data-testid=success-message]')).toBeVisible()
    await expect(page.locator('text=E2E Test Excavator')).toBeVisible()
    
    // Verify equipment appears in list
    const equipmentCard = page.locator('[data-testid=equipment-card]').filter({
      hasText: 'E2E Test Excavator'
    })
    await expect(equipmentCard).toBeVisible()
    await expect(equipmentCard.locator('text=E2E-001')).toBeVisible()
    await expect(equipmentCard.locator('text=$150,000')).toBeVisible()
  })
  
  test('equipment search and filtering', async ({ page }) => {
    await page.goto('/equipment')
    
    // Wait for equipment list to load
    await expect(page.locator('[data-testid=equipment-list]')).toBeVisible()
    
    // Test search functionality
    await page.fill('[data-testid=search-input]', 'Excavator')
    await page.waitForTimeout(500) // Debounce delay
    
    // Verify filtered results
    const searchResults = page.locator('[data-testid=equipment-card]')
    await expect(searchResults).toHaveCount(2)
    
    // Test category filter
    await page.selectOption('[data-testid=category-filter]', 'bulldozer')
    await expect(searchResults).toHaveCount(0) // No bulldozers matching "Excavator"
    
    // Clear search
    await page.fill('[data-testid=search-input]', '')
    await expect(searchResults).toHaveCount(1) // Only bulldozers
    
    // Clear filters
    await page.selectOption('[data-testid=category-filter]', 'all')
    await expect(searchResults.count()).toBeGreaterThan(1)
  })
  
  test('equipment detail view and editing', async ({ page }) => {
    await page.goto('/equipment')
    
    // Click on first equipment item
    await page.click('[data-testid=equipment-card]:first-child')
    
    // Verify detail page
    await expect(page).toHaveURL(/\/equipment\/eq_/)
    await expect(page.locator('[data-testid=equipment-detail]')).toBeVisible()
    
    // Edit equipment
    await page.click('[data-testid=edit-equipment-button]')
    await page.fill('[data-testid=equipment-name]', 'Updated Equipment Name')
    await page.selectOption('[data-testid=status]', 'maintenance')
    await page.click('[data-testid=save-changes-button]')
    
    // Verify changes
    await expect(page.locator('text=Updated Equipment Name')).toBeVisible()
    await expect(page.locator('[data-testid=status-chip]')).toHaveText('maintenance')
    
    // Navigate back to list
    await page.click('[data-testid=back-to-list-button]')
    await expect(page).toHaveURL('/equipment')
    
    // Verify changes persist in list view
    await expect(page.locator('text=Updated Equipment Name')).toBeVisible()
  })
  
  test('maintenance record management', async ({ page }) => {
    await page.goto('/equipment')
    await page.click('[data-testid=equipment-card]:first-child')
    
    // Navigate to maintenance tab
    await page.click('[data-testid=maintenance-tab]')
    
    // Add new maintenance record
    await page.click('[data-testid=add-maintenance-button]')
    await page.selectOption('[data-testid=maintenance-type]', 'preventive')
    await page.fill('[data-testid=maintenance-description]', 'Regular service')
    await page.fill('[data-testid=maintenance-cost]', '1200')
    await page.click('[data-testid=save-maintenance-button]')
    
    // Verify maintenance record appears
    await expect(page.locator('text=Regular service')).toBeVisible()
    await expect(page.locator('text=$1,200')).toBeVisible()
    
    // Verify maintenance affects equipment status
    await page.click('[data-testid=overview-tab]')
    await expect(page.locator('[data-testid=last-maintenance]')).toContainText('Regular service')
  })
})
```

## Performance Testing

### Load Testing with Locust

```python
# tests/performance/locustfile.py

from locust import HttpUser, task, between
import json
import random

class EquipmentManagementUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login and get authentication token"""
        response = self.client.post("/api/v1/auth/login", json={
            "username": "loadtest@example.com",
            "password": "loadtestpassword"
        })
        
        if response.status_code == 200:
            self.token = response.json()["data"]["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.token = None
            self.headers = {}
    
    @task(5)
    def view_equipment_list(self):
        """Most common operation - viewing equipment list"""
        self.client.get(
            "/api/v1/equipment",
            headers=self.headers,
            params={
                "page": random.randint(1, 10),
                "per_page": 20
            }
        )
    
    @task(3)
    def search_equipment(self):
        """Search for equipment"""
        search_terms = ["excavator", "bulldozer", "CAT", "2024"]
        search_term = random.choice(search_terms)
        
        self.client.get(
            "/api/v1/equipment",
            headers=self.headers,
            params={
                "search": search_term,
                "page": 1,
                "per_page": 20
            }
        )
    
    @task(2)
    def view_equipment_detail(self):
        """View detailed equipment information"""
        # Get equipment list first
        response = self.client.get(
            "/api/v1/equipment",
            headers=self.headers,
            params={"page": 1, "per_page": 5}
        )
        
        if response.status_code == 200:
            equipment_list = response.json()["data"]
            if equipment_list:
                equipment_id = random.choice(equipment_list)["id"]
                self.client.get(
                    f"/api/v1/equipment/{equipment_id}",
                    headers=self.headers
                )
    
    @task(1)
    def create_equipment(self):
        """Create new equipment (less frequent operation)"""
        equipment_data = {
            "name": f"Load Test Equipment {random.randint(1000, 9999)}",
            "serial_number": f"LT-{random.randint(1000, 9999)}",
            "category": random.choice(["excavator", "bulldozer", "crane"]),
            "cost": random.randint(50000, 500000),
            "manufacturer": random.choice(["Caterpillar", "Komatsu", "Volvo"]),
            "model": f"Model-{random.randint(100, 999)}"
        }
        
        self.client.post(
            "/api/v1/equipment",
            headers=self.headers,
            json=equipment_data
        )
    
    @task(1)
    def get_reports(self):
        """Generate equipment reports"""
        self.client.get(
            "/api/v1/reports/equipment-utilization",
            headers=self.headers,
            params={
                "date_from": "2024-01-01",
                "date_to": "2024-01-31"
            }
        )

class WebSocketUser(HttpUser):
    """Test WebSocket connections for real-time updates"""
    
    def on_start(self):
        self.connect_websocket()
    
    def connect_websocket(self):
        """Connect to WebSocket for real-time updates"""
        # Note: Locust WebSocket support requires locust-plugins
        pass
    
    @task
    def send_heartbeat(self):
        """Send periodic heartbeat"""
        pass
```

## Test Data Management

### Test Fixtures and Factories

```python
# tests/fixtures/equipment_factory.py

import factory
from datetime import datetime, timedelta
from app.models.equipment import Equipment
from app.models.user import User

class UserFactory(factory.Factory):
    class Meta:
        model = User
    
    id = factory.Sequence(lambda n: f"user_{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.first_name.lower()}.{obj.last_name.lower()}@example.com")
    username = factory.LazyAttribute(lambda obj: f"{obj.first_name.lower()}{obj.last_name.lower()}")
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    role = "operator"
    is_active = True
    created_at = factory.LazyFunction(datetime.utcnow)

class EquipmentFactory(factory.Factory):
    class Meta:
        model = Equipment
    
    id = factory.Sequence(lambda n: f"eq_{n}")
    name = factory.Faker('bs')
    serial_number = factory.Sequence(lambda n: f"SN-{n:04d}")
    category = factory.Iterator(["excavator", "bulldozer", "crane", "loader"])
    status = factory.Iterator(["active", "maintenance", "retired"])
    cost = factory.Faker('pydecimal', left_digits=6, right_digits=2, positive=True)
    manufacturer = factory.Iterator(["Caterpillar", "Komatsu", "Volvo", "John Deere"])
    model = factory.Faker('bothify', text='Model-####')
    year = factory.Faker('year')
    purchase_date = factory.Faker('date_between', start_date='-5y', end_date='today')
    location = factory.Faker('city')
    user_id = factory.SubFactory(UserFactory)
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = factory.LazyFunction(datetime.utcnow)

# Usage in tests
def test_equipment_creation():
    equipment = EquipmentFactory()
    assert equipment.name is not None
    assert equipment.serial_number.startswith('SN-')
    assert equipment.category in ["excavator", "bulldozer", "crane", "loader"]

def test_create_multiple_equipment():
    equipment_list = EquipmentFactory.build_batch(10)
    assert len(equipment_list) == 10
    assert all(eq.name for eq in equipment_list)
```

### Database Test Setup

```python
# tests/conftest.py

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db, Base
from tests.fixtures.equipment_factory import UserFactory, EquipmentFactory

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_engine():
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=db_engine
    )
    session = TestingSessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    user = UserFactory()
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_equipment(db_session, test_user):
    equipment = EquipmentFactory(user_id=test_user.id)
    db_session.add(equipment)
    db_session.commit()
    db_session.refresh(equipment)
    return equipment

@pytest.fixture
def auth_headers(test_user):
    from app.core.security import create_access_token
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}
```

## CI/CD Testing Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml

name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      
      - name: Run unit tests
        run: |
          cd backend
          pytest tests/unit/ -v --cov=app --cov-report=xml
      
      - name: Run integration tests
        run: |
          cd backend
          pytest tests/integration/ -v
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml
  
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run unit tests
        run: |
          cd frontend
          npm run test -- --coverage --watchAll=false
      
      - name: Run type checking
        run: |
          cd frontend
          npm run type-check
      
      - name: Run linting
        run: |
          cd frontend
          npm run lint
  
  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Playwright
        run: |
          npm install -g @playwright/test
          playwright install
      
      - name: Start services
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 30  # Wait for services to be ready
      
      - name: Run E2E tests
        run: |
          cd tests/e2e
          playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: tests/e2e/playwright-report/
  
  performance-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Locust
        run: pip install locust
      
      - name: Start services
        run: docker-compose -f docker-compose.test.yml up -d
      
      - name: Run performance tests
        run: |
          cd tests/performance
          locust -f locustfile.py --headless -u 50 -r 5 -t 300s --host http://localhost:8000
```

## Test Quality Metrics

### Coverage Requirements

- **Unit Test Coverage**: Minimum 90%
- **Integration Test Coverage**: Minimum 80%
- **Critical Path Coverage**: 100%

### Performance Benchmarks

- **API Response Time**: < 200ms for 95th percentile
- **Database Query Time**: < 100ms for simple queries
- **Frontend Load Time**: < 3 seconds for initial load
- **Memory Usage**: < 512MB for backend services

### Test Execution Times

- **Unit Tests**: < 2 minutes
- **Integration Tests**: < 10 minutes
- **E2E Tests**: < 30 minutes
- **Performance Tests**: < 15 minutes

This comprehensive testing strategy ensures high code quality, prevents regressions, and maintains system reliability while supporting rapid development and deployment cycles.
