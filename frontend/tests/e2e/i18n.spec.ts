import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n) Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and login
    await page.goto('http://localhost:3000/login');

    // Fill login form
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
  });

  test('should display dashboard in English by default', async ({ page }) => {
    // Check URL is English
    expect(page.url()).toContain('/dashboard');
    expect(page.url()).not.toContain('/es/');

    // Check English text is displayed
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByText('Active Equipment')).toBeVisible();
    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByText('Equipment Management')).toBeVisible();

    // Check language switcher shows English
    await expect(page.getByText('🇺🇸')).toBeVisible();
    await expect(page.getByText('English')).toBeVisible();
  });

  test('should switch to Spanish when language is changed', async ({
    page,
  }) => {
    // Click language switcher
    await page.click('combobox[aria-label="Language"]');
    await page.click('text=🇪🇸 Español');

    // Wait for page to reload with Spanish
    await page.waitForURL('**/es/dashboard');

    // Check URL is Spanish
    expect(page.url()).toContain('/es/dashboard');

    // Check Spanish text is displayed
    await expect(page.locator('h1')).toContainText('Panel de Control');
    await expect(page.getByText('Bienvenido de nuevo')).toBeVisible();
    await expect(page.getByText('Equipos Activos')).toBeVisible();
    await expect(page.getByText('Acciones Rápidas')).toBeVisible();
    await expect(page.getByText('Gestión de Equipos')).toBeVisible();

    // Check language switcher shows Spanish
    await expect(page.getByText('🇪🇸')).toBeVisible();
    await expect(page.getByText('Español')).toBeVisible();

    // Check currency formatting is correct for Spanish
    await expect(page.getByText('USD 45,230.00')).toBeVisible();
  });

  test('should maintain language when navigating to equipment page', async ({
    page,
  }) => {
    // Switch to Spanish first
    await page.click('combobox[aria-label="Language"]');
    await page.click('text=🇪🇸 Español');
    await page.waitForURL('**/es/dashboard');

    // Navigate to equipment page
    await page.click('text=Gestión de Equipos');
    await page.waitForURL('**/es/equipment');

    // Check URL maintains Spanish locale
    expect(page.url()).toContain('/es/equipment');

    // Check equipment page is in Spanish
    await expect(page.locator('h1')).toContainText('Gestión de Equipos');
    await expect(
      page.getByText('Administrar equipos de construcción y maquinaria')
    ).toBeVisible();
    await expect(page.getByText('Agregar Equipo')).toBeVisible();
    await expect(page.getByText('Buscar...')).toBeVisible();
    await expect(page.getByText('Filtrar')).toBeVisible();

    // Check breadcrumbs are translated
    await expect(page.getByText('Panel de Control')).toBeVisible();
    await expect(page.getByText('Equipos')).toBeVisible();

    // Check language switcher is still available and correct
    await expect(page.getByText('🇪🇸')).toBeVisible();
    await expect(page.getByText('Español')).toBeVisible();
  });

  test('should switch back to English from equipment page', async ({
    page,
  }) => {
    // Switch to Spanish and go to equipment page
    await page.click('combobox[aria-label="Language"]');
    await page.click('text=🇪🇸 Español');
    await page.waitForURL('**/es/dashboard');
    await page.click('text=Gestión de Equipos');
    await page.waitForURL('**/es/equipment');

    // Switch back to English
    await page.click('combobox[aria-label="Idioma"]');
    await page.click('text=🇺🇸 Inglés');
    await page.waitForURL('**/equipment');

    // Check URL is now English
    expect(page.url()).toContain('/equipment');
    expect(page.url()).not.toContain('/es/');

    // Check equipment page is in English
    await expect(page.locator('h1')).toContainText('Equipment Management');
    await expect(
      page.getByText('Manage construction equipment and machinery')
    ).toBeVisible();

    // Check breadcrumbs are in English
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Equipment')).toBeVisible();
  });

  test('should show correct currency formatting for different languages', async ({
    page,
  }) => {
    // Check English formatting
    await expect(page.getByText('$45,230.00')).toBeVisible();

    // Switch to Spanish
    await page.click('combobox[aria-label="Language"]');
    await page.click('text=🇪🇸 Español');
    await page.waitForURL('**/es/dashboard');

    // Check Spanish formatting
    await expect(page.getByText('USD 45,230.00')).toBeVisible();
  });

  test('should have language switcher available on all pages', async ({
    page,
  }) => {
    // Check dashboard has language switcher
    await expect(page.getByText('🇺🇸')).toBeVisible();
    await expect(page.getByText('English')).toBeVisible();

    // Go to equipment page
    await page.click('text=Equipment Management');
    await page.waitForURL('**/equipment');

    // Check equipment page has language switcher
    await expect(page.getByText('🇺🇸')).toBeVisible();
    await expect(page.getByText('English')).toBeVisible();
  });

  test('should maintain user session when switching languages', async ({
    page,
  }) => {
    // Check user info is displayed
    await expect(page.getByText('System Administrator')).toBeVisible();
    await expect(page.getByText('admin')).toBeVisible();

    // Switch to Spanish
    await page.click('combobox[aria-label="Language"]');
    await page.click('text=🇪🇸 Español');
    await page.waitForURL('**/es/dashboard');

    // Check user info is still displayed
    await expect(page.getByText('System Administrator')).toBeVisible();
    await expect(page.getByText('admin')).toBeVisible();

    // Check logout button is translated
    await expect(page.getByText('Cerrar Sesión')).toBeVisible();
  });
});
