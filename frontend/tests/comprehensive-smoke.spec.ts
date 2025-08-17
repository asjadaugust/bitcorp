import { test, expect } from '@playwright/test';

test.describe('Comprehensive Smoke Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for initial page loads
    test.setTimeout(30000);
  });

  test('Application loads and displays correct title', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Bitcorp ERP/);
  });

  test('Login page is accessible and functional', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Check for login form elements
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('Dashboard navigation works', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to login or show dashboard
    const currentURL = page.url();
    expect(currentURL).toMatch(/(login|dashboard)/);
  });

  test('Equipment page loads without errors', async ({ page }) => {
    await page.goto('http://localhost:3000/equipment');
    await page.waitForLoadState('networkidle');
    
    // Page should load successfully
    expect(page.url()).toContain('/equipment');
    
    // Check for equipment management UI elements
    await expect(page.getByText(/equipment/i)).toBeVisible();
  });

  test('Operator portal is accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/operator');
    await page.waitForLoadState('networkidle');
    
    // Should show operator interface
    expect(page.url()).toContain('/operator');
  });

  test('API health endpoint responds correctly', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('message');
  });

  test('Frontend serves static assets correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check that CSS is loading
    const response = await page.waitForResponse(response => 
      response.url().includes('_next/static/css') && response.status() === 200
    );
    expect(response.ok()).toBeTruthy();
  });

  test('Navigation between pages works', async ({ page }) => {
    // Start at home
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Navigate to login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
    
    // Navigate to equipment
    await page.goto('http://localhost:3000/equipment');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/equipment');
  });

  test('Mobile viewport renders correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000/operator');
    await page.waitForLoadState('networkidle');
    
    // Should be responsive
    const bodyWidth = await page.locator('body').boundingBox();
    expect(bodyWidth?.width).toBeLessThanOrEqual(375);
  });

  test('Material-UI components are loading', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Check for Material-UI classes
    const muiElements = await page.locator('.MuiBox-root, .MuiButton-root, .MuiTextField-root').count();
    expect(muiElements).toBeGreaterThan(0);
  });
});
