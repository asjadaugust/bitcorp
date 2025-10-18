import { test, expect } from '@playwright/test';

test.describe('System Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Login with admin credentials
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@bitcorp.com');
    await page.fill('input[name="password"]', 'admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should redirect to login when accessing settings without authentication', async ({
    page,
  }) => {
    // Clear authentication and try to access settings
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('http://localhost:3000/settings');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test('should access settings page from dashboard quick action', async ({
    page,
  }) => {
    // Should be on dashboard after login
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible();

    // Click on System Settings quick action
    await page.click('text=System Settings');

    // Should navigate to settings page
    await page.waitForURL('**/settings', { timeout: 10000 });
    await expect(page).toHaveURL(/settings/);
    await expect(
      page.getByRole('heading', { name: /system settings/i })
    ).toBeVisible();
  });

  test('should display system settings page with all tabs', async ({
    page,
  }) => {
    // Navigate to settings page
    await page.goto('http://localhost:3000/settings');

    // Wait for the page to load
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Check page title and breadcrumb
    await expect(
      page.getByRole('heading', { name: 'System Settings' })
    ).toBeVisible();
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('System Settings')).toBeVisible();

    // Check all tabs are present
    await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Equipment' })).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Notifications' })
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Security' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Reports' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'System' })).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Save Changes' })
    ).toBeVisible();
  });

  test('should display general settings by default', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // General tab should be active by default
    await expect(page.getByRole('tab', { name: 'General' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // Check company information section
    await expect(page.getByText('Company Information')).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Company Name' })
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Company Email' })
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Company Phone' })
    ).toBeVisible();

    // Check regional settings section
    await expect(page.getByText('Regional Settings')).toBeVisible();
    await expect(page.getByText('Time Zone')).toBeVisible();
    await expect(page.getByText('Language')).toBeVisible();
    await expect(page.getByText('Currency')).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Switch to Equipment tab
    await page.click('text=Equipment');
    await expect(page.getByRole('tab', { name: 'Equipment' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByText('Equipment Defaults')).toBeVisible();
    await expect(page.getByText('Equipment Features')).toBeVisible();

    // Switch to Notifications tab
    await page.click('text=Notifications');
    await expect(
      page.getByRole('tab', { name: 'Notifications' })
    ).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Notification Channels')).toBeVisible();
    await expect(page.getByText('Alert Types')).toBeVisible();

    // Switch to Security tab
    await page.click('text=Security');
    await expect(page.getByRole('tab', { name: 'Security' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByText('Session Management')).toBeVisible();
    await expect(page.getByText('Authentication')).toBeVisible();

    // Switch to Reports tab
    await page.click('text=Reports');
    await expect(page.getByRole('tab', { name: 'Reports' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByText('Report Defaults')).toBeVisible();
    await expect(page.getByText('Report Generation')).toBeVisible();

    // Switch to System tab
    await page.click('text=System');
    await expect(page.getByRole('tab', { name: 'System' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByText('Backup & Maintenance')).toBeVisible();
    await expect(page.getByText('System Status')).toBeVisible();
  });

  test('should allow editing general settings', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Edit company name
    const companyNameField = page.getByRole('textbox', {
      name: 'Company Name',
    });
    await companyNameField.clear();
    await companyNameField.fill('Updated Bitcorp Construction');

    // Edit company email
    const companyEmailField = page.getByRole('textbox', {
      name: 'Company Email',
    });
    await companyEmailField.clear();
    await companyEmailField.fill('updated@bitcorp.com');

    // Change time zone
    await page.click('text=Time Zone');
    await page.click('text=Pacific Time (PT)');

    // Verify changes are reflected in the form
    await expect(companyNameField).toHaveValue('Updated Bitcorp Construction');
    await expect(companyEmailField).toHaveValue('updated@bitcorp.com');
  });

  test('should handle equipment settings toggles', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Switch to Equipment tab
    await page.click('text=Equipment');

    // Check fuel tracking toggle
    const fuelTrackingToggle = page.locator('input[type="checkbox"]').first();
    const initialState = await fuelTrackingToggle.isChecked();

    // Toggle the switch
    await fuelTrackingToggle.click();
    const newState = await fuelTrackingToggle.isChecked();

    // Verify the state changed
    expect(newState).toBe(!initialState);
  });

  test('should handle save functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Make a change
    const companyNameField = page.getByRole('textbox', {
      name: 'Company Name',
    });
    await companyNameField.clear();
    await companyNameField.fill('Test Company');

    // Click save
    await page.click('button:has-text("Save Changes")');

    // Should show saving state
    await expect(page.getByText('Saving...')).toBeVisible();

    // Should show success message
    await expect(page.getByText('Settings saved successfully')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should handle export functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Set up download handling
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('button:has-text("Export")');

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toMatch(
      /bitcorp-settings-\d{4}-\d{2}-\d{2}\.json/
    );
  });

  test('should handle navigation back to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Click back arrow
    await page.click(
      '[data-testid="ArrowBackIcon"], button:has([data-testid="ArrowBackIcon"])'
    );

    // Should navigate back to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible();
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Click dashboard breadcrumb
    await page.click('text=Dashboard');

    // Should navigate back to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible();
  });

  test('should show system maintenance features in system tab', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Switch to System tab
    await page.click('text=System');

    // Check backup frequency dropdown
    await expect(page.getByText('Backup Frequency')).toBeVisible();

    // Check log retention field
    await expect(
      page.getByRole('textbox', { name: /log retention/i })
    ).toBeVisible();

    // Check backup database button
    await expect(
      page.getByRole('button', { name: 'Backup Database Now' })
    ).toBeVisible();

    // Check maintenance mode toggle
    await expect(page.getByText('Maintenance Mode')).toBeVisible();

    // Check debug mode toggle
    await expect(page.getByText('Debug Mode')).toBeVisible();
  });

  test('should handle backup database functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Switch to System tab
    await page.click('text=System');

    // Set up dialog handler for backup confirmation
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain(
        'Database backup initiated successfully'
      );
      await dialog.accept();
    });

    // Click backup database button
    await page.click('button:has-text("Backup Database Now")');

    // Wait for the operation to complete (mock delay is 2 seconds)
    await page.waitForTimeout(3000);
  });

  test('should display all notification options', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Switch to Notifications tab
    await page.click('text=Notifications');

    // Check notification channel options
    await expect(page.getByText('Email Notifications')).toBeVisible();
    await expect(page.getByText('SMS Notifications')).toBeVisible();
    await expect(page.getByText('Push Notifications')).toBeVisible();

    // Check alert type options
    await expect(page.getByText('Daily Report Reminders')).toBeVisible();
    await expect(page.getByText('Maintenance Alerts')).toBeVisible();
  });

  test('should display security settings correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('h4:has-text("System Settings")', {
      timeout: 10000,
    });

    // Switch to Security tab
    await page.click('text=Security');

    // Check session management fields
    await expect(
      page.getByRole('textbox', { name: /session timeout/i })
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: /password expiration/i })
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: /login attempt limit/i })
    ).toBeVisible();

    // Check two-factor authentication toggle
    await expect(page.getByText('Two-Factor Authentication')).toBeVisible();
  });
});
