import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import cartReducer from './cartSlice'
import themeReducer from './themeSlice'
import uiReducer from './uiSlice'
import compareReducer from './compareSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    theme: themeReducer,
    ui: uiReducer,
    compare: compareReducer,
  },
})

export default store
