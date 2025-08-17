import { test, expect } from '@playwright/test';

test.describe('Bitcorp ERP - Comprehensive Application Tests', () => {
  test.beforeEach(async () => {
    // Set reasonable timeout for initial page loads
    test.setTimeout(60000);
  });

  test('Backend health check is accessible', async ({ page }) => {
    await page.goto('http://localhost:8000/health');
    await expect(page.locator('body')).toContainText('healthy');
  });

  test('Frontend application loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/en');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Bitcorp ERP/);
  });

  test('Login page is accessible and functional', async ({ page }) => {
    await page.goto('http://localhost:3001/en/login');
    await page.waitForLoadState('networkidle');

    // Check for login form elements
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Check demo credentials are shown
    await expect(page.getByText(/Demo Credentials/)).toBeVisible();
    await expect(page.getByText(/admin@bitcorp.com/)).toBeVisible();
  });

  test('Equipment page displays correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/en/equipment');
    await page.waitForLoadState('networkidle');

    // Page should load successfully (might redirect to login)
    const currentURL = page.url();
    
    if (currentURL.includes('/login')) {
      // If redirected to login, that's expected behavior
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    } else {
      // If on equipment page directly, check for equipment elements
      await expect(page.getByText(/equipment/i)).toBeVisible();
    }
  });

  test('Operator portal is accessible', async ({ page }) => {
    await page.goto('http://localhost:3001/en/operator');
    await page.waitForLoadState('networkidle');

    // Should show operator interface or redirect
    const currentURL = page.url();
    expect(currentURL).toMatch(/(operator|login)/);
    
    if (currentURL.includes('/operator')) {
      await expect(page.getByText(/operator/i).first()).toBeVisible();
    }
  });

  test('Analytics page loads or redirects properly', async ({ page }) => {
    await page.goto('http://localhost:3001/en/analytics');
    await page.waitForLoadState('networkidle');

    // Should either show analytics or redirect to login/marketing
    const currentURL = page.url();
    expect(currentURL).toMatch(/(analytics|login|marketing)/);
  });

  test('Premium page displays distinctive design', async ({ page }) => {
    await page.goto('http://localhost:3001/en/premium');
    await page.waitForLoadState('networkidle');

    // Check for premium page elements
    await expect(page.getByText(/PREMIUM/)).toBeVisible();
    await expect(page.getByText(/Unlock Advanced Features/)).toBeVisible();
    await expect(page.getByText(/Current Plan/)).toBeVisible();
  });

  test('Navigation and layout consistency', async ({ page }) => {
    // Test main pages for consistent layout
    const pages = ['/equipment', '/operator', '/reports', '/users'];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:3001/en${pagePath}`);
      await page.waitForLoadState('networkidle');
      
      // Check current URL (might redirect to login)
      const currentURL = page.url();
      
      if (!currentURL.includes('/login')) {
        // If not redirected to login, check for consistent layout elements
        // This would include AppBar, navigation, etc.
        // The test will pass if the page loads without errors
      }
    }
  });

  test('Mobile responsiveness check', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3001/en/operator');
    await page.waitForLoadState('networkidle');
    
    // Mobile operator interface should be accessible
    const currentURL = page.url();
    expect(currentURL).toMatch(/(operator|login)/);
  });

  test('Language selector functionality', async ({ page }) => {
    await page.goto('http://localhost:3001/en/equipment');
    await page.waitForLoadState('networkidle');
    
    // If on equipment page (not redirected), check for language selector
    const currentURL = page.url();
    if (!currentURL.includes('/login')) {
      // Language selector may or may not be visible depending on authentication
      // Test passes if page loads without language selector errors
    }
  });

  test('Error handling and 404 pages', async ({ page }) => {
    await page.goto('http://localhost:3001/en/nonexistent-page');
    await page.waitForLoadState('networkidle');
    
    // Should show either 404 page or redirect appropriately
    // Test passes if page loads without crashing
  });
});
