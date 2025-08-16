import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('frontend should load successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/BitCorp/i);
  });

  test('login page should be accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('backend API docs should be accessible', async ({ page }) => {
    await page.goto('http://localhost:8000/docs');
    await expect(page.locator('h2')).toContainText('FastAPI');
  });

  test('basic navigation should work', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Should have navigation elements
    await expect(page.locator('nav, header, .navigation')).toBeVisible();
  });

  test('responsive design should work on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000');
    
    // Check that page loads properly on mobile
    await expect(page).toHaveTitle(/BitCorp/i);
  });
});
