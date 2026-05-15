import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const sessionId = localStorage.getItem('session_id')
    const { data } = await api.post('/login', { ...credentials, session_id: sessionId })
    localStorage.setItem('token', data.token)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.errors || err.response?.data?.message || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/register', formData)
    localStorage.setItem('token', data.token)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.errors || err.response?.data?.message || 'Registration failed')
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/me')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/logout') } catch {}
  localStorage.removeItem('token')
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    isInitialized: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setUser: (state, { payload }) => { state.user = payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading = false; state.user = payload.user; state.token = payload.token
      })
      .addCase(loginUser.rejected, (state, { payload }) => { state.isLoading = false; state.error = payload })

      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.isLoading = false; state.user = payload.user; state.token = payload.token
      })
      .addCase(registerUser.rejected, (state, { payload }) => { state.isLoading = false; state.error = payload })

      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user = payload.user; state.isInitialized = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null; state.token = null; state.isInitialized = true
        localStorage.removeItem('token')
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.token = null; state.isInitialized = true
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
