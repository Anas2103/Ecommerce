import { expect, test } from '@playwright/test'
import { dialog, prepare } from './helpers'

test('quick view fits a phone screen without horizontal scrolling', async ({ page }) => {
  await prepare(page)
  await page.goto('/products')
  await page.locator('.product-card .card-img-btn').first().click()
  await expect(dialog(page)).toBeVisible()
  const box = await dialog(page).boundingBox()
  const width = page.viewportSize().width
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(width)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
})
