import { expect, test } from '@playwright/test'
import { bodyOverflow, dialog, prepare } from './helpers'

test.beforeEach(async ({ page }) => { await prepare(page) })

test('product image opens the quick view; Escape and backdrop close it', async ({ page }) => {
  await page.goto('/products')
  const card = page.locator('.product-card').first()
  const url = page.url()

  await card.locator('.card-img-btn').click()
  await expect(dialog(page)).toBeVisible()
  expect(page.url()).toBe(url)
  expect(await bodyOverflow(page)).toBe('hidden')

  await page.keyboard.press('Escape')
  await expect(dialog(page)).toHaveCount(0)
  expect(await bodyOverflow(page)).toBe('')

  await card.locator('.card-img-btn').click()
  await expect(dialog(page)).toBeVisible()
  await page.mouse.click(8, 400) // backdrop
  await expect(dialog(page)).toHaveCount(0)
})

test('product name opens the full product page with its description', async ({ page }) => {
  await page.goto('/products?search=sony')
  const name = page.locator('.product-card .card-name').first()
  const text = (await name.innerText()).trim()
  await name.click()
  await expect(page).toHaveURL(/\/products\/[^/?]+$/)
  await expect(page.getByRole('heading', { level: 1, name: text })).toBeVisible()
  await expect(page.getByText(/noise cancelling/i).first()).toBeVisible()
  await expect(dialog(page)).toHaveCount(0)
})

test('adding to cart from the quick view hands over to the cart drawer', async ({ page }) => {
  await page.goto('/products')
  const card = page.locator('.product-card', { has: page.getByRole('button', { name: /add to cart/i }) }).first()
  await card.locator('.card-img-btn').click()
  await dialog(page).getByRole('button', { name: /add to cart/i }).click()

  const drawer = page.locator('[role="dialog"][aria-label="Shopping Cart"]')
  await expect(drawer).toHaveAttribute('aria-hidden', 'false')
  await expect(page.locator('.popup-panel')).toHaveCount(0)
  expect(await bodyOverflow(page)).toBe('hidden')

  await page.keyboard.press('Escape')
  await expect(drawer).toHaveAttribute('aria-hidden', 'true')
  await expect.poll(() => bodyOverflow(page)).toBe('')
})

test('French mode shows French names and descriptions', async ({ page }) => {
  await prepare(page, { language: 'fr' })
  await page.goto('/products?search=chino')
  await expect(page.locator('.product-card .card-name').first()).toHaveText(/Pantalon/)
  await page.locator('.product-card .card-img-btn').first().click()
  await expect(dialog(page)).toContainText(/coupe slim/i)
})
