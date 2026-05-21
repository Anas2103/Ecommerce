import { createSlice } from '@reduxjs/toolkit'

const compareSlice = createSlice({
  name: 'compare',
  initialState: { items: [] },
  reducers: {
    toggleCompare: (state, action) => {
      const product = action.payload
      const idx = state.items.findIndex((p) => p.id === product.id)
      if (idx !== -1) {
        state.items.splice(idx, 1)
      } else if (state.items.length < 4) {
        state.items.push(product)
      }
    },
    clearCompare: (state) => { state.items = [] },
  },
})

export const { toggleCompare, clearCompare } = compareSlice.actions
export default compareSlice.reducer
