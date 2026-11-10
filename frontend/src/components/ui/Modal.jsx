import { X } from 'lucide-react'
import { useId } from 'react'
import { createPortal } from 'react-dom'
import usePopup from '../../hooks/usePopup'

const SIZES = { sm: 448, md: 512, lg: 672, xl: 896 }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const { mounted, closing } = usePopup(isOpen, onClose)
  const titleId = useId()
  if (!mounted) return null

  return createPortal(
    <div
      className={`popup-overlay${closing ? ' is-closing' : ''}`}
      style={{ zIndex: 1000 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="popup-panel"
        style={{ width: '100%', maxWidth: SIZES[size] ?? SIZES.md, background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1.5px solid var(--border-light)' }}>
            <h3 id={titleId} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{title}</h3>
            <button type="button" className="popup-close" style={{ position: 'static' }} onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        )}
        <div style={{ padding: 20, maxHeight: '80vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>,
    document.body
  )
}
