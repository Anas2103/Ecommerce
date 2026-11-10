export const API = process.env.E2E_API_URL || 'http://127.0.0.1:8000/api/v1'

/** Logs in through the API and returns a token for localStorage. */
export async function apiToken(request, email) {
  const res = await request.post(`${API}/login`, { data: { email, password: 'password' }, headers: { Accept: 'application/json' } })
  return (await res.json()).token
}

/** Prepares a page: hides the cookie banner and optionally logs in / sets the language. */
export async function prepare(page, { token, language } = {}) {
  await page.addInitScript(({ token, language }) => {
    localStorage.setItem('cookieConsent', 'accepted')
    if (token) localStorage.setItem('token', token)
    if (language) localStorage.setItem('language', language)
  }, { token, language })
}

export const dialog = (page) => page.locator('[role="dialog"][aria-modal="true"]:not([aria-hidden="true"])')
export const bodyOverflow = (page) => page.evaluate(() => document.body.style.overflow)
