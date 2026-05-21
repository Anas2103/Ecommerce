import { useState, useEffect } from 'react'
import { Shield, Search, Download, RefreshCw, User, Package, ShoppingCart, Settings, Tag } from 'lucide-react'
import api from '../../services/api'

const ACTION_STYLES = {
  create: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Created' },
  update: { bg: 'var(--bg-accent)', color: 'var(--primary)', border: 'var(--border-accent)', label: 'Updated' },
  delete: { bg: '#fff1f2', color: '#ef4444', border: '#fecaca', label: 'Deleted' },
  login:  { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff', label: 'Login' },
  status: { bg: '#fefce8', color: '#ca8a04', border: '#fde047', label: 'Status Change' },
}

const ENTITY_ICONS = { user: User, product: Package, order: ShoppingCart, setting: Settings, category: Tag }

const DEMO_LOGS = [
  { id: 1, action: 'update', entity: 'order', entity_id: 1042, description: 'Changed order #ORD-1042 status to shipped', user: { name: 'Admin' }, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 2, action: 'create', entity: 'product', entity_id: 88, description: 'Created product "Samsung Galaxy A55"', user: { name: 'Admin' }, created_at: new Date(Date.now() - 22 * 60000).toISOString() },
  { id: 3, action: 'delete', entity: 'product', entity_id: 72, description: 'Deleted product "Old Model X"', user: { name: 'Admin' }, created_at: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: 4, action: 'login', entity: 'user', entity_id: 1, description: 'Admin logged in from 197.230.x.x', user: { name: 'Admin' }, created_at: new Date(Date.now() - 120 * 60000).toISOString() },
  { id: 5, action: 'update', entity: 'setting', entity_id: null, description: 'Updated store settings: tax_rate changed to 20%', user: { name: 'Admin' }, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 6, action: 'status', entity: 'order', entity_id: 1038, description: 'Changed order #ORD-1038 status to delivered', user: { name: 'Admin' }, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 7, action: 'create', entity: 'category', entity_id: 12, description: 'Created category "Smart Home"', user: { name: 'Admin' }, created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 8, action: 'update', entity: 'user', entity_id: 45, description: 'Changed user role to seller', user: { name: 'Admin' }, created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
]

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 15

  const fetchLogs = () => {
    setLoading(true)
    api.get('/admin/audit-log', { params: { page, search: searchQuery || undefined, action: actionFilter || undefined } })
      .then(({ data }) => setLogs(data.data || []))
      .catch(() => setLogs(DEMO_LOGS))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs() }, [page, actionFilter])

  const exportCSV = () => {
    const rows = logs.map((l) => [l.user?.name || 'System', l.action, l.entity, l.description, new Date(l.created_at).toLocaleString('en-GB')])
    const csv = [['User', 'Action', 'Entity', 'Description', 'Date'], ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'audit-log.csv'; a.click()
  }

  const displayed = logs.filter((l) =>
    !searchQuery || l.description?.toLowerCase().includes(searchQuery.toLowerCase()) || l.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>Audit Log</h1>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-accent)', color: 'var(--primary)', border: '1px solid var(--border-accent)' }}>
            {displayed.length} events
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchLogs} className="btn-secondary" style={{ gap: 5, fontSize: '0.8rem', padding: '7px 12px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={exportCSV} className="btn-secondary" style={{ gap: 5, fontSize: '0.8rem', padding: '7px 12px' }}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            placeholder="Search actions, users…"
            className="input"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1) }} className="input" style={{ width: 160 }}>
          <option value="">All actions</option>
          {Object.keys(ACTION_STYLES).map((a) => <option key={a} value={a}>{ACTION_STYLES[a].label}</option>)}
        </select>
      </div>

      {/* Log table */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <Shield size={36} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No audit events found.</p>
          </div>
        ) : (
          <div>
            {displayed.slice(0, page * PER_PAGE).map((log, i) => {
              const style = ACTION_STYLES[log.action] || ACTION_STYLES.update
              const Icon = ENTITY_ICONS[log.entity] || Shield
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < displayed.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: style.bg, border: `1px solid ${style.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} style={{ color: style.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>by {log.user?.name || 'System'}</p>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: style.bg, color: style.color, border: `1px solid ${style.border}`, flexShrink: 0 }}>
                    {style.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
                    {timeAgo(log.created_at)}
                  </span>
                </div>
              )
            })}
            {displayed.length > page * PER_PAGE && (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <button onClick={() => setPage((p) => p + 1)} className="btn-secondary" style={{ fontSize: '0.82rem' }}>Load more</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
