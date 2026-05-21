import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
      style={{
        position: 'fixed', bottom: 90, right: 20, zIndex: 99,
        width: 44, height: 44, borderRadius: '50%',
        background: 'var(--primary-btn)', color: '#fff',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px var(--brand-md)',
        transition: 'all 0.2s',
        animation: 'fadeInUp 0.25s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-btn-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px var(--brand-md)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary-btn)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px var(--brand-md)' }}
    >
      <ArrowUp size={18} />
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </button>
  )
}
