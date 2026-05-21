import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa_install_dismissed')) return
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('pwa_install_dismissed', '1')
  }

  if (!show || dismissed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 999, width: 'min(400px, calc(100vw - 32px))',
      background: 'var(--bg-card)', border: '1.5px solid var(--border-light)',
      borderRadius: 16, padding: '16px 20px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: 14,
      animation: 'authFadeIn 0.35s cubic-bezier(0.22,1,0.36,1)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'var(--primary-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 16px var(--primary-glow)',
      }}>
        <Smartphone size={22} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: 2 }}>
          Add to Home Screen
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
          Install for faster access & offline browsing
        </p>
      </div>
      <button
        onClick={install}
        className="btn-primary"
        style={{ fontSize: '0.78rem', padding: '7px 14px', flexShrink: 0 }}
      >
        <Download size={13} /> Install
      </button>
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center' }}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}
