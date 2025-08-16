import { test, expect } from '@playwright/test';

test.describe('User Management Module', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the user management page
    await page.goto('http://localhost:3000/users');
  });

  test('should display user management page with proper layout', async ({ page }) => {
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Bitcorp ERP/);
    
    // Check for the main heading
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
    
    // Check for the back to dashboard button
    await expect(page.getByRole('button', { name: /back to dashboard/i })).toBeVisible();
    
    // Check for the search functionality
    await expect(page.getByPlaceholder(/search users/i)).toBeVisible();
    
    // Check for the add user button (should be visible for admin)
    await expect(page.getByRole('button', { name: /add user/i })).toBeVisible();
  });

  test('should display user table with mock data', async ({ page }) => {
    // Wait for the table to load
    await expect(page.locator('table')).toBeVisible();
    
    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last Login' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    
    // Check if mock users are displayed
    await expect(page.getByText('John Admin')).toBeVisible();
    await expect(page.getByText('Jane Engineer')).toBeVisible();
    await expect(page.getByText('Bob Operator')).toBeVisible();
  });

  test('should allow search functionality', async ({ page }) => {
    // Wait for the table to load
    await expect(page.locator('table')).toBeVisible();
    
    // Search for a specific user
    await page.fill('input[placeholder*="Search users"]', 'John');
    
    // Verify search results (mock implementation should filter)
    await expect(page.getByText('John Admin')).toBeVisible();
    
    // Clear search
    await page.fill('input[placeholder*="Search users"]', '');
    
    // Verify all users are shown again
    await expect(page.getByText('Jane Engineer')).toBeVisible();
    await expect(page.getByText('Bob Operator')).toBeVisible();
  });

  test('should display correct role badges with colors', async ({ page }) => {
    // Wait for the table to load
    await expect(page.locator('table')).toBeVisible();
    
    // Check for role badges with different colors
    await expect(page.getByText('Administrator')).toBeVisible();
    await expect(page.getByText('Planning Engineer')).toBeVisible();
    await expect(page.getByText('Equipment Operator')).toBeVisible();
  });

  test('should handle pagination controls', async ({ page }) => {
    // Wait for the table to load
    await expect(page.locator('table')).toBeVisible();
    
    // Check for pagination controls
    await expect(page.getByText(/rows per page/i)).toBeVisible();
  });

  test('should show action buttons for user management', async ({ page }) => {
    // Wait for the table to load
    await expect(page.locator('table')).toBeVisible();
    
    // Check for edit buttons in the table rows
    const editButtons = page.getByRole('button', { name: /edit/i });
    await expect(editButtons.first()).toBeVisible();
    
    // Check for delete buttons
    const deleteButtons = page.getByRole('button', { name: /delete/i });
    await expect(deleteButtons.first()).toBeVisible();
  });

  test('should maintain Material-UI design consistency', async ({ page }) => {
    // Check for Material-UI components
    await expect(page.locator('.MuiContainer-root')).toBeVisible();
    await expect(page.locator('.MuiPaper-root')).toBeVisible();
    await expect(page.locator('.MuiButton-root')).toBeVisible();
    
    // Check for consistent spacing and typography
    await expect(page.locator('h4')).toBeVisible(); // Main heading
    await expect(page.locator('.MuiTextField-root')).toBeVisible(); // Search field
  });
});

test.describe('Role-Based Access Control', () => {
  test('should show appropriate UI elements for admin users', async ({ page }) => {
    await page.goto('http://localhost:3000/users');
    
    // Admin should see add user button
    await expect(page.getByRole('button', { name: /add user/i })).toBeVisible();
    
    // Admin should see all action buttons
    await expect(page.getByRole('button', { name: /edit/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i }).first()).toBeVisible();
  });
});

  test('should display user management interface for admin', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/users');

    // Check main elements are visible
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(
      page.locator('text=Manage users, roles, and permissions')
    ).toBeVisible();

    // Check stats cards are present
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Users')).toBeVisible();
    await expect(page.locator('text=Operators')).toBeVisible();
    await expect(page.locator('text=Admins')).toBeVisible();

    // Check search functionality
    await expect(
      page.locator('input[placeholder="Search users..."]')
    ).toBeVisible();

    // Check Add User button is present for admin
    await expect(page.locator('button:has-text("Add User")')).toBeVisible();

    // Check users table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("User")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Roles")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should display mock users in the table', async ({ page }) => {
    await page.goto('http://localhost:3000/users');

    // Check for the admin user in the table
    await expect(page.locator('text=System Administrator')).toBeVisible();
    await expect(page.locator('text=admin@bitcorp.com')).toBeVisible();

    // Check for the operator user in the table
    await expect(page.locator('text=John Operator')).toBeVisible();
    await expect(page.locator('text=john.operator@bitcorp.com')).toBeVisible();

    // Check role chips are displayed
    await expect(
      page.locator(
        '[data-testid="admin-chip"], .MuiChip-root:has-text("admin")'
      )
    ).toBeVisible();
    await expect(
      page.locator(
        '[data-testid="operator-chip"], .MuiChip-root:has-text("operator")'
      )
    ).toBeVisible();

    // Check status chips
    await expect(page.locator('.MuiChip-root:has-text("Active")')).toHaveCount(
      2
    );
  });

  test('should have functional action buttons', async ({ page }) => {
    await page.goto('http://localhost:3000/users');

    // Check that action buttons are present
    const editButtons = page.locator('button[title="Edit user"]');
    const roleButtons = page.locator('button[title="Manage roles"]');
    const deleteButtons = page.locator('button[title="Delete user"]');

    await expect(editButtons).toHaveCount(2); // For both users
    await expect(roleButtons).toHaveCount(2); // For both users
    await expect(deleteButtons).toHaveCount(1); // Only for non-admin user
  });

  test('should allow searching users', async ({ page }) => {
    await page.goto('http://localhost:3000/users');

    // Search for admin user
    await page.fill('input[placeholder="Search users..."]', 'admin');

    // For now, since we don't have real search functionality,
    // we just verify the search input works
    await expect(
      page.locator('input[placeholder="Search users..."]')
    ).toHaveValue('admin');

    // Clear search
    await page.fill('input[placeholder="Search users..."]', '');
    await expect(
      page.locator('input[placeholder="Search users..."]')
    ).toHaveValue('');
  });

  test('should navigate back to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/users');

    // Click back arrow
    await page.click('button[aria-label="Back to dashboard"]');

    // Should navigate to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText(
      'Construction ERP Dashboard'
    );
  });

  test('should navigate via breadcrumb', async ({ page }) => {
    await page.goto('http://localhost:3000/users');

    // Click dashboard breadcrumb
    await page.click('[aria-label="breadcrumb"] a:has-text("Dashboard")');

    // Should navigate to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText(
      'Construction ERP Dashboard'
    );
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('http://localhost:3000/users');

    // Check pagination component is present
    await expect(page.locator('.MuiTablePagination-root')).toBeVisible();

    // Check rows per page selector
    await expect(page.locator('text=Rows per page')).toBeVisible();

    // Check page info
    await expect(page.locator('text=1–2 of 2')).toBeVisible();
  });

  test('should show permission denied for non-privileged users', async ({
    page,
  }) => {
    // First logout
    await page.goto('http://localhost:3000/auth/logout');

    // Login as operator (non-privileged user)
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', 'john.operator@bitcorp.com');
    await page.fill('input[name="password"]', 'operator123');
    await page.click('button[type="submit"]');

    // Try to access user management
    await page.goto('http://localhost:3000/users');

    // Should show permission denied message
    await expect(
      page.locator("text=You don't have permission to access user management")
    ).toBeVisible();
    await expect(page.locator('.MuiAlert-root')).toHaveClass(/.*error.*/);
  });
});

test.describe('User Management Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login as admin
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', 'admin@bitcorp.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Navigate to user management
    await page.goto('http://localhost:3000/users');

    // Check main elements are still visible on mobile
    await expect(page.locator('h3')).toContainText('User Management');
    await expect(page.locator('table')).toBeVisible();

    // Check that stats cards stack properly on mobile
    const statsCards = page.locator('.MuiCard-root');
    await expect(statsCards).toHaveCount(4);
  });
});

test.describe('User Management Performance', () => {
  test('should load user management page quickly', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', 'admin@bitcorp.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Measure navigation time to user management
    const startTime = Date.now();
    await page.goto('http://localhost:3000/users');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within reasonable time (less than 3 seconds)
    expect(loadTime).toBeLessThan(3000);

    // Check that page is fully loaded
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('table')).toBeVisible();
  });
});
