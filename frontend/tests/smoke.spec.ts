import { test, expect } from '@playwright/test';

test.describe('Bitcorp ERP - Smoke Tests', () => {
  // Base URL for the application
  const baseUrl = 'http://localhost:3003';

  test.beforeEach(async ({ page }) => {
    // Start from the home page before each test
    await page.goto(baseUrl);
  });

  test('should redirect to login page when not authenticated', async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/en`);

    // Wait for potential redirects
    await page.waitForURL(/.*\/login/);

    // Verify we're on the login page
    expect(page.url()).toContain('/login');

    // Verify login form elements are present
    await expect(
      page.getByRole('textbox', { name: 'Username or Email' })
    ).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should successfully login with admin credentials', async ({ page }) => {
    // Go to login page
    await page.goto(`${baseUrl}/en/login`);

    // Fill in admin credentials
    await page
      .getByRole('textbox', { name: 'Username or Email' })
      .fill('admin@bitcorp.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123!');

    // Click sign in
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect to dashboard
    await page.waitForURL(/.*\/dashboard/);

    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');

    // Verify dashboard elements
    await expect(
      page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible();
    await expect(
      page.getByText('Welcome back, System Administrator')
    ).toBeVisible();
  });

  test('should have uniform AppBar layout across pages', async ({ page }) => {
    // Login first
    await page.goto(`${baseUrl}/en/login`);
    await page
      .getByRole('textbox', { name: 'Username or Email' })
      .fill('admin@bitcorp.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\/dashboard/);

    // Test Equipment Management page
    await page.goto(`${baseUrl}/en/equipment`);
    await expect(
      page.getByRole('heading', { name: 'Equipment Management' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    await expect(page.getByText('Language')).toBeVisible();

    // Test Settings page
    await page.goto(`${baseUrl}/en/settings`);
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    await expect(page.getByText('Language')).toBeVisible();

    // Test Reports page
    await page.goto(`${baseUrl}/en/reports`);
    await expect(
      page.getByRole('heading', { name: 'Reports & Analytics' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    await expect(page.getByText('Language')).toBeVisible();
  });

  test('should load equipment data successfully', async ({ page }) => {
    // Login
    await page.goto(`${baseUrl}/en/login`);
    await page
      .getByRole('textbox', { name: 'Username or Email' })
      .fill('admin@bitcorp.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\/dashboard/);

    // Navigate to equipment page
    await page.goto(`${baseUrl}/en/equipment`);

    // Wait for equipment data to load
    await expect(page.getByText('CAT 320D Excavator')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('JCB 3CX Backhoe')).toBeVisible();
    await expect(page.getByText('Volvo A40F Dump Truck')).toBeVisible();

    // Verify equipment details are displayed
    await expect(page.getByText('Available')).toBeVisible();
    await expect(page.getByText('Maintenance')).toBeVisible();
  });

  test('should switch language successfully', async ({ page }) => {
    // Login
    await page.goto(`${baseUrl}/en/login`);
    await page
      .getByRole('textbox', { name: 'Username or Email' })
      .fill('admin@bitcorp.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\/dashboard/);

    // Verify English is current
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Switch to Spanish
    await page.goto(`${baseUrl}/es/dashboard`);

    // Verify Spanish translations
    await expect(page.getByText('Panel de Control')).toBeVisible();

    // Test Equipment page in Spanish
    await page.goto(`${baseUrl}/es/equipment`);
    await expect(page.getByText('Gestión de Equipos')).toBeVisible();
  });

  test('should display Settings page with all sections', async ({ page }) => {
    // Login
    await page.goto(`${baseUrl}/en/login`);
    await page
      .getByRole('textbox', { name: 'Username or Email' })
      .fill('admin@bitcorp.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\/dashboard/);

    // Navigate to settings
    await page.goto(`${baseUrl}/en/settings`);

    // Verify all settings sections
    await expect(page.getByText('Account Settings')).toBeVisible();
    await expect(page.getByText('Security Settings')).toBeVisible();
    await expect(page.getByText('Notification Settings')).toBeVisible();
    await expect(page.getByText('System Settings')).toBeVisible();
    await expect(page.getByText('System Information')).toBeVisible();

    // Verify form controls
    await expect(
      page.getByRole('textbox', { name: 'Display Name' })
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Email Address' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  test('should display Reports page with analytics data', async ({ page }) => {
    // Login
    await page.goto(`${baseUrl}/en/login`);
    await page
      .getByRole('textbox', { name: 'Username or Email' })
      .fill('admin@bitcorp.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\/dashboard/);

    // Navigate to reports
    await page.goto(`${baseUrl}/en/reports`);

    // Verify reports sections
    await expect(
      page.getByText('Key Performance Indicators (KPIs)')
    ).toBeVisible();
    await expect(
      page.getByText('Equipment Performance Analysis')
    ).toBeVisible();
    await expect(page.getByText('Available Reports')).toBeVisible();

    // Verify KPI metrics
    await expect(page.getByText('Equipment Utilization Rate')).toBeVisible();
    await expect(page.getByText('Cost Savings vs Rental')).toBeVisible();

    // Verify report generation controls
    await expect(
      page.getByRole('button', { name: 'Generate Report' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Export PDF' })
    ).toBeVisible();
  });

  test('should handle navigation between pages', async ({ page }) => {
    // Login
    await page.goto(`${baseUrl}/en/login`);
    await page
      .getByRole('textbox', { name: 'Username or Email' })
      .fill('admin@bitcorp.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/.*\/dashboard/);

    // Navigate through pages
    await page.goto(`${baseUrl}/en/equipment`);
    await expect(page.getByText('Equipment Management')).toBeVisible();

    await page.goto(`${baseUrl}/en/settings`);
    await expect(page.getByText('Settings')).toBeVisible();

    await page.goto(`${baseUrl}/en/reports`);
    await expect(page.getByText('Reports & Analytics')).toBeVisible();

    // Navigate back to dashboard
    await page.goto(`${baseUrl}/en/dashboard`);
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  // Keep simple navigation and responsive checks from other branch as additional smoke tests
  test('basic navigation should work', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);

    // Should have navigation elements
    await expect(page.locator('nav, header, .navigation')).toBeVisible();
  });

  test('responsive design should work on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(baseUrl);

    // Check that page loads properly on mobile
    await expect(page).toHaveTitle(/BitCorp/i);
  });
});
