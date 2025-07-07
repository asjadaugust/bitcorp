import { test, expect } from '@playwright/test'

// Mock API response helper
const equipmentListResponse = {
  equipment: [
    {
      id: 1,
      company_id: 1,
      name: 'CAT 320 Excavator',
      equipment_type: 'excavator',
      status: 'available',
      serial_number: 'EXC-001',
      brand: 'Caterpillar',
      model: 'CAT 320',
      year_manufactured: 2022,
      purchase_cost: 250000,
      current_value: 220000,
      hourly_rate: 150,
      hourmeter_reading: 1500,
      odometer_reading: 0,
      fuel_type: 'diesel',
      fuel_capacity: 300,
      specifications: {},
      images: [],
      notes: 'Heavy-duty excavator',
      is_active: true,
      created_at: '2022-01-15T00:00:00Z',
      updated_at: '2023-01-15T00:00:00Z'
    },
    {
      id: 2,
      company_id: 1,
      name: 'John Deere 850K Bulldozer',
      equipment_type: 'bulldozer',
      status: 'in_use',
      serial_number: 'BUL-001',
      brand: 'John Deere',
      model: '850K',
      year_manufactured: 2021,
      purchase_cost: 300000,
      current_value: 280000,
      hourly_rate: 180,
      hourmeter_reading: 2000,
      odometer_reading: 0,
      fuel_type: 'diesel',
      fuel_capacity: 400,
      specifications: {},
      images: [],
      notes: 'Heavy-duty bulldozer',
      is_active: true,
      created_at: '2021-03-20T00:00:00Z',
      updated_at: '2023-01-15T00:00:00Z'
    }
  ],
  total: 2,
  page: 1,
  per_page: 20,
  total_pages: 1
}

test.describe('Equipment Management with SWR', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the equipment API endpoints
    await page.route('**/api/v1/equipment*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(equipmentListResponse)
        })
      }
    })

    // Mock equipment types endpoint
    await page.route('**/api/v1/equipment/types/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['excavator', 'bulldozer', 'loader', 'crane', 'truck'])
      })
    })

    // Mock equipment statuses endpoint
    await page.route('**/api/v1/equipment/statuses/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['available', 'in_use', 'maintenance', 'retired', 'out_of_order'])
      })
    })

    // Navigate to equipment page
    await page.goto('http://localhost:3000/equipment')
  })

  test('should load and display equipment list using SWR', async ({ page }) => {
    // Wait for the equipment list to load
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible()

    // Check if equipment items are displayed
    await expect(page.locator('[data-testid="equipment-item"]')).toHaveCount(2)

    // Check specific equipment details
    await expect(page.locator('text=CAT 320 Excavator')).toBeVisible()
    await expect(page.locator('text=John Deere 850K Bulldozer')).toBeVisible()

    // Check status indicators
    await expect(page.locator('[data-testid="status-available"]')).toBeVisible()
    await expect(page.locator('[data-testid="status-in-use"]')).toBeVisible()
  })

  test('should handle equipment search functionality', async ({ page }) => {
    // Wait for the search input to be available
    const searchInput = page.locator('[data-testid="equipment-search"]')
    await expect(searchInput).toBeVisible()

    // Mock search API response
    await page.route('**/api/v1/equipment?search=excavator*', async (route) => {
      const filteredResponse = {
        ...equipmentListResponse,
        equipment: equipmentListResponse.equipment.filter(eq => 
          eq.name.toLowerCase().includes('excavator')
        ),
        total: 1
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(filteredResponse)
      })
    })

    // Perform search
    await searchInput.fill('excavator')
    await searchInput.press('Enter')

    // Wait for filtered results
    await page.waitForTimeout(500)
    
    // Check that only excavator is shown
    await expect(page.locator('text=CAT 320 Excavator')).toBeVisible()
    await expect(page.locator('text=John Deere 850K Bulldozer')).not.toBeVisible()
  })

  test('should handle equipment status filtering', async ({ page }) => {
    // Wait for the status filter to be available
    const statusFilter = page.locator('[data-testid="status-filter"]')
    await expect(statusFilter).toBeVisible()

    // Mock filtered API response for available equipment
    await page.route('**/api/v1/equipment?status=available*', async (route) => {
      const filteredResponse = {
        ...equipmentListResponse,
        equipment: equipmentListResponse.equipment.filter(eq => eq.status === 'available'),
        total: 1
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(filteredResponse)
      })
    })

    // Select "available" status
    await statusFilter.click()
    await page.locator('text=Available').click()

    // Wait for filtered results
    await page.waitForTimeout(500)

    // Check that only available equipment is shown
    await expect(page.locator('text=CAT 320 Excavator')).toBeVisible()
    await expect(page.locator('text=John Deere 850K Bulldozer')).not.toBeVisible()
  })

  test('should handle equipment creation with SWR mutation', async ({ page }) => {
    let createRequestMade = false

    // Mock equipment creation endpoint
    await page.route('**/api/v1/equipment', async (route) => {
      if (route.request().method() === 'POST') {
        createRequestMade = true
        const newEquipment = {
          id: 3,
          company_id: 1,
          name: 'New Test Equipment',
          equipment_type: 'loader',
          status: 'available',
          serial_number: 'LOD-001',
          brand: 'Test Brand',
          model: 'Test Model',
          year_manufactured: 2023,
          purchase_cost: 150000,
          current_value: 150000,
          hourly_rate: 120,
          hourmeter_reading: 0,
          odometer_reading: 0,
          fuel_type: 'diesel',
          fuel_capacity: 200,
          specifications: {},
          images: [],
          notes: 'New test equipment',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newEquipment)
        })
      }
    })

    // Click add equipment button
    await page.locator('[data-testid="add-equipment-button"]').click()

    // Fill equipment form
    await page.locator('[data-testid="equipment-name"]').fill('New Test Equipment')
    await page.locator('[data-testid="equipment-type"]').selectOption('loader')
    await page.locator('[data-testid="equipment-brand"]').fill('Test Brand')
    await page.locator('[data-testid="equipment-model"]').fill('Test Model')
    await page.locator('[data-testid="equipment-year"]').fill('2023')

    // Submit form
    await page.locator('[data-testid="submit-equipment"]').click()

    // Wait for request and UI update
    await page.waitForTimeout(1000)

    // Verify the API request was made
    expect(createRequestMade).toBe(true)

    // Check for success message or updated list
    await expect(page.locator('text=Equipment created successfully')).toBeVisible()
  })

  test('should handle equipment status update with optimistic updates', async ({ page }) => {
    let statusUpdateMade = false

    // Mock status update endpoint
    await page.route('**/api/v1/equipment/1/status', async (route) => {
      if (route.request().method() === 'PATCH') {
        statusUpdateMade = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Status updated successfully',
            old_status: 'available',
            new_status: 'maintenance'
          })
        })
      }
    })

    // Find and click status change button for first equipment
    await page.locator('[data-testid="equipment-item"]:first-child [data-testid="status-button"]').click()
    await page.locator('[data-testid="status-option-maintenance"]').click()

    // Wait for the update
    await page.waitForTimeout(500)

    // Verify the API request was made
    expect(statusUpdateMade).toBe(true)

    // Check that the status was updated in the UI (optimistic update)
    await expect(page.locator('[data-testid="status-maintenance"]')).toBeVisible()
  })

  test('should display equipment statistics using SWR stats hook', async ({ page }) => {
    // Navigate to equipment dashboard/stats page
    await page.goto('http://localhost:3000/equipment/dashboard')

    // Wait for stats to load
    await expect(page.locator('[data-testid="equipment-stats"]')).toBeVisible()

    // Check that statistics are displayed correctly
    await expect(page.locator('[data-testid="total-equipment"]')).toContainText('2')
    await expect(page.locator('[data-testid="available-count"]')).toContainText('1')
    await expect(page.locator('[data-testid="in-use-count"]')).toContainText('1')
    await expect(page.locator('[data-testid="total-value"]')).toContainText('500,000')
  })

  test('should handle real-time data updates with SWR revalidation', async ({ page }) => {
    // Initial load
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="equipment-item"]')).toHaveCount(2)

    // Simulate external data change by updating the mock
    const updatedResponse = {
      ...equipmentListResponse,
      equipment: [
        ...equipmentListResponse.equipment,
        {
          id: 3,
          company_id: 1,
          name: 'Newly Added Equipment',
          equipment_type: 'crane',
          status: 'available',
          serial_number: 'CRN-001',
          brand: 'New Brand',
          model: 'New Model',
          year_manufactured: 2023,
          purchase_cost: 400000,
          current_value: 400000,
          hourly_rate: 200,
          hourmeter_reading: 0,
          odometer_reading: 0,
          fuel_type: 'diesel',
          fuel_capacity: 500,
          specifications: {},
          images: [],
          notes: 'Newly added equipment',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      total: 3
    }

    // Update mock to return new data
    await page.route('**/api/v1/equipment*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(updatedResponse)
        })
      }
    })

    // Trigger revalidation (could be through a refresh button or automatic)
    await page.locator('[data-testid="refresh-equipment"]').click()

    // Wait for the new data to load
    await page.waitForTimeout(1000)

    // Check that the new equipment appears
    await expect(page.locator('[data-testid="equipment-item"]')).toHaveCount(3)
    await expect(page.locator('text=Newly Added Equipment')).toBeVisible()
  })
})
