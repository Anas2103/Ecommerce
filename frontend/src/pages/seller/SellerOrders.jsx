import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Pagination from '../../components/ui/Pagination'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const STATUS_STYLES = {
  pending:    { bg: '#fefce8', color: '#ca8a04',  border: '#fde047' },
  confirmed:  { bg: 'var(--bg-accent)', color: '#0066CC', border: 'var(--border-accent)' },
  processing: { bg: '#f0fdf4', color: '#16a34a',  border: '#bbf7d0' },
  shipped:    { bg: '#faf5ff', color: '#9333ea',  border: '#e9d5ff' },
  delivered:  { bg: '#f0fdf4', color: '#15803d',  border: '#86efac' },
  cancelled:  { bg: '#fff1f2', color: '#ef4444',  border: '#fecaca' },
  refunded:   { bg: 'var(--bg-page)', color: 'var(--text-3)', border: 'var(--border)' },
}

export default function SellerOrders() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    api.get('/seller/orders', { params: { status: statusFilter || undefined, page } })
      .then(({ data }) => { setOrders(data.data); setMeta(data.meta) })
      .finally(() => setLoading(false))
  }, [statusFilter, page])

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div style={{ width: 4, height: 28, background: '#0066CC', borderRadius: 3, flexShrink: 0 }} />
        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>My Orders</h1>
      </div>

      {/* Filter */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '14px 16px' }}>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="input text-sm w-auto">
          <option value="">All statuses</option>
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner center /> : (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-page)', borderBottom: '1.5px solid var(--border-light)' }}>
                  {['Order', 'Customer', 'Items', 'Date', 'Total', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left" style={{ padding: '10px 16px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)' }}>No orders found</td></tr>
                ) : orders.map((order, i) => {
                  const s = STATUS_STYLES[order.status] || STATUS_STYLES.refunded
                  return (
                    <tr key={order.id} style={{ borderTop: i > 0 ? '1px solid var(--border-light)' : 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-page)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <Link to={`/orders/${order.id}`} style={{ fontWeight: 600, color: '#0066CC', textDecoration: 'none' }}>{order.order_number}</Link>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ color: 'var(--text-1)', fontWeight: 500 }}>{order.user?.name}</p>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{order.user?.email}</p>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{order.items_count || order.items?.length || '-'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-1)' }}>{Number(order.total).toLocaleString()} MAD</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 9999, fontSize: '0.68rem', fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Link to={`/orders/${order.id}`} style={{ fontSize: '0.72rem', color: '#0066CC', fontWeight: 600, textDecoration: 'none' }}>View →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
    </div>
  )
}
