import { useEffect, useState } from 'react'

// Returns `value` once it has stopped changing for `delay` ms.
// Used to avoid firing an API request on every keystroke in search inputs.
export default function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
