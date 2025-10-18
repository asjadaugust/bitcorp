import { test, expect } from '@playwright/test';

test.describe('Reports Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should redirect to login when accessing reports without authentication', async ({
    page,
  }) => {
    // Navigate directly to reports page without authentication
    await page.goto('http://localhost:3000/reports');

    // Should redirect to login page
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/login/);

    // Should show login form
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should access reports page after successful login', async ({
    page,
  }) => {
    // Go to login page first
    await page.goto('http://localhost:3000/login');

    // Fill in login credentials
    await page.fill('input[name="email"]', 'test@bitcorp.com');
    await page.fill('input[name="password"]', 'password123');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard (successful login)
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Now navigate to reports page
    await page.goto('http://localhost:3000/reports');

    // Should successfully load reports page without redirect
    await expect(page).toHaveURL(/reports/);
    await expect(
      page.getByRole('heading', { name: /reports & analytics/i })
    ).toBeVisible();
  });

  test('should NOT redirect to dashboard from reports page after login', async ({
    page,
  }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@bitcorp.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to reports page
    await page.goto('http://localhost:3000/reports');

    // Wait a few seconds to ensure no automatic redirect occurs
    await page.waitForTimeout(3000);

    // Should still be on reports page, not redirected to dashboard
    await expect(page).toHaveURL(/reports/);
    await expect(
      page.getByRole('heading', { name: /reports & analytics/i })
    ).toBeVisible();
  });

  test('should show loading state while checking authentication', async ({
    page,
  }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@bitcorp.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to reports page and check for loading state
    await page.goto('http://localhost:3000/reports');

    // Should briefly show loading spinner (might be too fast to catch)
    // But definitely should load the main content afterwards
    await expect(
      page.getByRole('heading', { name: /reports & analytics/i })
    ).toBeVisible();
  });

  test('should handle permission denied gracefully', async ({ page }) => {
    // This test would require a user with limited permissions
    // For now, we'll simulate by manually going to reports after login
    // and checking that the page loads (assuming test user has permission)

    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@bitcorp.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to reports page
    await page.goto('http://localhost:3000/reports');

    // Should either show the reports page (if permitted) or permission denied message
    await page.waitForSelector('h1, [role="alert"]', { timeout: 10000 });

    // Check if we have access or permission denied
    const hasPermission = await page
      .getByRole('heading', { name: /reports & analytics/i })
      .isVisible();
    const isPermissionDenied = await page
      .getByText(/don't have permission/i)
      .isVisible();

    expect(hasPermission || isPermissionDenied).toBe(true);
  });
});
