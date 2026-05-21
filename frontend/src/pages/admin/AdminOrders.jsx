import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, Trash2, CheckSquare, Square } from 'lucide-react'
import api from '../../services/api'
import Pagination from '../../components/ui/Pagination'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

function exportCSV(rows) {
  const headers = ['Order #', 'Customer', 'Email', 'Date', 'Status', 'Total (MAD)']
  const lines = [headers, ...rows.map((o) => [
    o.order_number, o.user?.name || '', o.user?.email || '',
    new Date(o.created_at).toLocaleDateString('en-GB'),
    o.status, Number(o.total).toFixed(2),
  ])].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
}

const STATUS_STYLES = {
  pending:    { bg: '#fefce8', color: '#ca8a04',  border: '#fde047' },
  confirmed:  { bg: 'var(--bg-accent)', color: 'var(--primary)', border: 'var(--border-accent)' },
  processing: { bg: '#f0fdf4', color: '#16a34a',  border: '#bbf7d0' },
  shipped:    { bg: '#faf5ff', color: '#9333ea',  border: '#e9d5ff' },
  delivered:  { bg: '#f0fdf4', color: '#15803d',  border: '#86efac' },
  cancelled:  { bg: '#fff1f2', color: '#ef4444',  border: '#fecaca' },
  refunded:   { bg: 'var(--bg-page)', color: 'var(--text-3)', border: 'var(--border)' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())
  const [bulkStatus, setBulkStatus] = useState('')

  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)))
  const toggleOne = (id) => setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const applyBulkStatus = async () => {
    if (!bulkStatus || selected.size === 0) return
    try {
      await Promise.all([...selected].map((id) => api.put(`/admin/orders/${id}/status`, { status: bulkStatus })))
      setOrders(orders.map((o) => selected.has(o.id) ? { ...o, status: bulkStatus } : o))
      setSelected(new Set()); setBulkStatus('')
      toast.success(`Updated ${selected.size} orders`)
    } catch { toast.error('Error') }
  }

  useEffect(() => {
    setLoading(true)
    api.get('/admin/orders', { params: { status: statusFilter || undefined, search: search || undefined, page } })
      .then(({ data }) => { setOrders(data.data); setMeta(data.meta) })
      .finally(() => setLoading(false))
  }, [statusFilter, search, page])

  const updateStatus = async (order, status) => {
    try {
      await api.put(`/admin/orders/${order.id}/status`, { status })
      setOrders(orders.map((o) => o.id === order.id ? { ...o, status } : o))
      toast.success('Status updated')
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap" style={{ paddingBottom: 8, gap: 10 }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>Orders</h1>
        </div>
        <button
          onClick={() => exportCSV(orders)}
          className="flex items-center gap-2"
          style={{ fontSize: '0.8rem', padding: '8px 16px', borderRadius: 8, background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', cursor: 'pointer', color: 'var(--text-2)', fontWeight: 600 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-2)' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '14px 16px' }}>
        <div className="flex gap-3 flex-wrap items-center">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search order #, customer..." className="input text-sm max-w-xs" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="input text-sm w-auto">
            <option value="">All statuses</option>
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {selected.size > 0 && (
            <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>{selected.size} selected</span>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="input text-sm w-auto">
                <option value="">Bulk status…</option>
                {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <button onClick={applyBulkStatus} disabled={!bulkStatus} className="btn-primary" style={{ fontSize: '0.78rem', padding: '7px 14px' }}>Apply</button>
            </div>
          )}
        </div>
      </div>

      {loading ? <LoadingSpinner center /> : (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-page)', borderBottom: '1.5px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', width: 40 }}>
                    <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: allSelected ? 'var(--primary)' : 'var(--text-3)', display: 'flex', padding: 0 }}>
                      {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                    </button>
                  </th>
                  {['Order', 'Customer', 'Date', 'Status', 'Total', 'Actions'].map((h) => (
                    <th key={h} className="text-left" style={{ padding: '12px 20px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const s = STATUS_STYLES[order.status] || STATUS_STYLES.refunded
                  return (
                    <tr key={order.id} style={{ borderTop: i > 0 ? '1px solid var(--border-light)' : 'none', background: selected.has(order.id) ? 'var(--bg-accent)' : 'transparent' }}
                      onMouseEnter={(e) => { if (!selected.has(order.id)) e.currentTarget.style.background = 'var(--bg-page)' }}
                      onMouseLeave={(e) => { if (!selected.has(order.id)) e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '16px 16px', width: 40 }}>
                        <button onClick={() => toggleOne(order.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: selected.has(order.id) ? 'var(--primary)' : 'var(--text-3)', display: 'flex', padding: 0 }}>
                          {selected.has(order.id) ? <CheckSquare size={15} /> : <Square size={15} />}
                        </button>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <Link to={`/orders/${order.id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>{order.order_number}</Link>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ color: 'var(--text-1)', fontWeight: 500 }}>{order.user?.name}</p>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{order.user?.email}</p>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-2)' }}>{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order, e.target.value)}
                          style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, cursor: 'pointer', outline: 'none' }}
                        >
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((st) => (
                            <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-1)' }}>{Number(order.total).toLocaleString()} MAD</td>
                      <td style={{ padding: '16px 20px' }}>
                        <Link to={`/orders/${order.id}`} style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div style={{ paddingTop: 8, paddingBottom: 8 }}>
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      </div>
    </div>
  )
}
