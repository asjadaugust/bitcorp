import { test, expect } from '@playwright/test';

test.describe('User Management Page', () => {
  test('should display user management interface', async ({ page }) => {
    // Navigate directly to user management page
    await page.goto('http://localhost:3000/users');

    // Check if we're on the user management page
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('[aria-label="breadcrumb"]')).toContainText(
      'User Management'
    );

    // Check main elements are visible
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

    // Check Add User button is present
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
    await expect(page.locator('.MuiChip-root:has-text("admin")')).toBeVisible();
    await expect(
      page.locator('.MuiChip-root:has-text("operator")')
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

    // Verify the search input works
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
  });

  test('should navigate via breadcrumb', async ({ page }) => {
    await page.goto('http://localhost:3000/users');

    // Click dashboard breadcrumb
    await page.click('[aria-label="breadcrumb"] a:has-text("Dashboard")');

    // Should navigate to dashboard
    await page.waitForURL('**/dashboard');
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

  test('should display correct user statistics', async ({ page }) => {
    await page.goto('http://localhost:3000/users');

    // Check that statistics are correctly calculated
    await expect(
      page.locator('text=Total Users').locator('..').locator('h3:has-text("2")')
    ).toBeVisible();
    await expect(
      page
        .locator('text=Active Users')
        .locator('..')
        .locator('h3:has-text("2")')
    ).toBeVisible();
    await expect(
      page.locator('text=Operators').locator('..').locator('h3:has-text("1")')
    ).toBeVisible();
    await expect(
      page.locator('text=Admins').locator('..').locator('h3:has-text("1")')
    ).toBeVisible();
  });
});

test.describe('User Management Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to user management
    await page.goto('http://localhost:3000/users');

    // Check main elements are still visible on mobile
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('table')).toBeVisible();

    // Check that stats cards stack properly on mobile
    const statsCards = page.locator('.MuiCard-root');
    await expect(statsCards).toHaveCount(4);
  });
});

test.describe('User Management Performance', () => {
  test('should load user management page quickly', async ({ page }) => {
    // Measure navigation time to user management
    const startTime = Date.now();
    await page.goto('http://localhost:3000/users');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within reasonable time (less than 5 seconds)
    expect(loadTime).toBeLessThan(5000);

    // Check that page is fully loaded
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('table')).toBeVisible();
  });
});
