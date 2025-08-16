import { test, expect } from '@playwright/test';

test.describe('Reports & Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });

  test('should display reports page with all sections', async ({ page }) => {
    // Navigate to reports page
    await page.click('text=Reports & Analytics');

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Reports & Analytics")', {
      timeout: 10000,
    });

    // Check page title and description
    await expect(
      page.getByRole('heading', { name: 'Reports & Analytics' })
    ).toBeVisible();
    await expect(
      page.getByText(
        'Equipment valuation, performance analysis, and cost management'
      )
    ).toBeVisible();

    // Check breadcrumb navigation
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Reports & Analytics')).toBeVisible();

    // Check filter controls
    await expect(page.getByLabel('Report Type')).toBeVisible();
    await expect(page.getByLabel('Date Range')).toBeVisible();
    await expect(page.getByLabel('Equipment Filter')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Refresh Data' })
    ).toBeVisible();
  });

  test('should display KPI metrics dashboard', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector(
      'h5:has-text("Key Performance Indicators (KPIs)")',
      { timeout: 10000 }
    );

    // Check KPI section title
    await expect(
      page.getByRole('heading', { name: /Key Performance Indicators/ })
    ).toBeVisible();

    // Check for KPI cards (should be 6 KPI metrics)
    const kpiCards = page
      .locator('.MuiCard-root')
      .filter({
        hasText:
          /Equipment Utilization Rate|Cost Savings|Timesheet Completion|Daily Report Compliance|Equipment Downtime|Average Equipment ROI/,
      });
    await expect(kpiCards).toHaveCount(6);

    // Verify specific KPI metrics are visible
    await expect(page.getByText('Equipment Utilization Rate')).toBeVisible();
    await expect(page.getByText('Cost Savings vs Rental')).toBeVisible();
    await expect(page.getByText('Timesheet Completion Rate')).toBeVisible();
    await expect(page.getByText('Daily Report Compliance')).toBeVisible();
    await expect(page.getByText('Equipment Downtime')).toBeVisible();
    await expect(page.getByText('Average Equipment ROI')).toBeVisible();
  });

  test('should display equipment performance table', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector(
      'h5:has-text("Equipment Performance Analysis")',
      { timeout: 10000 }
    );

    // Check equipment performance section
    await expect(
      page.getByRole('heading', { name: /Equipment Performance Analysis/ })
    ).toBeVisible();

    // Check table headers
    await expect(
      page.getByRole('columnheader', { name: 'Equipment' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Type' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Utilization Rate' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Total Hours' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Cost per Hour' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Total Cost' })
    ).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ROI' })).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Status' })
    ).toBeVisible();

    // Check for equipment data rows (should have mock data)
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(4); // Mock data has 4 equipment items

    // Verify specific equipment is listed
    await expect(page.getByText('CAT 320D Excavator')).toBeVisible();
    await expect(page.getByText('Volvo A40F Truck')).toBeVisible();
    await expect(page.getByText('JCB 3CX Backhoe')).toBeVisible();
    await expect(page.getByText('Liebherr LTM 1050')).toBeVisible();
  });

  test('should display available reports section', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector('h5:has-text("Available Reports")', {
      timeout: 10000,
    });

    // Check available reports section
    await expect(
      page.getByRole('heading', { name: /Available Reports/ })
    ).toBeVisible();

    // Check for report cards (should be 5 available reports)
    const reportCards = page
      .locator('.MuiCard-root')
      .filter({
        hasText:
          /Equipment Valuation Report|Performance Analytics Dashboard|Cost Analysis Report|Operator Performance Report|Maintenance Schedule Report/,
      });
    await expect(reportCards).toHaveCount(5);

    // Verify specific reports are available
    await expect(page.getByText('Equipment Valuation Report')).toBeVisible();
    await expect(
      page.getByText('Performance Analytics Dashboard')
    ).toBeVisible();
    await expect(page.getByText('Cost Analysis Report')).toBeVisible();
    await expect(page.getByText('Operator Performance Report')).toBeVisible();
    await expect(page.getByText('Maintenance Schedule Report')).toBeVisible();

    // Check for Generate and Download buttons
    const generateButtons = page.getByRole('button', { name: 'Generate' });
    const downloadButtons = page.getByRole('button', { name: 'Download' });
    await expect(generateButtons).toHaveCount(5);
    await expect(downloadButtons).toHaveCount(5);
  });

  test('should handle filter changes', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector('h1:has-text("Reports & Analytics")', {
      timeout: 10000,
    });

    // Test report type filter
    await page.click('text=Report Type');
    await page.click('text=Equipment Analysis');
    await expect(page.locator('input[value="equipment"]')).toBeVisible();

    // Test date range filter
    await page.click('text=Date Range');
    await page.click('text=Last 3 months');

    // Test equipment filter
    await page.click('text=Equipment Filter');
    await page.click('text=Excavators');
    await expect(page.locator('input[value="excavators"]')).toBeVisible();
  });

  test('should handle report generation', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector('button:has-text("Generate Report")', {
      timeout: 10000,
    });

    // Click main generate report button
    const mainGenerateButton = page
      .getByRole('button', { name: 'Generate Report' })
      .first();
    await mainGenerateButton.click();

    // Should show generating state
    await expect(page.getByText('Generating...')).toBeVisible();

    // Wait for generation to complete (mock delay is 2 seconds)
    await page.waitForSelector('button:has-text("Generate Report")', {
      timeout: 5000,
    });
    await expect(page.getByText('Generate Report')).toBeVisible();
  });

  test('should handle individual report generation', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector('text=Equipment Valuation Report', {
      timeout: 10000,
    });

    // Find the first Generate button in available reports
    const firstGenerateButton = page
      .locator('.MuiCard-root')
      .first()
      .getByRole('button', { name: 'Generate' });
    await firstGenerateButton.click();

    // Should show generating state briefly
    await expect(page.getByText('Generating...')).toBeVisible();

    // Wait for generation to complete
    await page.waitForTimeout(3000);
    await expect(page.getByRole('button', { name: 'Generate' })).toBeVisible();
  });

  test('should handle PDF export', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector('button:has-text("Export PDF")', {
      timeout: 10000,
    });

    // Click equipment performance export button
    const exportButton = page
      .getByRole('button', { name: 'Export PDF' })
      .first();
    await exportButton.click();

    // Should show generating state
    await expect(page.getByText('Generating...')).toBeVisible();

    // Wait for export to complete
    await page.waitForTimeout(3000);
    await expect(
      page.getByRole('button', { name: 'Export PDF' })
    ).toBeVisible();
  });

  test('should handle download buttons in available reports', async ({
    page,
  }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector('text=Equipment Valuation Report', {
      timeout: 10000,
    });

    // Find the first Download button in available reports
    const firstDownloadButton = page
      .locator('.MuiCard-root')
      .first()
      .getByRole('button', { name: 'Download' });
    await firstDownloadButton.click();

    // Should show generating state briefly
    await expect(page.getByText('Generating...')).toBeVisible();

    // Wait for download to complete
    await page.waitForTimeout(3000);
  });

  test('should handle back to dashboard navigation', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector('button:has-text("Back to dashboard")', {
      timeout: 10000,
    });

    // Click back to dashboard button
    await page.click('button:has-text("Back to dashboard")');

    // Should navigate back to dashboard
    await page.waitForSelector(
      'h1:has-text("Equipment Management Dashboard")',
      { timeout: 10000 }
    );
    await expect(
      page.getByRole('heading', { name: /Equipment Management Dashboard/ })
    ).toBeVisible();
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Click dashboard breadcrumb
    const dashboardBreadcrumb = page
      .locator('nav[aria-label="breadcrumb"]')
      .getByText('Dashboard');
    await dashboardBreadcrumb.click();

    // Should navigate back to dashboard
    await page.waitForSelector(
      'h1:has-text("Equipment Management Dashboard")',
      { timeout: 10000 }
    );
    await expect(
      page.getByRole('heading', { name: /Equipment Management Dashboard/ })
    ).toBeVisible();
  });

  test('should display refresh data functionality', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector('button:has-text("Refresh Data")', {
      timeout: 10000,
    });

    // Click refresh data button
    await page.click('button:has-text("Refresh Data")');

    // Page should reload (location.reload)
    await page.waitForSelector('h1:has-text("Reports & Analytics")', {
      timeout: 10000,
    });
    await expect(
      page.getByRole('heading', { name: 'Reports & Analytics' })
    ).toBeVisible();
  });

  test('should display equipment status chips correctly', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector(
      'h5:has-text("Equipment Performance Analysis")',
      { timeout: 10000 }
    );

    // Check for status chips in the equipment table
    await expect(page.getByText('active')).toBeVisible();
    await expect(page.getByText('maintenance')).toBeVisible();

    // Verify status chip colors are properly applied
    const activeChips = page
      .locator('.MuiChip-root')
      .filter({ hasText: 'active' });
    const maintenanceChips = page
      .locator('.MuiChip-root')
      .filter({ hasText: 'maintenance' });

    await expect(activeChips).toHaveCount(3); // 3 active equipment
    await expect(maintenanceChips).toHaveCount(1); // 1 in maintenance
  });

  test('should display ROI performance indicators', async ({ page }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector(
      'h5:has-text("Equipment Performance Analysis")',
      { timeout: 10000 }
    );

    // Check for ROI chips in the equipment table
    const roiChips = page.locator('.MuiChip-root').filter({ hasText: /\d+%/ });
    await expect(roiChips).toHaveCount(4); // 4 equipment items with ROI

    // Verify specific ROI values
    await expect(page.getByText('340%')).toBeVisible();
    await expect(page.getByText('280%')).toBeVisible();
    await expect(page.getByText('195%')).toBeVisible();
    await expect(page.getByText('420%')).toBeVisible();
  });

  test('should display utilization rate progress indicators', async ({
    page,
  }) => {
    await page.click('text=Reports & Analytics');
    await page.waitForSelector(
      'h5:has-text("Equipment Performance Analysis")',
      { timeout: 10000 }
    );

    // Check for utilization rate progress circles
    const progressIndicators = page.locator('.MuiCircularProgress-root');
    await expect(progressIndicators).toHaveCount(4); // 4 equipment items

    // Verify utilization percentages are displayed
    await expect(page.getByText('89%')).toBeVisible();
    await expect(page.getByText('92%')).toBeVisible();
    await expect(page.getByText('78%')).toBeVisible();
    await expect(page.getByText('85%')).toBeVisible();
  });
});
