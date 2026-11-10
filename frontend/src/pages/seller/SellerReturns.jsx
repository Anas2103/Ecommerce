import { useState, useEffect } from 'react'
import { RotateCcw, Check, X, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  pending:  { bg: '#fefce8', color: '#ca8a04',  border: '#fde047', label: 'Pending'  },
  approved: { bg: '#f0fdf4', color: '#16a34a',  border: '#bbf7d0', label: 'Approved' },
  rejected: { bg: '#fff1f2', color: '#ef4444',  border: '#fecaca', label: 'Rejected' },
}

// The API nests related records; flatten them for display.
const normalize = (r) => ({
  ...r,
  order_number: r.order?.order_number ?? r.order_number,
  product_name: r.order_item?.product_name ?? r.product_name ?? 'Whole order',
  customer: r.user?.name ?? r.customer,
})

/** Return requests list — used by sellers (own products) and admins (all returns). */
export default function SellerReturns({ apiBase = '/seller/returns', subtitle = 'Returns for orders that contain your products.' }) {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    let stale = false
    api.get(apiBase)
      .then(({ data }) => { if (!stale) setReturns((data.data || []).map(normalize)) })
      .catch(() => { if (!stale) toast.error('Could not load return requests') })
      .finally(() => { if (!stale) setLoading(false) })
    return () => { stale = true }
  }, [apiBase])

  const handleAction = async (id, action) => {
    try {
      await api.patch(`${apiBase}/${id}`, { status: action })
      setReturns((prev) => prev.map((r) => r.id === id ? { ...r, status: action } : r))
      toast.success(`Return ${action}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the return')
    }
  }

  const displayed = filter ? returns.filter((r) => r.status === filter) : returns

  const counts = {
    pending:  returns.filter((r) => r.status === 'pending').length,
    approved: returns.filter((r) => r.status === 'approved').length,
    rejected: returns.filter((r) => r.status === 'rejected').length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Return Requests</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '4px 0 0' }}>{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { key: 'pending',  label: 'Pending',  color: '#ca8a04', bg: '#fefce8',  icon: Clock    },
          { key: 'approved', label: 'Approved', color: '#16a34a', bg: '#f0fdf4',  icon: Check    },
          { key: 'rejected', label: 'Rejected', color: '#ef4444', bg: '#fff1f2',  icon: X        },
        ].map(({ key, label, color, bg, icon: Icon }) => (
          <button key={key} onClick={() => setFilter(filter === key ? '' : key)} style={{
            background: filter === key ? bg : 'var(--bg-card)',
            border: `1.5px solid ${filter === key ? color : 'var(--border-light)'}`,
            borderRadius: 12, padding: '16px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Icon size={16} style={{ color }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>{counts[key]}</p>
          </button>
        ))}
      </div>

      {/* Returns list */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <RotateCcw size={36} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No return requests{filter ? ` with status "${filter}"` : ''}.</p>
          </div>
        ) : (
          displayed.map((ret, i) => {
            const s = STATUS_STYLES[ret.status] || STATUS_STYLES.pending
            const open = expanded === ret.id
            return (
              <div key={ret.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
                  onClick={() => setExpanded(open ? null : ret.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1)' }}>{ret.order_number}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{ret.product_name} · {ret.customer}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
                      Reason: <strong style={{ color: 'var(--text-2)' }}>{ret.reason?.replace(/_/g, ' ')}</strong> · {new Date(ret.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  {ret.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleAction(ret.id, 'approved')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 4, background: '#16a34a' }}>
                        <Check size={13} /> Approve
                      </button>
                      <button onClick={() => handleAction(ret.id, 'rejected')} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 4, color: '#ef4444', borderColor: '#fecaca' }}>
                        <X size={13} /> Reject
                      </button>
                    </div>
                  )}
                  {open ? <ChevronUp size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                </div>
                {open && ret.description && (
                  <div style={{ padding: '0 20px 16px', marginLeft: 0 }}>
                    <div style={{ background: 'var(--bg-page)', border: '1.5px solid var(--border-light)', borderRadius: 10, padding: '12px 16px' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 4 }}>Customer's description:</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-1)', lineHeight: 1.6 }}>{ret.description}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
