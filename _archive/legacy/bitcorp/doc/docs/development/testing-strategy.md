# Testing Strategy for Bitcorp ERP

> Based on testing best practices, Test-Driven Development (TDD), and modern testing patterns

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Pyramid](#testing-pyramid)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Data Management](#test-data-management)
- [Performance Testing](#performance-testing)
- [Testing Infrastructure](#testing-infrastructure)

## Testing Philosophy

### Core Principles

1. **Confidence Over Coverage**: Tests should give confidence in the system's behavior
2. **Fast Feedback**: Tests should run quickly to enable rapid development
3. **Maintainable**: Tests should be easy to understand and modify
4. **Reliable**: Tests should be deterministic and not flaky
5. **User-Focused**: Tests should verify user-facing behavior

### Test-Driven Development (TDD)

```python
# Example TDD cycle for equipment service

# 1. RED: Write failing test
def test_create_equipment_with_valid_data():
    """Test creating equipment with valid data should succeed."""
    # Arrange
    equipment_data = {
        "name": "Excavator CAT 320",
        "serial_number": "EQ-2023-CT-123456",
        "purchase_price": Decimal("125000.00"),
        "company_id": "test-company-id"
    }
    
    # Act
    result = equipment_service.create_equipment(equipment_data)
    
    # Assert
    assert result.id is not None
    assert result.name == equipment_data["name"]
    assert result.serial_number == equipment_data["serial_number"]
    assert result.status == EquipmentStatus.ACTIVE

# 2. GREEN: Implement minimal code to pass
class EquipmentService:
    def create_equipment(self, data: dict) -> Equipment:
        equipment = Equipment(**data)
        equipment.id = str(uuid.uuid4())
        equipment.status = EquipmentStatus.ACTIVE
        db.session.add(equipment)
        db.session.commit()
        return equipment

# 3. REFACTOR: Improve implementation while keeping tests green
```

## Testing Pyramid

### Distribution

```text
    /\
   /  \     E2E Tests (10%)
  /____\    - Critical user journeys
 /      \   
/________\   Integration Tests (20%)
           - API endpoints
           - Database interactions
           
____________  Unit Tests (70%)
           - Business logic
           - Individual functions
           - Component behavior
```

## Unit Testing

### Backend Unit Tests (Python/FastAPI)

```python
# conftest.py - Test configuration
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock

from app.main import app
from app.core.database import Base, get_db
from app.core.auth import get_current_user
from app.models import User, Company, Equipment

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with dependency overrides."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def mock_user():
    """Create a mock authenticated user."""
    user = Mock(spec=User)
    user.id = "test-user-id"
    user.email = "test@example.com"
    user.is_active = True
    user.permissions = ["equipment:read", "equipment:write"]
    return user

@pytest.fixture
def authenticated_client(client, mock_user):
    """Create an authenticated test client."""
    app.dependency_overrides[get_current_user] = lambda: mock_user
    yield client
    app.dependency_overrides.clear()

# Test examples
class TestEquipmentService:
    """Test suite for equipment service layer."""
    
    def test_create_equipment_success(self, db_session):
        """Test successful equipment creation."""
        # Arrange
        company = Company(id="test-company", name="Test Company")
        db_session.add(company)
        db_session.commit()
        
        equipment_data = EquipmentCreate(
            name="Test Equipment",
            serial_number="EQ-2023-TE-123456",
            purchase_price=Decimal("50000.00"),
            purchase_date=date.today(),
            company_id=company.id
        )
        
        service = EquipmentService(db_session)
        
        # Act
        result = service.create_equipment(equipment_data)
        
        # Assert
        assert result.id is not None
        assert result.name == equipment_data.name
        assert result.serial_number == equipment_data.serial_number
        assert result.status == EquipmentStatus.ACTIVE
        
        # Verify database persistence
        saved_equipment = db_session.query(Equipment).filter_by(id=result.id).first()
        assert saved_equipment is not None
        assert saved_equipment.name == equipment_data.name

    def test_create_equipment_duplicate_serial_number(self, db_session):
        """Test equipment creation with duplicate serial number fails."""
        # Arrange
        company = Company(id="test-company", name="Test Company")
        existing_equipment = Equipment(
            name="Existing Equipment",
            serial_number="EQ-2023-EX-123456",
            company_id=company.id
        )
        db_session.add_all([company, existing_equipment])
        db_session.commit()
        
        equipment_data = EquipmentCreate(
            name="New Equipment",
            serial_number="EQ-2023-EX-123456",  # Duplicate
            purchase_price=Decimal("50000.00"),
            purchase_date=date.today(),
            company_id=company.id
        )
        
        service = EquipmentService(db_session)
        
        # Act & Assert
        with pytest.raises(EquipmentValidationError) as exc_info:
            service.create_equipment(equipment_data)
        
        assert "serial number already exists" in str(exc_info.value)

    @pytest.mark.parametrize("invalid_serial", [
        "invalid-format",
        "EQ-ABCD-XX-123456",  # Invalid year
        "EQ-2023-123-456789",  # Invalid format
        "",
        None
    ])
    def test_create_equipment_invalid_serial_number(self, db_session, invalid_serial):
        """Test equipment creation with invalid serial numbers."""
        # Arrange
        company = Company(id="test-company", name="Test Company")
        db_session.add(company)
        db_session.commit()
        
        equipment_data = EquipmentCreate(
            name="Test Equipment",
            serial_number=invalid_serial,
            purchase_price=Decimal("50000.00"),
            purchase_date=date.today(),
            company_id=company.id
        )
        
        service = EquipmentService(db_session)
        
        # Act & Assert
        with pytest.raises(EquipmentValidationError):
            service.create_equipment(equipment_data)

class TestEquipmentAPI:
    """Test suite for equipment API endpoints."""
    
    def test_get_equipment_list_success(self, authenticated_client, db_session):
        """Test successful equipment list retrieval."""
        # Arrange
        company = Company(id="test-company", name="Test Company")
        equipment1 = Equipment(name="Equipment 1", company_id=company.id)
        equipment2 = Equipment(name="Equipment 2", company_id=company.id)
        
        db_session.add_all([company, equipment1, equipment2])
        db_session.commit()
        
        # Act
        response = authenticated_client.get("/api/v1/equipment")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 2

    def test_get_equipment_list_with_filters(self, authenticated_client, db_session):
        """Test equipment list with status filter."""
        # Arrange
        company = Company(id="test-company", name="Test Company")
        active_equipment = Equipment(
            name="Active Equipment", 
            status=EquipmentStatus.ACTIVE,
            company_id=company.id
        )
        maintenance_equipment = Equipment(
            name="Maintenance Equipment", 
            status=EquipmentStatus.MAINTENANCE,
            company_id=company.id
        )
        
        db_session.add_all([company, active_equipment, maintenance_equipment])
        db_session.commit()
        
        # Act
        response = authenticated_client.get(
            "/api/v1/equipment", 
            params={"status": "active"}
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["status"] == "active"

    def test_create_equipment_unauthorized(self, client):
        """Test equipment creation without authentication fails."""
        # Arrange
        equipment_data = {
            "name": "Test Equipment",
            "serial_number": "EQ-2023-TE-123456",
            "purchase_price": "50000.00"
        }
        
        # Act
        response = client.post("/api/v1/equipment", json=equipment_data)
        
        # Assert
        assert response.status_code == 401
```

### Frontend Unit Tests (React/TypeScript)

```typescript
// components/equipment/__tests__/EquipmentCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';

import { EquipmentCard } from '../EquipmentCard';
import { mockEquipment } from '../../../__mocks__/equipment';
import { theme } from '../../../styles/theme';

// Test utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('EquipmentCard', () => {
  const mockProps = {
    equipment: mockEquipment,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders equipment information correctly', () => {
    renderWithProviders(<EquipmentCard {...mockProps} />);
    
    expect(screen.getByText(mockEquipment.name)).toBeInTheDocument();
    expect(screen.getByText(`Serial: ${mockEquipment.serialNumber}`)).toBeInTheDocument();
    expect(screen.getByText(mockEquipment.status)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EquipmentCard {...mockProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockEquipment.id);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EquipmentCard {...mockProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockEquipment.id);
  });

  it('expands details when expand button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EquipmentCard {...mockProps} />);
    
    // Initially collapsed
    expect(screen.queryByText(mockEquipment.description)).not.toBeInTheDocument();
    
    const expandButton = screen.getByRole('button', { name: /expand/i });
    await user.click(expandButton);
    
    // Now expanded
    await waitFor(() => {
      expect(screen.getByText(mockEquipment.description)).toBeInTheDocument();
    });
  });

  it('displays correct status color for active equipment', () => {
    const activeEquipment = { ...mockEquipment, status: 'active' as const };
    renderWithProviders(
      <EquipmentCard {...mockProps} equipment={activeEquipment} />
    );
    
    const statusChip = screen.getByText('active');
    expect(statusChip).toHaveClass('MuiChip-colorSuccess');
  });
});

// hooks/__tests__/useEquipment.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { useEquipment } from '../useEquipment';
import { api } from '../../lib/api';
import { mockEquipmentList } from '../../__mocks__/equipment';

// Mock API
jest.mock('../../lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useEquipment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches equipment list successfully', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { items: mockEquipmentList, total: 2 }
    });

    const { result } = renderHook(() => useEquipment(), {
      wrapper: createWrapper()
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.equipment).toEqual(mockEquipmentList);
    expect(result.current.error).toBeNull();
  });

  it('handles equipment creation', async () => {
    const newEquipment = mockEquipmentList[0];
    
    mockedApi.get.mockResolvedValueOnce({
      data: { items: [], total: 0 }
    });
    mockedApi.post.mockResolvedValueOnce({
      data: newEquipment
    });

    const { result } = renderHook(() => useEquipment(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createEquipment({
        name: newEquipment.name,
        serialNumber: newEquipment.serialNumber,
        purchasePrice: newEquipment.purchasePrice,
        companyId: newEquipment.companyId
      });
    });

    expect(result.current.equipment).toContainEqual(newEquipment);
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch equipment';
    mockedApi.get.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useEquipment(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.equipment).toEqual([]);
  });
});
```

## Integration Testing

### API Integration Tests

```python
# tests/integration/test_equipment_api.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models import User, Company, Equipment
from app.core.auth import create_access_token

class TestEquipmentIntegration:
    """Integration tests for equipment API with real database interactions."""
    
    @pytest.fixture(autouse=True)
    def setup_data(self, db_session: Session):
        """Set up test data for each test."""
        # Create test company
        self.company = Company(
            id="test-company-id",
            name="Test Company",
            email="test@company.com"
        )
        
        # Create test user
        self.user = User(
            id="test-user-id",
            email="test@user.com",
            username="testuser",
            hashed_password="hashed_password",
            is_active=True
        )
        
        # Create test equipment
        self.equipment = Equipment(
            id="test-equipment-id",
            name="Test Equipment",
            serial_number="EQ-2023-TE-123456",
            purchase_price=Decimal("50000.00"),
            company_id=self.company.id,
            created_by=self.user.id
        )
        
        db_session.add_all([self.company, self.user, self.equipment])
        db_session.commit()
        
        # Create authentication token
        self.access_token = create_access_token(
            data={"sub": self.user.id, "permissions": ["equipment:read", "equipment:write"]}
        )
        self.headers = {"Authorization": f"Bearer {self.access_token}"}

    def test_equipment_crud_workflow(self, client: TestClient):
        """Test complete equipment CRUD workflow."""
        
        # 1. Create equipment
        create_data = {
            "name": "New Equipment",
            "serial_number": "EQ-2023-NE-654321",
            "purchase_price": "75000.00",
            "purchase_date": "2023-01-15",
            "company_id": self.company.id
        }
        
        create_response = client.post(
            "/api/v1/equipment",
            json=create_data,
            headers=self.headers
        )
        assert create_response.status_code == 201
        created_equipment = create_response.json()
        equipment_id = created_equipment["id"]
        
        # 2. Read equipment
        get_response = client.get(
            f"/api/v1/equipment/{equipment_id}",
            headers=self.headers
        )
        assert get_response.status_code == 200
        retrieved_equipment = get_response.json()
        assert retrieved_equipment["name"] == create_data["name"]
        
        # 3. Update equipment
        update_data = {
            "name": "Updated Equipment Name",
            "status": "maintenance"
        }
        
        update_response = client.put(
            f"/api/v1/equipment/{equipment_id}",
            json=update_data,
            headers=self.headers
        )
        assert update_response.status_code == 200
        updated_equipment = update_response.json()
        assert updated_equipment["name"] == update_data["name"]
        assert updated_equipment["status"] == update_data["status"]
        
        # 4. List equipment (should include updated item)
        list_response = client.get(
            "/api/v1/equipment",
            headers=self.headers
        )
        assert list_response.status_code == 200
        equipment_list = list_response.json()
        assert equipment_list["total"] >= 1
        
        # Find our updated equipment in the list
        updated_in_list = next(
            (eq for eq in equipment_list["items"] if eq["id"] == equipment_id),
            None
        )
        assert updated_in_list is not None
        assert updated_in_list["name"] == update_data["name"]
        
        # 5. Delete equipment
        delete_response = client.delete(
            f"/api/v1/equipment/{equipment_id}",
            headers=self.headers
        )
        assert delete_response.status_code == 204
        
        # 6. Verify deletion
        get_deleted_response = client.get(
            f"/api/v1/equipment/{equipment_id}",
            headers=self.headers
        )
        assert get_deleted_response.status_code == 404

    def test_equipment_filtering_and_pagination(self, client: TestClient, db_session: Session):
        """Test equipment filtering and pagination."""
        
        # Create additional test equipment
        equipment_data = [
            {
                "name": "Active Equipment 1",
                "serial_number": "EQ-2023-AE-111111",
                "status": EquipmentStatus.ACTIVE,
                "company_id": self.company.id
            },
            {
                "name": "Active Equipment 2", 
                "serial_number": "EQ-2023-AE-222222",
                "status": EquipmentStatus.ACTIVE,
                "company_id": self.company.id
            },
            {
                "name": "Maintenance Equipment",
                "serial_number": "EQ-2023-ME-333333", 
                "status": EquipmentStatus.MAINTENANCE,
                "company_id": self.company.id
            }
        ]
        
        for data in equipment_data:
            equipment = Equipment(**data)
            db_session.add(equipment)
        db_session.commit()
        
        # Test status filtering
        response = client.get(
            "/api/v1/equipment",
            params={"status": "active"},
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert all(eq["status"] == "active" for eq in data["items"])
        
        # Test pagination
        response = client.get(
            "/api/v1/equipment",
            params={"limit": 2, "skip": 0},
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 2
        
        # Test search
        response = client.get(
            "/api/v1/equipment",
            params={"search": "Active"},
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert all("Active" in eq["name"] for eq in data["items"])
```

## End-to-End Testing

### Playwright E2E Tests

```typescript
// tests/e2e/equipment.spec.ts
import { test, expect, Page } from '@playwright/test';

test.describe('Equipment Management', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin@bitcorp.com');
    await page.fill('[data-testid="password"]', 'admin123!');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display equipment list', async () => {
    await page.goto('/equipment');
    
    // Wait for equipment list to load
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    
    // Check if equipment cards are displayed
    const equipmentCards = page.locator('[data-testid="equipment-card"]');
    await expect(equipmentCards.first()).toBeVisible();
  });

  test('should create new equipment', async () => {
    await page.goto('/equipment');
    
    // Click create button
    await page.click('[data-testid="create-equipment-button"]');
    
    // Fill equipment form
    await page.fill('[data-testid="equipment-name"]', 'Test Equipment E2E');
    await page.fill('[data-testid="equipment-serial"]', 'EQ-2023-E2-999999');
    await page.fill('[data-testid="equipment-price"]', '100000');
    await page.fill('[data-testid="equipment-purchase-date"]', '2023-01-15');
    
    // Submit form
    await page.click('[data-testid="submit-equipment"]');
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify equipment appears in list
    await expect(page.locator('text=Test Equipment E2E')).toBeVisible();
  });

  test('should edit equipment', async () => {
    await page.goto('/equipment');
    
    // Click on first equipment card
    const firstEquipment = page.locator('[data-testid="equipment-card"]').first();
    await firstEquipment.click();
    
    // Click edit button
    await page.click('[data-testid="edit-equipment-button"]');
    
    // Update name
    await page.fill('[data-testid="equipment-name"]', 'Updated Equipment Name');
    
    // Submit form
    await page.click('[data-testid="submit-equipment"]');
    
    // Verify update
    await expect(page.locator('text=Updated Equipment Name')).toBeVisible();
  });

  test('should filter equipment by status', async () => {
    await page.goto('/equipment');
    
    // Select maintenance filter
    await page.selectOption('[data-testid="status-filter"]', 'maintenance');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check that only maintenance equipment is shown
    const statusBadges = page.locator('[data-testid="equipment-status"]');
    const count = await statusBadges.count();
    
    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toHaveText('maintenance');
    }
  });

  test('should search equipment', async () => {
    await page.goto('/equipment');
    
    // Enter search term
    await page.fill('[data-testid="equipment-search"]', 'Excavator');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify search results
    const equipmentNames = page.locator('[data-testid="equipment-name"]');
    const count = await equipmentNames.count();
    
    for (let i = 0; i < count; i++) {
      const text = await equipmentNames.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('excavator');
    }
  });

  test('should handle equipment deletion', async () => {
    await page.goto('/equipment');
    
    // Get initial count
    const initialCount = await page.locator('[data-testid="equipment-card"]').count();
    
    // Click on first equipment card
    const firstEquipment = page.locator('[data-testid="equipment-card"]').first();
    const equipmentName = await firstEquipment.locator('[data-testid="equipment-name"]').textContent();
    
    await firstEquipment.click();
    
    // Click delete button
    await page.click('[data-testid="delete-equipment-button"]');
    
    // Confirm deletion in modal
    await page.click('[data-testid="confirm-delete"]');
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify equipment is removed from list
    await expect(page.locator(`text=${equipmentName}`)).not.toBeVisible();
    
    // Verify count decreased
    const newCount = await page.locator('[data-testid="equipment-card"]').count();
    expect(newCount).toBe(initialCount - 1);
  });
});
```

## Test Data Management

### Database Test Fixtures

```python
# tests/fixtures/database.py
import pytest
from decimal import Decimal
from datetime import date, datetime
from typing import List

from app.models import Company, User, Equipment, EquipmentCategory

@pytest.fixture
def sample_company(db_session) -> Company:
    """Create a sample company for testing."""
    company = Company(
        id="sample-company-id",
        name="Sample Company Inc.",
        tax_id="12-3456789",
        email="contact@samplecompany.com",
        phone="+1-555-0123",
        address={
            "street": "123 Business Ave",
            "city": "Business City",
            "state": "BC",
            "zip": "12345",
            "country": "US"
        },
        status="active"
    )
    db_session.add(company)
    db_session.commit()
    return company

@pytest.fixture
def sample_users(db_session, sample_company) -> List[User]:
    """Create sample users for testing."""
    users = [
        User(
            id="admin-user-id",
            email="admin@samplecompany.com",
            username="admin",
            first_name="Admin",
            last_name="User",
            hashed_password="hashed_admin_password",
            is_active=True,
            is_superuser=True
        ),
        User(
            id="manager-user-id", 
            email="manager@samplecompany.com",
            username="manager",
            first_name="Manager",
            last_name="User",
            hashed_password="hashed_manager_password",
            is_active=True,
            is_superuser=False
        ),
        User(
            id="operator-user-id",
            email="operator@samplecompany.com", 
            username="operator",
            first_name="Operator",
            last_name="User",
            hashed_password="hashed_operator_password",
            is_active=True,
            is_superuser=False
        )
    ]
    
    db_session.add_all(users)
    db_session.commit()
    return users

@pytest.fixture
def equipment_categories(db_session) -> List[EquipmentCategory]:
    """Create sample equipment categories."""
    categories = [
        EquipmentCategory(
            id="heavy-machinery-id",
            name="Heavy Machinery",
            description="Large construction equipment"
        ),
        EquipmentCategory(
            id="vehicles-id",
            name="Vehicles", 
            description="Transportation vehicles"
        ),
        EquipmentCategory(
            id="tools-id",
            name="Tools",
            description="Hand and power tools"
        )
    ]
    
    db_session.add_all(categories)
    db_session.commit()
    return categories

@pytest.fixture
def sample_equipment(db_session, sample_company, equipment_categories) -> List[Equipment]:
    """Create sample equipment for testing."""
    equipment = [
        Equipment(
            id="excavator-001-id",
            name="CAT 320 Excavator",
            description="20-ton hydraulic excavator",
            serial_number="EQ-2023-EX-001001",
            model="320",
            manufacturer="Caterpillar",
            purchase_date=date(2023, 1, 15),
            purchase_price=Decimal("250000.00"),
            current_value=Decimal("220000.00"),
            status="active",
            location="Construction Site A",
            company_id=sample_company.id,
            category_id=equipment_categories[0].id  # Heavy Machinery
        ),
        Equipment(
            id="truck-001-id",
            name="Ford F-150 Pickup",
            description="Heavy-duty pickup truck",
            serial_number="EQ-2023-TR-001001",
            model="F-150",
            manufacturer="Ford",
            purchase_date=date(2023, 2, 20),
            purchase_price=Decimal("45000.00"),
            current_value=Decimal("42000.00"),
            status="active",
            location="Office Parking",
            company_id=sample_company.id,
            category_id=equipment_categories[1].id  # Vehicles
        ),
        Equipment(
            id="drill-001-id",
            name="DeWalt Impact Drill",
            description="Professional cordless impact drill",
            serial_number="EQ-2023-DR-001001",
            model="DCD771C2",
            manufacturer="DeWalt",
            purchase_date=date(2023, 3, 10),
            purchase_price=Decimal("150.00"),
            current_value=Decimal("120.00"),
            status="maintenance",
            location="Tool Storage",
            company_id=sample_company.id,
            category_id=equipment_categories[2].id  # Tools
        )
    ]
    
    db_session.add_all(equipment)
    db_session.commit()
    return equipment
```

### Frontend Test Data

```typescript
// src/__mocks__/equipment.ts
import { Equipment, EquipmentStatus } from '../types/equipment';

export const mockEquipment: Equipment = {
  id: 'test-equipment-id',
  name: 'Test Equipment',
  description: 'This is a test equipment description',
  serialNumber: 'EQ-2023-TE-123456',
  model: 'TEST-MODEL',
  manufacturer: 'Test Manufacturer',
  purchaseDate: '2023-01-15',
  purchasePrice: 50000,
  currentValue: 45000,
  status: EquipmentStatus.ACTIVE,
  location: 'Test Location',
  companyId: 'test-company-id',
  categoryId: 'test-category-id',
  createdAt: '2023-01-15T00:00:00Z',
  updatedAt: '2023-01-15T00:00:00Z'
};

export const mockEquipmentList: Equipment[] = [
  mockEquipment,
  {
    ...mockEquipment,
    id: 'test-equipment-2',
    name: 'Test Equipment 2',
    serialNumber: 'EQ-2023-TE-654321',
    status: EquipmentStatus.MAINTENANCE
  }
];

// Test data factory functions
export const createMockEquipment = (overrides: Partial<Equipment> = {}): Equipment => ({
  ...mockEquipment,
  ...overrides,
  id: overrides.id || `test-equipment-${Date.now()}`
});

export const createMockEquipmentList = (count: number): Equipment[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockEquipment({
      id: `test-equipment-${index}`,
      name: `Test Equipment ${index + 1}`,
      serialNumber: `EQ-2023-TE-${String(index + 1).padStart(6, '0')}`
    })
  );
};
```

## Performance Testing

### Load Testing with Locust

```python
# tests/performance/locustfile.py
from locust import HttpUser, task, between
import json
import random

class EquipmentAPIUser(HttpUser):
    wait_time = between(1, 5)
    
    def on_start(self):
        """Login and get access token."""
        response = self.client.post("/api/v1/auth/login", json={
            "username": "test@user.com",
            "password": "testpassword"
        })
        
        if response.status_code == 200:
            self.access_token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.access_token}"}
        else:
            raise Exception("Failed to login")

    @task(3)
    def get_equipment_list(self):
        """Test equipment list endpoint - most common operation."""
        params = {
            "limit": random.randint(10, 50),
            "skip": random.randint(0, 100)
        }
        
        response = self.client.get(
            "/api/v1/equipment",
            params=params,
            headers=self.headers,
            name="GET /equipment (list)"
        )
        
        if response.status_code != 200:
            print(f"Equipment list failed: {response.status_code}")

    @task(2)
    def get_equipment_detail(self):
        """Test equipment detail endpoint."""
        # Assume we have equipment IDs from previous requests
        equipment_id = f"test-equipment-{random.randint(1, 100)}"
        
        response = self.client.get(
            f"/api/v1/equipment/{equipment_id}",
            headers=self.headers,
            name="GET /equipment/{id} (detail)"
        )
        
        # 404s are expected for random IDs, so don't fail the test
        if response.status_code not in [200, 404]:
            print(f"Equipment detail failed: {response.status_code}")

    @task(1)
    def create_equipment(self):
        """Test equipment creation - less frequent operation."""
        equipment_data = {
            "name": f"Load Test Equipment {random.randint(1, 10000)}",
            "serial_number": f"EQ-2023-LT-{random.randint(100000, 999999)}",
            "purchase_price": f"{random.randint(10000, 100000)}.00",
            "purchase_date": "2023-01-15",
            "company_id": "test-company-id"
        }
        
        response = self.client.post(
            "/api/v1/equipment",
            json=equipment_data,
            headers=self.headers,
            name="POST /equipment (create)"
        )
        
        if response.status_code != 201:
            print(f"Equipment creation failed: {response.status_code}")

    @task(1)
    def search_equipment(self):
        """Test equipment search functionality."""
        search_terms = ["CAT", "Ford", "DeWalt", "Excavator", "Truck"]
        search_term = random.choice(search_terms)
        
        params = {"search": search_term}
        
        response = self.client.get(
            "/api/v1/equipment",
            params=params,
            headers=self.headers,
            name="GET /equipment (search)"
        )
        
        if response.status_code != 200:
            print(f"Equipment search failed: {response.status_code}")

class WebUser(HttpUser):
    """Simulate frontend user behavior."""
    wait_time = between(2, 8)
    
    @task
    def browse_equipment(self):
        """Simulate user browsing equipment pages."""
        
        # Load main equipment page
        self.client.get("/equipment", name="GET /equipment (page)")
        
        # Simulate some time reading the page
        self.wait()
        
        # Load equipment details
        self.client.get("/equipment/some-id", name="GET /equipment/detail (page)")

# Run with: locust -f locustfile.py --host=http://localhost:8000
```

## Testing Infrastructure

### CI/CD Pipeline Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bitcorp_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run unit tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bitcorp_test
      run: |
        cd backend
        pytest tests/unit/ -v --cov=app --cov-report=xml
    
    - name: Run integration tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bitcorp_test
      run: |
        cd backend
        pytest tests/integration/ -v
    
    - name: Upload coverage
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
        npm run test:unit -- --coverage
    
    - name: Run component tests
      run: |
        cd frontend
        npm run test:components
    
    - name: Build application
      run: |
        cd frontend
        npm run build

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install Playwright
      run: |
        cd frontend
        npm ci
        npx playwright install
    
    - name: Start application
      run: |
        docker-compose up -d
        sleep 30  # Wait for services to start
    
    - name: Run E2E tests
      run: |
        cd frontend
        npm run test:e2e
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: frontend/playwright-report/
```

---

*This testing strategy should be continuously refined based on project needs and testing feedback.*
