import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import api from '../services/api'
import Pagination from '../components/ui/Pagination'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTranslation } from 'react-i18next'

const STATUS_STYLES = {
  pending:    { bg: '#fefce8', color: '#ca8a04',  border: '#fde047' },
  confirmed:  { bg: 'var(--bg-accent)', color: 'var(--primary)', border: 'var(--border-accent)' },
  processing: { bg: '#f0fdf4', color: '#16a34a',  border: '#bbf7d0' },
  shipped:    { bg: '#faf5ff', color: '#9333ea',  border: '#e9d5ff' },
  delivered:  { bg: '#f0fdf4', color: '#15803d',  border: '#86efac' },
  cancelled:  { bg: '#fff1f2', color: '#ef4444',  border: '#fecaca' },
  refunded:   { bg: 'var(--bg-page)', color: 'var(--text-3)', border: 'var(--border)' },
}

export default function OrdersPage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    api.get('/orders', { params: { status: statusFilter || undefined, page } })
      .then(({ data }) => { setOrders(data.data); setMeta(data.meta) })
      .finally(() => setLoading(false))
  }, [statusFilter, page])

  if (loading) return <LoadingSpinner center size="lg" />

  const card = { background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12 }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <section style={{ padding: '8px 16px 32px', boxSizing: 'border-box' }}>
        <div style={{ ...card, padding: '20px' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div style={{ width: 4, height: 28, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>{t('orders.title')}</h1>
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="input text-sm w-auto">
              <option value="">{t('common.all')}</option>
              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
                <option key={s} value={s}>{t(`orders.${s}`)}</option>
              ))}
            </select>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div style={{ width: 64, height: 64, background: 'var(--bg-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Package size={28} style={{ color: 'var(--primary)', opacity: 0.6 }} />
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>{t('orders.empty')}</p>
              <Link to="/products" className="btn-primary text-sm mt-4">{t('cart.continueShopping')}</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((order) => {
                const s = STATUS_STYLES[order.status] || STATUS_STYLES.refunded
                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-4 transition-all"
                    style={{ padding: '18px 20px', borderRadius: 12, border: '1.5px solid var(--border-light)', background: 'var(--bg-page)', textDecoration: 'none', display: 'flex' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                  >
                    <div style={{ width: 42, height: 42, background: 'var(--bg-accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>{order.order_number}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {t(`orders.${order.status}`)}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
                        {new Date(order.created_at).toLocaleDateString('en-GB')} · {order.items?.length || 0} item(s)
                      </p>
                    </div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', flexShrink: 0 }}>{Number(order.total).toLocaleString()} MAD</p>
                    <ChevronRight size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-5">
            <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
          </div>
        </div>
      </section>
    </div>
  )
}
