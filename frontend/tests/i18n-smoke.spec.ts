import { test, expect } from '@playwright/test';

test.describe('Internationalization Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from dashboard after login
    await page.goto('http://localhost:3000/login');

    // Login with demo credentials
    await page.fill('input[type="text"]', 'admin@bitcorp.com');
    await page.fill('input[type="password"]', 'admin123!');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
  });

  test('should display English content by default', async ({ page }) => {
    // Verify English URL (no locale prefix)
    await expect(page).toHaveURL(/\/dashboard$/);

    // Verify English UI elements
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=Active Equipment')).toBeVisible();
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();

    // Verify language switcher shows English
    await expect(page.locator('text=🇺🇸')).toBeVisible();
    await expect(page.locator('text=English')).toBeVisible();
  });

  test('should switch to Spanish and display correct translations', async ({
    page,
  }) => {
    // Click on language switcher
    await page.click('[role="combobox"][name="Language"]');

    // Select Spanish
    await page.click('[role="option"]:has-text("Spanish")');

    // Verify Spanish URL with locale prefix
    await expect(page).toHaveURL(/\/es\/dashboard$/);

    // Verify Spanish UI elements
    await expect(page.locator('h1')).toContainText('Panel de Control');
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible();
    await expect(page.locator('text=Equipos Activos')).toBeVisible();
    await expect(page.locator('text=Acciones Rápidas')).toBeVisible();
    await expect(page.locator('text=Actividad Reciente')).toBeVisible();

    // Verify language switcher shows Spanish
    await expect(page.locator('text=🇪🇸')).toBeVisible();
    await expect(page.locator('text=Español')).toBeVisible();
    await expect(page.locator('text=Idioma')).toBeVisible();
  });

  test('should switch back to English from Spanish', async ({ page }) => {
    // First switch to Spanish
    await page.click('[role="combobox"][name="Language"]');
    await page.click('[role="option"]:has-text("Spanish")');
    await expect(page).toHaveURL(/\/es\/dashboard$/);

    // Then switch back to English
    await page.click('[role="combobox"][name="Idioma"]');
    await page.click('[role="option"]:has-text("Inglés")');

    // Verify back to English URL
    await expect(page).toHaveURL(/\/dashboard$/);

    // Verify English content is restored
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=🇺🇸')).toBeVisible();
    await expect(page.locator('text=English')).toBeVisible();
  });

  test('should format currency correctly for both locales', async ({
    page,
  }) => {
    // Check USD formatting in English
    await expect(page.locator('text=$45,230.00')).toBeVisible();

    // Switch to Spanish
    await page.click('[role="combobox"][name="Language"]');
    await page.click('[role="option"]:has-text("Spanish")');

    // Check USD formatting in Spanish (Latin American style)
    await expect(page.locator('text=USD 45,230.00')).toBeVisible();
  });

  test('should translate all dashboard stats in Spanish', async ({ page }) => {
    // Switch to Spanish
    await page.click('[role="combobox"][name="Language"]');
    await page.click('[role="option"]:has-text("Spanish")');

    // Verify all stats are translated
    await expect(page.locator('text=Equipos Activos')).toBeVisible(); // Active Equipment
    await expect(page.locator('text=Usuarios Activos')).toBeVisible(); // Active Users
    await expect(page.locator('text=Ingresos del Mes')).toBeVisible(); // This Month Revenue
    await expect(page.locator('text=Tareas Programadas')).toBeVisible(); // Scheduled Tasks
  });

  test('should translate all quick actions in Spanish', async ({ page }) => {
    // Switch to Spanish
    await page.click('[role="combobox"][name="Language"]');
    await page.click('[role="option"]:has-text("Spanish")');

    // Verify all quick actions are translated
    await expect(page.locator('text=Gestión de Equipos')).toBeVisible();
    await expect(page.locator('text=Monitoreo IoT')).toBeVisible();
    await expect(page.locator('text=Programación de Equipos')).toBeVisible();
    await expect(page.locator('text=Gestión de Usuarios')).toBeVisible();
    await expect(page.locator('text=Reportes y Analíticas')).toBeVisible();
    await expect(page.locator('text=Configuración del Sistema')).toBeVisible();
  });

  test('should translate recent activity with time expressions in Spanish', async ({
    page,
  }) => {
    // Switch to Spanish
    await page.click('[role="combobox"][name="Language"]');
    await page.click('[role="option"]:has-text("Spanish")');

    // Verify recent activity translations
    await expect(page.locator('text=Nuevo registro de usuario')).toBeVisible();
    await expect(page.locator('text=Equipo CAT-001 asignado a')).toBeVisible();
    await expect(
      page.locator('text=Reporte mensual generado exitosamente')
    ).toBeVisible();

    // Verify time expressions
    await expect(page.locator('text=hace 2 horas')).toBeVisible();
    await expect(page.locator('text=hace 4 horas')).toBeVisible();
    await expect(page.locator('text=hace 1 día')).toBeVisible();
  });

  test('should direct access Spanish URL work correctly', async ({ page }) => {
    // Directly navigate to Spanish dashboard
    await page.goto('http://localhost:3000/es/dashboard');

    // Should maintain Spanish locale
    await expect(page).toHaveURL(/\/es\/dashboard$/);
    await expect(page.locator('h1')).toContainText('Panel de Control');
    await expect(page.locator('text=🇪🇸')).toBeVisible();
    await expect(page.locator('text=Español')).toBeVisible();
  });

  test('should handle translation interpolation correctly', async ({
    page,
  }) => {
    // Switch to Spanish to test interpolation
    await page.click('[role="combobox"][name="Language"]');
    await page.click('[role="option"]:has-text("Spanish")');

    // Verify interpolated strings work
    await expect(
      page.locator('text=Bienvenido de nuevo, System Administrator')
    ).toBeVisible();
    await expect(
      page.locator('text=Nuevo registro de usuario: John Operator')
    ).toBeVisible();
    await expect(
      page.locator('text=Equipo CAT-001 asignado a Project Alpha')
    ).toBeVisible();
  });

  test('should preserve authentication state across language switching', async ({
    page,
  }) => {
    // Verify user is logged in initially
    await expect(page.locator('text=System Administrator')).toBeVisible();
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();

    // Switch to Spanish
    await page.click('[role="combobox"][name="Language"]');
    await page.click('[role="option"]:has-text("Spanish")');

    // Verify still logged in
    await expect(page.locator('text=System Administrator')).toBeVisible();
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();

    // Switch back to English
    await page.click('[role="combobox"][name="Idioma"]');
    await page.click('[role="option"]:has-text("Inglés")');

    // Verify still logged in
    await expect(page.locator('text=System Administrator')).toBeVisible();
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });
});
