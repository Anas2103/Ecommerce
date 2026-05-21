import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) setVisible(true)
  }, [])

  const accept = () => { localStorage.setItem('cookieConsent', 'accepted'); setVisible(false) }
  const decline = () => { localStorage.setItem('cookieConsent', 'declined'); setVisible(false) }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: 680,
      background: 'var(--bg-card)', border: '1.5px solid var(--border-light)',
      borderRadius: 16, padding: '18px 44px 18px 20px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
    }}>
      <Cookie size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
      <p style={{ flex: 1, fontSize: '0.84rem', color: 'var(--text-2)', margin: 0, minWidth: 200 }}>
        We use cookies to improve your experience and analyse site traffic.{' '}
        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Learn more</a>
      </p>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={decline} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>Decline</button>
        <button onClick={accept} className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 20px' }}>Accept All</button>
      </div>
      <button onClick={decline} style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 6 }}>
        <X size={16} />
      </button>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(20px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }`}</style>
    </div>
  )
}
