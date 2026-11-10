import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import cartReducer from './cartSlice'
import themeReducer from './themeSlice'
import uiReducer from './uiSlice'
import compareReducer from './compareSlice'

export const reducer = {
  auth: authReducer,
  cart: cartReducer,
  theme: themeReducer,
  ui: uiReducer,
  compare: compareReducer,
}

/** Factory so tests can create an isolated store. */
export const makeStore = (preloadedState) => configureStore({ reducer, preloadedState })

const store = makeStore()

export default store
