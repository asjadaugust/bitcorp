import { test, expect } from '@playwright/test';

test.describe('UI Consistency and Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000/auth/login');

    // Login as admin user
    await page.fill('input[name="email"]', 'admin@bitcorp.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
  });

  test('Dashboard page uses uniform AppBarLayout', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Check for uniform AppBar elements
    await expect(page.locator('header[class*="MuiAppBar"]')).toBeVisible();
    await expect(page.locator('h4:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('[aria-label*="notifications"]')).toBeVisible();
    await expect(
      page.locator('button:has([data-testid="LogoutIcon"])')
    ).toBeVisible();
  });

  test('Settings page has back button and breadcrumbs', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');

    // Check for back button
    const backButton = page.locator(
      'button[aria-label*="Back"], button[aria-label*="Atrás"]'
    );
    await expect(backButton).toBeVisible();

    // Check for breadcrumbs
    await expect(page.locator('[aria-label="breadcrumb"]')).toBeVisible();
    await expect(page.locator('[aria-label="breadcrumb"] a')).toContainText(
      /Dashboard|Panel de Control/
    );

    // Test back button functionality
    await backButton.click();
    await page.waitForURL('**/dashboard');
  });

  test('Equipment page has consistent navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/equipment');

    // Check for uniform AppBar
    await expect(page.locator('header[class*="MuiAppBar"]')).toBeVisible();

    // Check for back button
    const backButton = page.locator(
      'button[aria-label*="Back"], button[aria-label*="Atrás"]'
    );
    await expect(backButton).toBeVisible();

    // Check for breadcrumbs
    await expect(page.locator('[aria-label="breadcrumb"]')).toBeVisible();

    // Test breadcrumb navigation
    await page
      .locator(
        '[aria-label="breadcrumb"] a:has-text(/Dashboard|Panel de Control/)'
      )
      .click();
    await page.waitForURL('**/dashboard');
  });

  test('Reports page has consistent navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/reports');

    // Check for uniform AppBar
    await expect(page.locator('header[class*="MuiAppBar"]')).toBeVisible();

    // Check for back button
    const backButton = page.locator(
      'button[aria-label*="Back"], button[aria-label*="Atrás"]'
    );
    await expect(backButton).toBeVisible();

    // Check for breadcrumbs
    await expect(page.locator('[aria-label="breadcrumb"]')).toBeVisible();
  });

  test('Users page has consistent navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/users');

    // Check for uniform AppBar
    await expect(page.locator('header[class*="MuiAppBar"]')).toBeVisible();

    // Check for back button
    const backButton = page.locator(
      'button[aria-label*="Back"], button[aria-label*="Atrás"]'
    );
    await expect(backButton).toBeVisible();

    // Check for breadcrumbs
    await expect(page.locator('[aria-label="breadcrumb"]')).toBeVisible();

    // Test back button functionality
    await backButton.click();
    await page.waitForURL('**/dashboard');
  });

  test('IoT page has consistent navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/iot');

    // Check for uniform AppBar
    await expect(page.locator('header[class*="MuiAppBar"]')).toBeVisible();

    // Check for back button
    const backButton = page.locator(
      'button[aria-label*="Back"], button[aria-label*="Atrás"]'
    );
    await expect(backButton).toBeVisible();

    // Check for breadcrumbs
    await expect(page.locator('[aria-label="breadcrumb"]')).toBeVisible();

    // Test breadcrumb navigation
    await page
      .locator(
        '[aria-label="breadcrumb"] a:has-text(/Dashboard|Panel de Control/)'
      )
      .click();
    await page.waitForURL('**/dashboard');
  });

  test('Scheduling page has consistent navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/scheduling');

    // Check for uniform AppBar
    await expect(page.locator('header[class*="MuiAppBar"]')).toBeVisible();

    // Check for back button
    const backButton = page.locator(
      'button[aria-label*="Back"], button[aria-label*="Atrás"]'
    );
    await expect(backButton).toBeVisible();

    // Check for breadcrumbs
    await expect(page.locator('[aria-label="breadcrumb"]')).toBeVisible();
  });

  test('Language switching maintains navigation consistency', async ({
    page,
  }) => {
    // Start with English
    await page.goto('http://localhost:3000/equipment');

    // Switch to Spanish
    await page.click('[aria-label="Language"], [aria-label="Idioma"]');
    await page.click('li:has-text("Español"), li:has-text("Spanish")');

    // Verify Spanish navigation elements
    await expect(
      page.locator('[aria-label="breadcrumb"] a:has-text("Panel de Control")')
    ).toBeVisible();

    // Switch back to English
    await page.click('[aria-label="Idioma"], [aria-label="Language"]');
    await page.click('li:has-text("English"), li:has-text("Inglés")');

    // Verify English navigation elements
    await expect(
      page.locator('[aria-label="breadcrumb"] a:has-text("Dashboard")')
    ).toBeVisible();
  });

  test('All pages have uniform top bar presence', async ({ page }) => {
    const pages = [
      '/dashboard',
      '/equipment',
      '/settings',
      '/reports',
      '/users',
      '/iot',
      '/scheduling',
    ];

    for (const pageUrl of pages) {
      await page.goto(`http://localhost:3000${pageUrl}`);

      // Each page should have the AppBar
      await expect(page.locator('header[class*="MuiAppBar"]')).toBeVisible();

      // Each page should have the language switcher
      await expect(
        page.locator('[aria-label="Language"], [aria-label="Idioma"]')
      ).toBeVisible();

      // Each page should have the logout button
      await expect(
        page.locator('button:has([data-testid="LogoutIcon"])')
      ).toBeVisible();
    }
  });

  test('Navigation breadcrumbs work correctly on all pages', async ({
    page,
  }) => {
    const pages = [
      { url: '/equipment', expectedTitle: /Equipment|Equipos/ },
      { url: '/settings', expectedTitle: /Settings|Configuración/ },
      { url: '/reports', expectedTitle: /Reports|Reportes/ },
      { url: '/users', expectedTitle: /Users|Usuarios/ },
      { url: '/iot', expectedTitle: /IoT/ },
      { url: '/scheduling', expectedTitle: /Scheduling|Programación/ },
    ];

    for (const page_info of pages) {
      await page.goto(`http://localhost:3000${page_info.url}`);

      // Check breadcrumbs are present
      await expect(page.locator('[aria-label="breadcrumb"]')).toBeVisible();

      // Check dashboard link in breadcrumbs
      const dashboardLink = page.locator(
        '[aria-label="breadcrumb"] a:has-text(/Dashboard|Panel de Control/)'
      );
      await expect(dashboardLink).toBeVisible();

      // Check current page in breadcrumbs
      await expect(page.locator('[aria-label="breadcrumb"]')).toContainText(
        page_info.expectedTitle
      );

      // Test dashboard link functionality
      await dashboardLink.click();
      await page.waitForURL('**/dashboard');
      await expect(
        page.locator('h4:has-text(/Dashboard|Panel de Control/)')
      ).toBeVisible();
    }
  });

  test('Back buttons are consistent across pages', async ({ page }) => {
    const pagesWithBackButtons = [
      '/equipment',
      '/settings',
      '/reports',
      '/users',
      '/iot',
      '/scheduling',
    ];

    for (const pageUrl of pagesWithBackButtons) {
      await page.goto(`http://localhost:3000${pageUrl}`);

      // Check back button is present
      const backButton = page.locator(
        'button[aria-label*="Back"], button[aria-label*="Atrás"]'
      );
      await expect(backButton).toBeVisible();

      // Test back button functionality
      await backButton.click();
      await page.waitForURL('**/dashboard');

      // Verify we're back on dashboard
      await expect(
        page.locator('h4:has-text(/Dashboard|Panel de Control/)')
      ).toBeVisible();
    }
  });
});
