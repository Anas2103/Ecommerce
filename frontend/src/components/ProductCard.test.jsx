import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/render'
import ProductCard from './ProductCard'

vi.mock('../services/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

const product = {
  id: 7, slug: 'sony-wh-1000xm5', name: 'Sony WH-1000XM5', name_fr: 'Casque Sony WH-1000XM5',
  description: 'Industry-leading noise cancelling.', description_fr: 'Réduction de bruit de référence.',
  price: 3499, final_price: 2848.19, discount_percent: 18.6, stock: 12,
  primary_image_url: '/img.jpg', category: { name: 'Accessories', name_fr: 'Accessoires' },
}

describe('ProductCard', () => {
  it('links the product name to the full product page', () => {
    renderWithProviders(<ProductCard product={product} />)
    expect(screen.getByRole('link', { name: 'Sony WH-1000XM5' })).toHaveAttribute('href', '/products/sony-wh-1000xm5')
  })

  it('navigates to the product page when the name is clicked (no preview)', async () => {
    renderWithProviders(<ProductCard product={product} />, { routes: { '/products/:slug': <h1>Product page</h1> } })
    await userEvent.click(screen.getByRole('link', { name: 'Sony WH-1000XM5' }))
    expect(screen.getByRole('heading', { name: 'Product page' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the quick-view preview when the image is clicked, and closes it with Escape', async () => {
    renderWithProviders(<ProductCard product={product} />)
    await userEvent.click(screen.getAllByRole('button', { name: /quick view/i })[0])

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Industry-leading noise cancelling.')
    expect(document.body.style.overflow).toBe('hidden')

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(document.body.style.overflow).toBe('')
  })

  it('shows whole-number discounts and French text in French mode', async () => {
    const { default: i18n } = await import('../i18n/index.js')
    await i18n.changeLanguage('fr')
    renderWithProviders(<ProductCard product={product} />)
    expect(screen.getByText('-19%')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Casque Sony WH-1000XM5' })).toBeInTheDocument()
    await i18n.changeLanguage('en')
  })
})
