import { useEffect, useRef, useState } from 'react'

// ── Scroll lock (shared by every popup) ──────────────────────────────
// Reference-counted so stacked popups (e.g. quick view → cart drawer) never unlock
// the page while another one is still open. Compensates for the scrollbar width
// so the page doesn't shift sideways when the scrollbar disappears.
let lockCount = 0
let saved = null

function lockScroll() {
  if (lockCount++ > 0) return
  const { body, documentElement } = document
  const scrollbar = window.innerWidth - documentElement.clientWidth
  saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
  body.style.overflow = 'hidden'
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
}

function unlockScroll() {
  if (lockCount === 0 || --lockCount > 0) return
  document.body.style.overflow = saved?.overflow ?? ''
  document.body.style.paddingRight = saved?.paddingRight ?? ''
}

export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    lockScroll()
    return unlockScroll
  }, [active])
}

/**
 * Popup lifecycle: keeps the popup mounted while its exit animation plays,
 * closes on Escape, locks page scroll and gives focus back to whatever opened it.
 *
 * Returns { mounted, closing } — render when `mounted`, add an exit class when `closing`.
 */
export default function usePopup(open, onClose, { exitMs = 180, lock = true } = {}) {
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true) // mount immediately on open (no effect round-trip)

  // Unmount once the exit animation has finished.
  useEffect(() => {
    if (open || !mounted) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const id = setTimeout(() => setMounted(false), reduce ? 0 : exitMs)
    return () => clearTimeout(id)
  }, [open, mounted, exitMs])

  // Escape to close — always calls the latest onClose.
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Return focus to the element that opened the popup.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    return () => { if (opener instanceof HTMLElement && document.contains(opener)) opener.focus({ preventScroll: true }) }
  }, [open])

  useScrollLock(lock && open)

  return { mounted, closing: mounted && !open }
}
