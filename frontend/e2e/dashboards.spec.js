import { expect, test } from '@playwright/test'
import { apiToken, dialog, prepare } from './helpers'

test('admin can open the category editor and moderate reviews', async ({ page, request }) => {
  await prepare(page, { token: await apiToken(request, 'admin@ecommerce.com') })

  await page.goto('/admin/categories')
  await page.getByRole('button', { name: /new category|add/i }).first().click()
  await expect(dialog(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toHaveCount(0)

  await page.goto('/admin/reviews')
  await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible()
  await page.getByRole('tab', { name: /all/i }).click()
  await expect(page.locator('.data-table tbody tr').first()).toBeVisible()
})

test('admin sees seller verification documents and returns', async ({ page, request }) => {
  await prepare(page, { token: await apiToken(request, 'admin@ecommerce.com') })
  await page.goto('/admin/sellers')
  await page.getByRole('tab', { name: /all/i }).click()
  await expect(page.locator('.data-table tbody tr').first()).toBeVisible()

  await page.goto('/admin/returns')
  await expect(page.getByText(/ORD-/).first()).toBeVisible()
})

test('seller can open the CSV import popup and the verification page', async ({ page, request }) => {
  await prepare(page, { token: await apiToken(request, 'seller@ecommerce.com') })
  await page.goto('/seller/products')
  await page.getByRole('button', { name: /import/i }).first().click()
  await expect(dialog(page)).toBeVisible()
  await dialog(page).getByRole('button', { name: 'Close' }).click()
  await expect(dialog(page)).toHaveCount(0)

  await page.goto('/seller/verification')
  await expect(page.getByRole('heading', { name: 'Verification' })).toBeVisible()
  await expect(page.locator('.data-table tbody tr').first()).toBeVisible()
})

test('customer can request a return on a delivered order', async ({ page, request }) => {
  const token = await apiToken(request, 'client@ecommerce.com')
  const auth = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  const { API } = await import('./helpers')
  const orders = (await (await request.get(`${API}/orders?status=delivered`, { headers: auth })).json()).data
  const returns = (await (await request.get(`${API}/returns`, { headers: auth })).json()).data
  const order = orders.find((o) => !returns.some((r) => r.order_id === o.id))
  test.skip(!order, 'every delivered demo order already has a return')

  await prepare(page, { token })
  await page.goto(`/orders/${order.id}`)
  await page.getByRole('button', { name: /request return/i }).first().click()
  await expect(dialog(page)).toBeVisible()
  await dialog(page).getByRole('button', { name: /send request/i }).click()
  await expect(dialog(page)).toHaveCount(0)
  await expect(page.getByText(/return pending/i).first()).toBeVisible()
})

test('key client pages render without errors', async ({ page, request }) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await prepare(page, { token: await apiToken(request, 'client@ecommerce.com') })
  for (const path of ['/', '/cart', '/checkout', '/orders', '/wishlist', '/profile', '/compare', '/sellers/2']) {
    await page.goto(path)
    await expect(page.locator('main')).not.toBeEmpty()
  }
  expect(errors).toEqual([])
})
