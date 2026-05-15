import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './i18n/index.js'
import './index.css'
import store from './store/index.js'
import { initTheme } from './store/themeSlice.js'
import { fetchMe } from './store/authSlice.js'
import { fetchCart } from './store/cartSlice.js'
import App from './App.jsx'

store.dispatch(initTheme())
store.dispatch(fetchMe()).finally(() => store.dispatch(fetchCart()))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px' },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

