import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { X, GitCompare } from 'lucide-react'
import { toggleCompare, clearCompare } from '../store/compareSlice'

export default function CompareBar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector((s) => s.compare.items)

  if (items.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'var(--bg-card)', borderTop: '2px solid var(--border-light)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      animation: 'slideUpBar 0.25s cubic-bezier(0.22,1,0.36,1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <GitCompare size={18} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>
          Compare ({items.length}/4)
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
        {items.map((p) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-page)', border: '1.5px solid var(--border-light)',
            borderRadius: 10, padding: '6px 10px', minWidth: 0,
          }}>
            <img
              src={p.primary_image_url}
              alt={p.name}
              style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
              onError={(e) => e.target.src = '/placeholder.jpg'}
            />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-1)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name}
            </span>
            <button
              onClick={() => dispatch(toggleCompare(p))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 2, flexShrink: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: 4 - items.length }).map((_, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 120, height: 46,
            background: 'var(--bg-page)', border: '1.5px dashed var(--border-light)',
            borderRadius: 10,
            fontSize: '0.72rem', color: 'var(--text-3)',
          }}>
            + Add product
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => dispatch(clearCompare())}
          style={{ fontSize: '0.8rem', padding: '8px 14px', background: 'none', border: '1.5px solid var(--border-light)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-2)' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-2)' }}
        >
          Clear
        </button>
        <button
          onClick={() => navigate('/compare')}
          className="btn-primary"
          style={{ fontSize: '0.8rem', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}
          disabled={items.length < 2}
        >
          <GitCompare size={14} /> Compare Now
        </button>
      </div>

      <style>{`@keyframes slideUpBar { from { opacity:0; transform:translateY(100%) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}
