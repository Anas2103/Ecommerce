import { describe, expect, it, vi } from 'vitest'
import { act, render, renderHook } from '@testing-library/react'
import usePopup, { useScrollLock } from './usePopup'

describe('usePopup', () => {
  it('calls onClose on Escape only while open', () => {
    const onClose = vi.fn()
    const { rerender } = renderHook(({ open }) => usePopup(open, onClose), { initialProps: { open: true } })
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) })
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender({ open: false })
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('stays mounted while the exit animation plays, then unmounts', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ open }) => usePopup(open, () => {}, { exitMs: 200 }), { initialProps: { open: true } })
    expect(result.current).toEqual({ mounted: true, closing: false })

    rerender({ open: false })
    expect(result.current).toEqual({ mounted: true, closing: true })

    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current.mounted).toBe(false)
    vi.useRealTimers()
  })

  it('keeps the page locked until the last stacked popup closes', () => {
    function Lock({ on }) { useScrollLock(on); return null }
    const a = render(<Lock on />)
    const b = render(<Lock on />)
    expect(document.body.style.overflow).toBe('hidden')

    a.unmount()
    expect(document.body.style.overflow).toBe('hidden') // second popup still open
    b.unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
