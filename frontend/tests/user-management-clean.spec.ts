import { test, expect } from '@playwright/test';

test.describe('User Management Module', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the user management page
    await page.goto('http://localhost:3000/users');
  });

  test('should display user management page with proper layout', async ({
    page,
  }) => {
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Bitcorp ERP/);

    // Check for the main heading
    await expect(
      page.getByRole('heading', { name: 'User Management' })
    ).toBeVisible();

    // Check for the back to dashboard button
    await expect(
      page.getByRole('button', { name: /back to dashboard/i })
    ).toBeVisible();

    // Check for the search functionality
    await expect(page.getByPlaceholder(/search users/i)).toBeVisible();

    // Check for the add user button (should be visible for admin)
    await expect(page.getByRole('button', { name: /add user/i })).toBeVisible();
  });

  test('should display user table with mock data', async ({ page }) => {
    // Wait for the table to load
    await expect(page.locator('table')).toBeVisible();

    // Check table headers
    await expect(
      page.getByRole('columnheader', { name: 'Name' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Email' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Role' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Status' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Last Login' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Actions' })
    ).toBeVisible();

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
  test('should show appropriate UI elements for admin users', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/users');

    // Admin should see add user button
    await expect(page.getByRole('button', { name: /add user/i })).toBeVisible();
  });
});
