import api from './api'

/** Downloads a protected file through the API (sends the auth token) and saves it. */
export async function downloadFile(url, filename) {
  const { data } = await api.get(url, { responseType: 'blob' })
  const href = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(href), 1000)
}
