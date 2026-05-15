import axios from 'axios'

if (!localStorage.getItem('session_id')) {
  localStorage.setItem('session_id', crypto.randomUUID())
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  const lang = localStorage.getItem('language') || 'en'
  config.headers['Accept-Language'] = lang

  config.headers['X-Session-ID'] = localStorage.getItem('session_id')

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(err)
  }
)

export default api
