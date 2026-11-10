import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '../i18n/index.js'

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})
