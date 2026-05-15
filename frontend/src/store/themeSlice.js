import { createSlice } from '@reduxjs/toolkit'

const saved = localStorage.getItem('theme') || 'light'

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: saved },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.mode)
      document.documentElement.classList.toggle('dark', state.mode === 'dark')
    },
    initTheme: (state) => {
      document.documentElement.classList.toggle('dark', state.mode === 'dark')
    },
  },
})

export const { toggleTheme, initTheme } = themeSlice.actions
export default themeSlice.reducer
