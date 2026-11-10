import { useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ShoppingCart, Heart, Star, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/cartSlice'
import { setCartOpen } from '../store/uiSlice'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import api from '../services/api'
import usePopup from '../hooks/usePopup'
import { categoryName } from '../i18n/catNames'

/** Quick preview of a product. Stays mounted during its exit animation. */
export default function QuickViewModal({ product, open, onClose }) {
  const { mounted, closing } = usePopup(open, onClose)
  if (!mounted || !product) return null

  return createPortal(
    <div
      className={`popup-overlay${closing ? ' is-closing' : ''}`}
      style={{ zIndex: 1000 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <QuickViewContent product={product} onClose={onClose} />
    </div>,
    document.body
  )
}

function QuickViewContent({ product, onClose }) {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const { user } = useSelector((s) => s.auth)
  const titleId = useId()
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)

  const finalPrice = product.final_price ?? product.price
  const hasDiscount = Number(product.discount_percent) > 0
  const outOfStock = !product.stock
  const lang = i18n.language
  const name = (lang === 'fr' && product.name_fr) || product.name
  const description = (lang === 'fr' && product.description_fr) || product.description
  const category = categoryName(product.category, lang)

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: qty })).unwrap()
      onClose()
      dispatch(setCartOpen(true))
      toast.success(t('products.addedToCart'))
    } catch (err) { toast.error(typeof err === 'string' ? err : t('common.error')) }
    finally { setAdding(false) }
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Sign in to add to wishlist'); return }
    try {
      const { data } = await api.post('/wishlist/toggle', { product_id: product.id })
      setInWishlist(data.in_wishlist)
      toast.success(data.in_wishlist ? t('products.addedToWishlist') : t('products.removedFromWishlist'))
    } catch { toast.error(t('common.error')) }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="popup-panel quickview-modal-box"
      style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 18, width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.45)' }}
    >
      <button type="button" className="popup-close" onClick={onClose} aria-label="Close" autoFocus>
        <X size={16} />
      </button>

      <div className="quickview-grid" style={{ display: 'grid', gap: 0 }}>
        {/* Image */}
        <div className="quickview-img" style={{ position: 'relative', background: 'var(--bg-page)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={product.primary_image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }} />
          {hasDiscount && <div style={{ position: 'absolute', top: 14, left: 14, background: '#DC2626', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>-{Math.round(product.discount_percent)}%</div>}
        </div>

        {/* Info */}
        <div className="quickview-info" style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {category && <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', margin: 0 }}>{category}</p>}
          <h2 id={titleId} style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', margin: 0, lineHeight: 1.3, paddingRight: 36 }}>
            <Link to={`/products/${product.slug}`} onClick={onClose} className="card-name" style={{ color: 'inherit' }}>{name}</Link>
          </h2>

          {product.average_rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} aria-label={`Rated ${product.average_rating} out of 5`}>
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill={s <= Math.round(product.average_rating) ? '#f59e0b' : 'none'} stroke={s <= Math.round(product.average_rating) ? '#f59e0b' : 'var(--border)'} />)}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>({product.average_rating})</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-1)' }}>{Number(finalPrice).toLocaleString('fr-MA')} MAD</span>
            {hasDiscount && <span style={{ fontSize: '1rem', color: 'var(--text-3)', textDecoration: 'line-through' }}>{Number(product.price).toLocaleString('fr-MA')} MAD</span>}
          </div>

          {product.stock > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: product.stock <= 5 ? '#f97316' : '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: product.stock <= 5 ? '#f97316' : '#16a34a', fontWeight: 500 }}>
                {product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 600 }}>{t('products.outOfStock')}</span>
          )}

          {description && (
            <p style={{ fontSize: '0.86rem', color: 'var(--text-2)', lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {description}
            </p>
          )}

          {/* Qty + Cart */}
          {!outOfStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-page)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '4px 12px' }}>
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '1.1rem', lineHeight: 1, display: 'flex', padding: 2 }}>−</button>
                <span style={{ width: 28, textAlign: 'center', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.9rem' }} aria-live="polite">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '1.1rem', lineHeight: 1, display: 'flex', padding: 2 }}>+</button>
              </div>
              <button type="button" onClick={handleAddToCart} disabled={adding} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px' }}>
                {adding
                  ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  : <ShoppingCart size={16} />}
                {adding ? t('products.adding') : t('products.addToCart')}
              </button>
              <button type="button" onClick={handleWishlist} aria-label="Toggle wishlist" aria-pressed={inWishlist} style={{ width: 42, height: 42, borderRadius: 10, border: '1.5px solid var(--border)', background: inWishlist ? 'var(--bg-accent)' : 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: inWishlist ? 'var(--primary)' : 'var(--text-3)', transition: 'all 0.15s', flexShrink: 0 }}>
                <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          {/* Full page */}
          <Link
            to={`/products/${product.slug}`}
            onClick={onClose}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.84rem', padding: '10px 14px', textDecoration: 'none' }}
          >
            View full details <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
