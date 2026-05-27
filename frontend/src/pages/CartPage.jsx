import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, ShoppingCart } from 'lucide-react'
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
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  if (items.length === 0) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 96, height: 96, background: 'var(--bg-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <ShoppingCart size={40} style={{ color: 'var(--primary)', opacity: 0.7 }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 10 }}>{t('cart.empty')}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginBottom: 32, lineHeight: 1.6 }}>{t('cart.emptySub')}</p>
          <Link to="/products" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>{t('cart.continueShopping')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 56px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, background: 'var(--bg-accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={22} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2 }}>{t('cart.title')}</h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: 2 }}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444', background: 'transparent', border: '1.5px solid #fecaca', borderRadius: 10, padding: '8px 16px', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {t('cart.clear')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 36, alignItems: 'start' }} className="cart-grid">
          <style>{`
            @media (max-width: 900px) {
              .cart-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>

          {/* Items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {items.map((item) => (
              <div key={item.id} className="cart-item-card" style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-light)',
                borderRadius: 18,
                padding: '24px',
                display: 'flex',
                gap: 24,
              }}>
                {/* Image */}
                <Link to={`/products/${item.product?.slug}`} style={{ flexShrink: 0 }}>
                  <img
                    src={item.product?.primary_image_url || '/placeholder.jpg'}
                    alt={item.product?.name}
                    className="cart-item-img"
                    style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 14, background: 'var(--bg-page)', display: 'block' }}
                    onError={(e) => e.target.src = '/placeholder.jpg'}
                  />
                </Link>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <Link
                      to={`/products/${item.product?.slug}`}
                      style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)', textDecoration: 'none', lineHeight: 1.3 }}
                      className="line-clamp-2"
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-1)'}
                    >
                      {item.product?.name}
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id)}
                      style={{ flexShrink: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-3)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fff1f2' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{item.price.toLocaleString()} MAD</span>
                    {item.product?.discount_percent > 0 && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 9999, padding: '2px 8px' }}>
                        -{Math.round(item.product.discount_percent)}% OFF
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Qty stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-page)', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      <button
                        onClick={() => handleUpdate(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', color: item.quantity <= 1 ? 'var(--border)' : 'var(--text-2)', transition: 'color 0.15s' }}
                        onMouseEnter={(e) => { if (item.quantity > 1) e.currentTarget.style.color = 'var(--primary)' }}
                        onMouseLeave={(e) => { if (item.quantity > 1) e.currentTarget.style.color = 'var(--text-2)' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ width: 36, textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdate(item, item.quantity + 1)}
                        style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', transition: 'color 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-2)'}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Line total */}
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)' }}>
                      {(item.price * item.quantity).toLocaleString()} MAD
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/products"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 500, textDecoration: 'none', padding: '4px 0' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
            >
              ← {t('cart.continueShopping')}
            </Link>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 90 }}>

            {/* Coupon */}
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: '24px 28px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>
                <Tag size={15} style={{ color: 'var(--primary)' }} /> {t('cart.coupon')}
              </h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className="input text-sm flex-1"
                  style={{ borderRadius: 10 }}
                />
                <button
                  onClick={applyCoupon}
                  disabled={applyingCoupon || !coupon}
                  className="btn-primary"
                  style={{ padding: '0 16px', fontSize: '0.82rem', borderRadius: 10, flexShrink: 0 }}
                >
                  {applyingCoupon ? '...' : t('cart.applyCoupon')}
                </button>
              </div>
              {couponData && (
                <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                  ✓ Code <strong>{couponData.code}</strong> applied — -{discount?.toLocaleString()} MAD
                </p>
              )}
            </div>

            {/* Order summary */}
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 18, padding: '24px 28px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 22 }}>{t('checkout.summary')}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: t('cart.subtotal'), value: `${subtotal.toLocaleString()} MAD` },
                  discount ? { label: t('cart.discount'), value: `-${discount.toLocaleString()} MAD`, green: true } : null,
                  { label: t('cart.shipping'), value: `${shipping} MAD` },
                  { label: t('cart.tax') + ' (20%)', value: `${tax.toLocaleString()} MAD` },
                ].filter(Boolean).map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-3)' }}>{row.label}</span>
                    <span style={{ fontWeight: 500, color: row.green ? '#16a34a' : 'var(--text-2)' }}>{row.value}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1.5px solid var(--border-light)', paddingTop: 18, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>{t('cart.total')}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{total.toLocaleString()} MAD</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full justify-center"
                style={{ marginTop: 24, padding: '15px', fontSize: '0.95rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {t('cart.checkout')} <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
