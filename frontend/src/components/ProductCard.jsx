import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Eye, GitCompare } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { addToCart } from '../store/cartSlice'
import { setCartOpen } from '../store/uiSlice'
import { toggleCompare } from '../store/compareSlice'
import { categoryName } from '../i18n/catNames'
import QuickViewModal from './QuickViewModal'

const IMG_FALLBACK = '/placeholder.jpg'
const formatPrice = (value) => `${Number(value).toLocaleString('fr-MA')} MAD`

/**
 * Product tile used in every grid.
 * - Clicking the image (or the eye button) opens the quick-view preview.
 * - Clicking the name opens the full product page.
 * Styles live in index.css under "Product card".
 */
export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const isCompared = useSelector((s) => (s.compare?.items || []).some((p) => p.id === product.id))
  const [adding, setAdding] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [quickView, setQuickView] = useState(false)

  const lang        = i18n.language
  const displayName = (lang === 'fr' && product.name_fr) || product.name
  const catName     = categoryName(product.category, lang)
  const imageUrl    = (!imgError && (product.primary_image_url || product.images?.[0]?.url)) || IMG_FALLBACK
  const finalPrice  = product.final_price ?? product.price
  const hasDiscount = Number(product.discount_percent) > 0
  const outOfStock  = !product.stock

  const handleAddToCart = async () => {
    if (outOfStock) return
    setAdding(true)
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: 1 })).unwrap()
      dispatch(setCartOpen(true))
      toast.success(t('products.addedToCart'))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : t('common.error'))
    } finally {
      setAdding(false)
    }
  }

  const handleCompare = () => {
    dispatch(toggleCompare(product))
    toast.success(isCompared ? 'Removed from compare' : 'Added to compare')
  }

  return (
    <>
      <article className={`product-card${outOfStock ? ' is-sold-out' : ''}`}>
        <div className="product-card__media">
          <button type="button" className="card-img-btn" onClick={() => setQuickView(true)} aria-label={`Quick view: ${displayName}`}>
            <img src={imageUrl} alt={displayName} loading="lazy" decoding="async" onError={() => setImgError(true)} />
          </button>

          {hasDiscount && !outOfStock && <span className="product-card__discount">-{Math.round(product.discount_percent)}%</span>}

          {outOfStock && (
            <div className="product-card__sold-out"><span>{t('products.soldOut')}</span></div>
          )}

          <div className="card-hover-actions product-card__actions">
            <button type="button" className="product-card__icon-btn" onClick={() => setQuickView(true)} title="Quick view" aria-label={`Quick view: ${displayName}`}>
              <Eye size={15} />
            </button>
            <button
              type="button"
              className={`product-card__icon-btn${isCompared ? ' is-active' : ''}`}
              onClick={handleCompare}
              aria-pressed={isCompared}
              title={isCompared ? 'Remove from compare' : 'Compare'}
            >
              <GitCompare size={15} />
            </button>
          </div>
        </div>

        <div className="product-card__body">
          {catName && <p className="product-card__category">{catName}</p>}

          <h3 className="product-card__name">
            <Link to={`/products/${product.slug}`} className="card-name">{displayName}</Link>
          </h3>

          <div className="product-card__price">
            <span className="product-card__price-now">{formatPrice(finalPrice)}</span>
            {hasDiscount && <span className="product-card__price-was">{formatPrice(product.price)}</span>}
          </div>

          {outOfStock ? (
            <div className="product-card__unavailable">{t('products.outOfStock')}</div>
          ) : (
            <button type="button" className="product-card__cart-btn" onClick={handleAddToCart} disabled={adding}>
              {adding ? <span className="spinner-xs" aria-hidden="true" /> : <ShoppingCart size={13} />}
              {adding ? t('products.adding') : t('products.addToCart')}
            </button>
          )}
        </div>
      </article>

      <QuickViewModal product={product} open={quickView} onClose={() => setQuickView(false)} />
    </>
  )
}
