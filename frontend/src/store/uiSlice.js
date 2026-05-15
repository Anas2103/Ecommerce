import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, mobileMenuOpen: false, chatbotOpen: false },
  reducers: {
    toggleCart: (state) => { state.cartOpen = !state.cartOpen },
    setCartOpen: (state, { payload }) => { state.cartOpen = payload },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen },
    setMobileMenuOpen: (state, { payload }) => { state.mobileMenuOpen = payload },
    toggleChatbot: (state) => { state.chatbotOpen = !state.chatbotOpen },
    setChatbotOpen: (state, { payload }) => { state.chatbotOpen = payload },
  },
})

export const { toggleCart, setCartOpen, toggleMobileMenu, setMobileMenuOpen, toggleChatbot, setChatbotOpen } = uiSlice.actions
export default uiSlice.reducer
