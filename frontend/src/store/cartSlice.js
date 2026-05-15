import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const { data } = await api.get('/cart')
  return data.data
})

export const addToCart = createAsyncThunk('cart/add', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/add', payload)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const updateCartItem = createAsyncThunk('cart/update', async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cart/items/${id}`, { quantity })
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const removeCartItem = createAsyncThunk('cart/remove', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cart/items/${id}`)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const clearCart = createAsyncThunk('cart/clear', async () => {
  const { data } = await api.delete('/cart/clear')
  return data.data
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    itemCount: 0,
    subtotal: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCartLocal: (state) => { state.items = []; state.itemCount = 0; state.subtotal = 0 },
  },
  extraReducers: (builder) => {
    const setCart = (state, { payload }) => {
      state.items = payload?.items || []
      state.itemCount = payload?.item_count || 0
      state.subtotal = payload?.subtotal || 0
      state.isLoading = false
      state.error = null
    }
    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state) => { state.isLoading = false })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(addToCart.rejected, (state, { payload }) => { state.error = payload })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(clearCart.fulfilled, setCart)
  },
})

export const { clearCartLocal } = cartSlice.actions
export default cartSlice.reducer
