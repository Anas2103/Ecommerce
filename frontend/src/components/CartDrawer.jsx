import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { setCartOpen } from '../store/uiSlice'
import { updateCartItem, removeCartItem } from '../store/cartSlice'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { cartOpen } = useSelector((s) => s.ui)
  const { items, itemCount, subtotal } = useSelector((s) => s.cart)

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  const close = () => dispatch(setCartOpen(false))

  const handleUpdate = async (item, qty) => {
    if (qty < 1) return
    try { await dispatch(updateCartItem({ id: item.id, quantity: qty })).unwrap() }
    catch (err) { toast.error(err || t('common.error')) }
  }

  const handleRemove = async (id) => {
    try { await dispatch(removeCartItem(id)).unwrap() }
    catch {}
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={close}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--bg-card)', borderLeft: '1.5px solid var(--border-light)', boxShadow: '0 0 40px rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--border-light)' }}>
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={16} style={{ color: '#0066CC' }} />
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-1)' }}>{t('cart.title')}</h2>
            {itemCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, background: '#0066CC', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%' }}>
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={close}
            style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-page)'; e.currentTarget.style.color = 'var(--text-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto space-y-3" style={{ padding: '14px 16px' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-8">
              <div style={{ width: 60, height: 60, background: 'var(--bg-accent)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <ShoppingCart size={26} style={{ color: '#0066CC' }} />
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{t('cart.empty')}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 18 }}>Add products to get started</p>
              <Link to="/products" onClick={close} className="btn-primary text-xs">Browse products</Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3" style={{ padding: '12px', background: 'var(--bg-page)', borderRadius: 12, border: '1.5px solid var(--border-light)' }}>
                <img
                  src={item.product?.primary_image_url || '/placeholder.jpg'}
                  alt={item.product?.name}
                  style={{ width: 54, height: 54, objectFit: 'contain', flexShrink: 0, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}
                  onError={(e) => e.target.src = '/placeholder.jpg'}
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product?.slug}`}
                    onClick={close}
                    style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-1)', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0066CC'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-1)'}
                  >
                    {item.product?.name}
                  </Link>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0066CC', marginTop: 3 }}>
                    {(item.price * item.quantity).toLocaleString()} MAD
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 7 }}>
                      <button
                        onClick={() => handleUpdate(item, item.quantity - 1)}
                        style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', borderRadius: '5px 0 0 5px' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#0066CC'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                      >
                        <Minus size={9} />
                      </button>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-1)', width: 24, textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdate(item, item.quantity + 1)}
                        style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', borderRadius: '0 5px 5px 0' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#0066CC'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                      >
                        <Plus size={9} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 3 }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '14px 16px', borderTop: '1.5px solid var(--border-light)', background: 'var(--bg-card)' }} className="space-y-3">
            <div className="flex justify-between items-center">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{t('cart.subtotal')}</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)' }}>{subtotal?.toLocaleString()} MAD</span>
            </div>
            <Link to="/checkout" onClick={close} className="btn-primary w-full justify-center text-sm" style={{ gap: 8 }}>
              {t('cart.checkout')} <ArrowRight size={14} />
            </Link>
            <Link to="/cart" onClick={close} className="btn-secondary w-full justify-center text-xs">
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
