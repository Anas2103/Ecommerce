import { useState } from 'react'
import { X, ShoppingCart, Heart, Star, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/cartSlice'
import { setCartOpen } from '../store/uiSlice'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function QuickViewModal({ product, onClose }) {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { user } = useSelector((s) => s.auth)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)

  if (!product) return null

  const finalPrice = product.final_price ?? product.price
  const hasDiscount = Number(product.discount_percent) > 0
  const outOfStock = !product.stock

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    setAdding(true)
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: qty })).unwrap()
      dispatch(setCartOpen(true))
      toast.success(t('products.addedToCart'))
      onClose()
    } catch (err) { toast.error(typeof err === 'string' ? err : t('common.error')) }
    finally { setAdding(false) }
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Sign in to add to wishlist'); return }
    try {
      const { data } = await api.post('/wishlist/toggle', { product_id: product.id })
      setInWishlist(data.in_wishlist)
      toast.success(data.in_wishlist ? t('products.addedToWishlist') : t('products.removedFromWishlist'))
    } catch {}
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 18, width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', animation: 'scaleIn 0.25s ease', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-page)', border: '1.5px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
          <X size={16} />
        </button>

        <div className="quickview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* Image */}
          <div className="quickview-img" style={{ background: 'var(--bg-page)', borderRadius: '16px 0 0 16px', overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={product.primary_image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = '/placeholder.jpg'} />
            {hasDiscount && <div style={{ position: 'absolute', top: 14, left: 14, background: '#DC2626', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>-{product.discount_percent}%</div>}
          </div>

          {/* Info */}
          <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {product.category && <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', margin: 0 }}>{product.category.name}</p>}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', margin: 0, lineHeight: 1.3 }}>{product.name}</h2>

            {product.average_rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[1,2,3,4,5].map((s) => <Star key={s} size={14} fill={s <= Math.round(product.average_rating) ? '#f59e0b' : 'none'} stroke={s <= Math.round(product.average_rating) ? '#f59e0b' : 'var(--border)'} />)}
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>({product.average_rating})</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-1)' }}>{Number(finalPrice).toLocaleString()} MAD</span>
              {hasDiscount && <span style={{ fontSize: '1rem', color: 'var(--text-3)', textDecoration: 'line-through' }}>{Number(product.price).toLocaleString()} MAD</span>}
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: product.stock <= 5 ? '#f97316' : '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: product.stock <= 5 ? '#f97316' : '#16a34a', fontWeight: 500 }}>
                  {product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
                </span>
              </div>
            )}

            {product.description && (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {product.description}
              </p>
            )}

            {/* Qty + Cart */}
            {!outOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-page)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '4px 12px' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '1.1rem', lineHeight: 1, display: 'flex', padding: 2 }}>−</button>
                  <span style={{ width: 28, textAlign: 'center', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.9rem' }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '1.1rem', lineHeight: 1, display: 'flex', padding: 2 }}>+</button>
                </div>
                <button onClick={handleAddToCart} disabled={adding} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px' }}>
                  <ShoppingCart size={16} />
                  {adding ? 'Adding…' : t('products.addToCart')}
                </button>
                <button onClick={handleWishlist} style={{ width: 42, height: 42, borderRadius: 10, border: '1.5px solid var(--border)', background: inWishlist ? 'var(--bg-accent)' : 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: inWishlist ? 'var(--primary)' : 'var(--text-3)', transition: 'all 0.15s', flexShrink: 0 }}>
                  <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>
            )}

            <Link to={`/products/${product.slug}`} onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              <ExternalLink size={14} /> View full details
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes scaleIn{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}
