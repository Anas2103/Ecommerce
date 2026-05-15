import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Trash2, Plus, Minus, ShoppingBag, Tag } from 'lucide-react'
import { updateCartItem, removeCartItem, clearCart } from '../store/cartSlice'
import api from '../services/api'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function CartPage() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { items, subtotal } = useSelector((s) => s.cart)
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(null)
  const [couponData, setCouponData] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const handleUpdate = async (item, qty) => {
    if (qty < 1) return
    try { await dispatch(updateCartItem({ id: item.id, quantity: qty })).unwrap() }
    catch (err) { toast.error(err) }
  }

  const handleRemove = async (id) => {
    try { await dispatch(removeCartItem(id)).unwrap() }
    catch {}
  }

  const handleClear = async () => {
    try { await dispatch(clearCart()).unwrap() }
    catch {}
  }

  const applyCoupon = async () => {
    setApplyingCoupon(true)
    try {
      const { data } = await api.post('/cart/coupon', { code: coupon })
      setDiscount(data.discount)
      setCouponData(data.coupon)
      toast.success(`Coupon applied! -${data.discount.toLocaleString()} MAD`)
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')) }
    finally { setApplyingCoupon(false) }
  }

  const shipping = 29
  const taxableAmount = (subtotal - (discount || 0)) + shipping
  const tax = Math.round(taxableAmount * 0.2 * 100) / 100
  const total = Math.round((taxableAmount + tax) * 100) / 100

  const card = { background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px' }

  if (items.length === 0) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
        <section style={{ padding: '8px 16px 32px' }}>
          <div style={{ ...card, maxWidth: 480, margin: '60px auto', textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: 72, height: 72, background: 'var(--bg-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShoppingBag size={32} style={{ color: '#0066CC' }} />
            </div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 8 }}>{t('cart.empty')}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 24 }}>{t('cart.emptySub')}</p>
            <Link to="/products" className="btn-primary">{t('cart.continueShopping')}</Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <section style={{ padding: '8px 16px 32px', boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ width: 4, height: 28, background: '#0066CC', borderRadius: 3, flexShrink: 0 }} />
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>{t('cart.title')}</h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500 }}>{t('cart.itemsCount', { count: items.reduce((s, i) => s + i.quantity, 0) })}</span>
            </div>
            <button
              onClick={handleClear}
              style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ef4444', background: 'transparent', border: '1.5px solid #fecaca', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {t('cart.clear')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} style={{ ...card, padding: '16px', display: 'flex', gap: 16 }}>
                <img
                  src={item.product?.primary_image_url || '/placeholder.jpg'}
                  alt={item.product?.name}
                  style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 10, flexShrink: 0, background: 'var(--bg-page)' }}
                  onError={(e) => e.target.src = '/placeholder.jpg'}
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product?.slug}`}
                    style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-1)', textDecoration: 'none', display: 'block' }}
                    className="line-clamp-1"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0066CC'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-1)'}
                  >
                    {item.product?.name}
                  </Link>
                  <div className="flex items-center gap-3 mt-2">
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0066CC' }}>{item.price.toLocaleString()} MAD</span>
                    {item.product?.discount_percent > 0 && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'var(--bg-accent)', color: '#0066CC', border: '1px solid var(--border-accent)', borderRadius: 9999, padding: '1px 7px' }}>
                        -{item.product.discount_percent}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center" style={{ background: 'var(--bg-page)', border: '1.5px solid var(--border)', borderRadius: 8 }}>
                      <button
                        onClick={() => handleUpdate(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px 0 0 6px' }}
                        onMouseEnter={(e) => { if (item.quantity > 1) e.currentTarget.style.color = '#0066CC' }}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ width: 30, textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-1)' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdate(item, item.quantity + 1)}
                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0 6px 6px 0' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#0066CC'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-1)' }}>{(item.price * item.quantity).toLocaleString()} MAD</span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div style={card}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>Order Summary</h3>
              <div className="space-y-2" style={{ fontSize: '0.82rem' }}>
                {[
                  { label: t('cart.subtotal'), value: `${subtotal.toLocaleString()} MAD` },
                  discount ? { label: t('cart.discount'), value: `-${discount.toLocaleString()} MAD`, green: true } : null,
                  { label: t('cart.shipping'), value: `${shipping} MAD` },
                  { label: t('cart.tax'), value: `${tax.toLocaleString()} MAD` },
                ].filter(Boolean).map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span style={{ color: 'var(--text-3)' }}>{row.label}</span>
                    <span style={{ color: row.green ? '#16a34a' : 'var(--text-2)' }}>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between" style={{ borderTop: '1.5px solid var(--border-light)', paddingTop: 10, marginTop: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{t('cart.total')}</span>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0066CC' }}>{total.toLocaleString()} MAD</span>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div style={card}>
              <h4 className="flex items-center gap-2" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
                <Tag size={14} style={{ color: '#0066CC' }} />{t('cart.coupon')}
              </h4>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className="input text-sm flex-1"
                />
                <button onClick={applyCoupon} disabled={applyingCoupon || !coupon} className="btn-primary text-sm px-3">
                  {applyingCoupon ? '...' : t('cart.applyCoupon')}
                </button>
              </div>
              {couponData && <p style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: 8 }}>✓ Code applied: {couponData.code}</p>}
            </div>

            <Link to="/checkout" className="btn-primary w-full justify-center py-3 text-sm">{t('cart.checkout')} →</Link>
            <Link to="/products" className="btn-secondary w-full justify-center text-sm">{t('cart.continueShopping')}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
