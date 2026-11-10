import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useDebounce from './useDebounce'

describe('useDebounce', () => {
  it('only updates after the value stops changing', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } })
    rerender({ v: 'ab' })
    rerender({ v: 'abc' })
    act(() => { vi.advanceTimersByTime(299) })
    expect(result.current).toBe('a')
    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current).toBe('abc')
    vi.useRealTimers()
  })
})
