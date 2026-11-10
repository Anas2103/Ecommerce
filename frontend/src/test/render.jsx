import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { makeStore } from '../store/index.js'

/** Renders UI with a fresh Redux store and an in-memory router (routes: the UI at "/", plus extra paths). */
export function renderWithProviders(ui, { state, route = '/', routes = {} } = {}) {
  const store = makeStore(state)
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={ui} />
          {Object.entries(routes).map(([path, el]) => <Route key={path} path={path} element={el} />)}
        </Routes>
      </MemoryRouter>
    </Provider>
  )
  return { store, ...utils }
}
