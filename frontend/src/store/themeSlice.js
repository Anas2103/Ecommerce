import { createSlice } from '@reduxjs/toolkit'

const saved        = localStorage.getItem('theme')   || 'light'
const savedPalette = localStorage.getItem('palette') || 'blue'

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: saved, palette: savedPalette },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.mode)
      document.documentElement.classList.toggle('dark', state.mode === 'dark')
    },
    togglePalette: (state) => {
      state.palette = state.palette === 'blue' ? 'neutral' : 'blue'
      localStorage.setItem('palette', state.palette)
      document.documentElement.classList.toggle('neutral', state.palette === 'neutral')
    },
    initTheme: (state) => {
      document.documentElement.classList.toggle('dark',    state.mode    === 'dark')
      document.documentElement.classList.toggle('neutral', state.palette === 'neutral')
    },
  },
})

export const { toggleTheme, togglePalette, initTheme } = themeSlice.actions
export default themeSlice.reducer
