import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../services/api'
import { makeStore } from './index'
import { fetchMe } from './authSlice'
import { addToCart } from './cartSlice'

vi.mock('../services/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('auth', () => {
  it('does not call /me for guests, but still marks auth as initialized', async () => {
    const store = makeStore()
    await store.dispatch(fetchMe())
    expect(api.get).not.toHaveBeenCalled()
    expect(store.getState().auth).toMatchObject({ user: null, isInitialized: true })
  })

  it('loads the user when a token exists', async () => {
    localStorage.setItem('token', 'abc')
    api.get.mockResolvedValue({ data: { user: { id: 1, name: 'Anas' } } })
    const store = makeStore()
    await store.dispatch(fetchMe())
    expect(api.get).toHaveBeenCalledWith('/me')
    expect(store.getState().auth.user).toEqual({ id: 1, name: 'Anas' })
  })
})

describe('cart', () => {
  it('stores the cart returned by the API after adding an item', async () => {
    api.post.mockResolvedValue({ data: { data: { items: [{ id: 3, quantity: 2 }], item_count: 2, subtotal: 398 } } })
    const store = makeStore()
    await store.dispatch(addToCart({ product_id: 9, quantity: 2 })).unwrap()
    expect(api.post).toHaveBeenCalledWith('/cart/add', { product_id: 9, quantity: 2 })
    expect(store.getState().cart).toMatchObject({ itemCount: 2, subtotal: 398 })
  })

  it('surfaces the server message when adding fails', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Not enough stock. Available: 1' } } })
    const store = makeStore()
    await expect(store.dispatch(addToCart({ product_id: 9, quantity: 5 })).unwrap()).rejects.toBe('Not enough stock. Available: 1')
  })
})
