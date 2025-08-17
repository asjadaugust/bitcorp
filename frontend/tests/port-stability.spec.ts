import { test, expect } from '@playwright/test';

test.describe('Port Stability Tests', () => {
  test('Frontend should be accessible on port 3000', async ({ page }) => {
    // Visit the frontend URL
    await page.goto('http://localhost:3000');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify the page loaded successfully
    await expect(page).toHaveTitle(/Bitcorp ERP/);

    // Check that we can navigate within the app
    const response = await page.goto('http://localhost:3000');
    expect(response?.status()).toBe(200);
  });

  test('Backend should be accessible on port 8000', async ({ request }) => {
    // Test the backend health endpoint
    const response = await request.get('http://localhost:8000/api/v1/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
  });

  test('Port 3000 consistency check', async ({ page }) => {
    // Make multiple requests to ensure port doesn't change
    for (let i = 0; i < 5; i++) {
      const response = await page.goto('http://localhost:3000');
      expect(response?.status()).toBe(200);

      // Brief delay between requests
      await page.waitForTimeout(1000);
    }
  });
});
