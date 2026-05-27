import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Eye, GitCompare } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { addToCart } from '../store/cartSlice'
import { setCartOpen } from '../store/uiSlice'
import { toggleCompare } from '../store/compareSlice'
import QuickViewModal from './QuickViewModal'
import toast from 'react-hot-toast'

const IMG_FALLBACK = 'https://placehold.co/400x400/e8f4fd/0066CC?text=Produit'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const compareList = useSelector((s) => s.compare?.items || [])
  const isCompared = compareList.some((p) => p.id === product.id)
  const [addingToCart, setAddingToCart] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [quickView, setQuickView] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.stock) return
    setAddingToCart(true)
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: 1 })).unwrap()
      dispatch(setCartOpen(true))
      toast.success(t('products.addedToCart'))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : t('common.error'))
    } finally {
      setAddingToCart(false)
    }
  }

  const imageUrl    = imgError ? IMG_FALLBACK : (product.primary_image_url || product.images?.[0]?.url || IMG_FALLBACK)
  const finalPrice  = product.final_price ?? product.price
  const hasDiscount = Number(product.discount_percent) > 0
  const outOfStock  = !product.stock || product.stock === 0
  const catName     = product.category?.name_fr || product.category?.name || ''

  return (
    <>
    <Link
      to={`/products/${product.slug}`}
      className="product-card-link"
      onClick={(e) => { e.preventDefault(); setQuickView(true); }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card)',
        borderRadius: 12,
        border: '1.5px solid var(--border)',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-card)',
        transition: 'transform 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)'
        e.currentTarget.style.boxShadow = '0 10px 32px var(--brand-sm)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      {/* ── Image ── */}
      <div style={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden', background: 'var(--bg-page)', flexShrink: 0 }}>
        <img
          src={imageUrl}
          alt={product.name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            opacity: outOfStock ? 0.55 : 1,
          }}
        />

        {/* Discount badge */}
        {hasDiscount && !outOfStock && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: '#DC2626',
            color: '#fff',
            fontSize: '0.7rem', fontWeight: 700,
            padding: '3px 8px', borderRadius: 20,
            lineHeight: 1.4,
          }}>
            -{product.discount_percent}%
          </span>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.55)' }}>
            <span style={{ background: '#1a2332', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '6px 14px', borderRadius: 20 }}>
              {t('products.soldOut')}
            </span>
          </div>
        )}

        {/* Hover action overlay */}
        <div className="card-hover-actions" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0, transition: 'opacity 0.18s', background: 'rgba(0,0,0,0.18)', pointerEvents: 'none' }}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickView(true) }}
            title="Quick view"
            style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-1)', pointerEvents: 'auto', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-btn)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-1)' }}
          ><Eye size={15} /></button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); dispatch(toggleCompare(product)); toast.success(isCompared ? 'Removed from compare' : 'Added to compare') }}
            title={isCompared ? 'Remove from compare' : 'Compare'}
            style={{ width: 38, height: 38, borderRadius: 10, background: isCompared ? 'var(--primary-btn)' : 'var(--bg-card)', border: '1.5px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompared ? '#fff' : 'var(--text-1)', pointerEvents: 'auto', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { if (!isCompared) { e.currentTarget.style.background = 'var(--primary-btn)'; e.currentTarget.style.color = '#fff' } }}
            onMouseLeave={(e) => { if (!isCompared) { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-1)' } }}
          ><GitCompare size={15} /></button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '12px 14px 14px', borderTop: '1px solid var(--border-light)' }}>

        {/* Category */}
        {catName && (
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: 4 }}>
            {catName}
          </p>
        )}

        {/* Name */}
        <h3 style={{
          fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)',
          lineHeight: 1.45, marginBottom: 10, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.name}
        </h3>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
            {Number(finalPrice).toLocaleString('fr-MA')} MAD
          </span>
          {hasDiscount && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', textDecoration: 'line-through' }}>
              {Number(product.price).toLocaleString('fr-MA')} MAD
            </span>
          )}
        </div>

        {/* Button */}
        {!outOfStock ? (
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 12px',
              background: addingToCart ? 'var(--primary-btn-hover)' : 'var(--primary-btn)',
              color: '#fff',
              fontSize: '0.8rem', fontWeight: 700,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              boxShadow: addingToCart ? 'none' : '0 2px 8px var(--brand-md)',
              transition: 'background 0.15s, box-shadow 0.15s',
              opacity: addingToCart ? 0.85 : 1,
            }}
            onMouseEnter={(e) => { if (!addingToCart) e.currentTarget.style.background = 'var(--primary-btn-hover)' }}
            onMouseLeave={(e) => { if (!addingToCart) e.currentTarget.style.background = 'var(--primary-btn)' }}
          >
            {addingToCart
              ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              : <ShoppingCart size={13} />
            }
            {addingToCart ? t('products.adding') : t('products.addToCart')}
          </button>
        ) : (
          <div style={{
            width: '100%', padding: '9px 12px',
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 8, textAlign: 'center',
            fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 600,
          }}>
            {t('products.outOfStock')}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .product-card-link:hover .card-hover-actions { opacity: 1 !important; }
      `}</style>
    </Link>
    {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)} />}
    </>
  )
}
