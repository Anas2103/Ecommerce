import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, Download, XCircle, ChevronRight, Truck, CreditCard, MapPin } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const STATUS_BADGE = { pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-indigo', shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red', refunded: 'badge-gray' }

export default function OrderDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.data)).finally(() => setLoading(false))
  }, [id])

  const cancelOrder = async () => {
    if (!window.confirm(t('orders.cancelConfirm'))) return
    setCancelling(true)
    try {
      const { data } = await api.post(`/orders/${id}/cancel`)
      setOrder(data.data)
      toast.success('Order cancelled')
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')) }
    finally { setCancelling(false) }
  }

  const downloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${order?.order_number || id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch { toast.error(t('common.error')) }
  }

  if (loading) return <LoadingSpinner center size="lg" />
  if (!order) return <div className="text-center py-20" style={{ color: 'var(--text-3)' }}>Order not found</div>

  const canCancel = order.status === 'pending' || order.status === 'confirmed'

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div style={{ padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', marginBottom: 8, color: 'var(--text-3)' }}>
              <Link
                to="/orders"
                style={{ color: 'var(--text-3)', transition: 'color 0.15s', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0066CC'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
              >
                {t('orders.title')}
              </Link>
              <ChevronRight size={14} />
              <span>{order.order_number}</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>{t('orders.detail')}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>{t(`orders.${order.status}`)}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>{new Date(order.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={downloadInvoice} className="btn-secondary" style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={14} /> {t('orders.downloadInvoice')}
            </button>
            {canCancel && (
              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="btn-secondary"
                style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', borderColor: '#fecaca' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
              >
                <XCircle size={14} /> {cancelling ? '...' : t('orders.cancel')}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items + Timeline */}
          <div className="md:col-span-2 space-y-4">

            {/* Order items */}
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-card)' }}>
              <h2 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-1)', fontSize: '0.9375rem' }}>{t('orders.items')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img
                      src={item.product_image || '/placeholder.jpg'}
                      alt={item.product_name}
                      style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', border: '1.5px solid var(--border-light)', flexShrink: 0 }}
                      onError={(e) => e.target.src = '/placeholder.jpg'}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', margin: 0 }}>{item.product_name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', margin: '2px 0 0' }}>×{item.quantity} · {Number(item.price).toLocaleString()} MAD</p>
                    </div>
                    <p style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '0.875rem' }}>{Number(item.total).toLocaleString()} MAD</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1.5px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>{t('cart.subtotal')}</span>
                  <span style={{ color: 'var(--text-1)' }}>{Number(order.subtotal).toLocaleString()} MAD</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>{t('cart.discount')}</span>
                    <span>-{Number(order.discount_amount).toLocaleString()} MAD</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>{t('cart.shipping')}</span>
                  <span style={{ color: 'var(--text-1)' }}>{Number(order.shipping_amount).toLocaleString()} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>{t('cart.tax')}</span>
                  <span style={{ color: 'var(--text-1)' }}>{Number(order.tax_amount).toLocaleString()} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', paddingTop: 8, borderTop: '1.5px solid var(--border-light)', color: 'var(--text-1)' }}>
                  <span>{t('cart.total')}</span>
                  <span>{Number(order.total).toLocaleString()} MAD</span>
                </div>
              </div>
            </div>

            {/* Status timeline */}
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-card)' }}>
              <h2 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-1)', fontSize: '0.9375rem' }}>History</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { status: 'pending',   label: 'Order placed',  date: order.created_at },
                  { status: 'confirmed', label: 'Confirmed',     date: order.paid_at },
                  { status: 'shipped',   label: 'Shipped',       date: order.shipped_at },
                  { status: 'delivered', label: 'Delivered',     date: order.delivered_at },
                ].map(({ status, label, date }) => {
                  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
                  const reached = statuses.indexOf(order.status) >= statuses.indexOf(status)
                  return (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, background: reached ? '#0066CC' : 'var(--border)' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: reached ? 'var(--text-1)' : 'var(--text-3)' }}>{label}</span>
                      {date && <span style={{ fontSize: '0.75rem', marginLeft: 'auto', color: 'var(--text-3)' }}>{new Date(date).toLocaleDateString('en-GB')}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {order.address && (
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-1)', fontSize: '0.875rem' }}>
                  <MapPin size={16} style={{ color: '#0066CC' }} />{t('checkout.address')}
                </h3>
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--text-2)' }}>
                  <p style={{ color: 'var(--text-1)', fontWeight: 600, margin: 0 }}>{order.address.full_name}</p>
                  <p style={{ margin: 0 }}>{order.address.address_line1}</p>
                  <p style={{ margin: 0 }}>{order.address.city}, {order.address.postal_code}</p>
                  <p style={{ margin: 0 }}>{order.address.country}</p>
                  <p style={{ margin: 0 }}>Tel: {order.address.phone}</p>
                </div>
              </div>
            )}
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-card)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-1)', fontSize: '0.875rem' }}>
                <CreditCard size={16} style={{ color: '#0066CC' }} />{t('checkout.payment')}
              </h3>
              <div style={{ fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--text-2)' }}>
                <p style={{ margin: 0 }}>Method: {order.payment_method}</p>
                {order.payment_reference && <p style={{ margin: 0 }}>Ref: {order.payment_reference}</p>}
                <p style={{ margin: 0, fontWeight: 600, color: order.payment_status === 'paid' ? '#16a34a' : '#b45309' }}>
                  {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                </p>
              </div>
            </div>
            {order.shipping_method && (
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-1)', fontSize: '0.875rem' }}>
                  <Truck size={16} style={{ color: '#0066CC' }} />{t('checkout.shipping')}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', margin: 0 }}>{order.shipping_method.name_fr || order.shipping_method.name}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
