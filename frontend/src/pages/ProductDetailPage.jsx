import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Package, Truck, ChevronRight, Minus, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/cartSlice'
import { setCartOpen } from '../store/uiSlice'
import api from '../services/api'
import StarRating from '../components/ui/StarRating'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { user } = useSelector((s) => s.auth)
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [alsoViewed, setAlsoViewed] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [quantity, setQuantity] = useState(1)
  const [inWishlist, setInWishlist] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    setLoading(true)
    setActiveImage(0)
    setQuantity(1)
    api.get(`/products/${slug}`).then(({ data }) => {
      setProduct(data.data)
      setRelated(data.related || [])
    }).catch(() => toast.error('Product not found')).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setZoomed(false) }
    if (zoomed) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [zoomed])

  useEffect(() => {
    if (product?.id) {
      api.get(`/recommendations/also-viewed/${product.id}`).then(({ data }) => setAlsoViewed(data.data || []))
    }
  }, [product?.id])

  const handleAddToCart = async () => {
    if (!product?.stock) return
    setAddingToCart(true)
    try {
      await dispatch(addToCart({ product_id: product.id, quantity })).unwrap()
      dispatch(setCartOpen(true))
      toast.success(t('products.addedToCart'))
    } catch (err) { toast.error(err || t('common.error')) }
    finally { setAddingToCart(false) }
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Sign in to add to wishlist'); return }
    try {
      const { data } = await api.post('/wishlist/toggle', { product_id: product.id })
      setInWishlist(data.in_wishlist)
      toast.success(data.in_wishlist ? t('products.addedToWishlist') : t('products.removedFromWishlist'))
    } catch {}
  }

  const handleReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      await api.post('/reviews', { product_id: product.id, ...reviewForm })
      toast.success('Review submitted, pending approval.')
      setReviewForm({ rating: 5, title: '', comment: '' })
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')) }
    finally { setSubmittingReview(false) }
  }

  if (loading) return <LoadingSpinner center size="lg" />
  if (!product) return <div className="text-center py-20" style={{ color: 'var(--text-2)' }}>Product not found</div>

  const images = product.images || []
  const currentImage = images[activeImage]?.url || product.primary_image_url

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px 72px' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', marginBottom: 36, color: 'var(--text-3)' }}>
          <Link to="/" style={{ color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
          >Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" style={{ color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
          >{t('products.title')}</Link>
          {product.category && (
            <>
              <ChevronRight size={14} />
              <Link to={`/products?category_id=${product.category.id}`} style={{ color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
              >{product.category.name}</Link>
            </>
          )}
          <ChevronRight size={14} />
          <span style={{ fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">

          {/* Images */}
          <div className="space-y-3">
            <div
              onClick={() => setZoomed(true)}
              style={{ position: 'relative', aspectRatio: '1', maxHeight: 420, overflow: 'hidden', borderRadius: 16, background: 'var(--bg-card)', border: '1.5px solid var(--border)', cursor: 'zoom-in' }}
            >
              <img src={currentImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onError={(e) => e.target.src = '/placeholder.jpg'}
              />
              {product.discount_percent > 0 && (
                <div style={{ position: 'absolute', top: 16, left: 16 }} className="badge badge-blue">-{product.discount_percent}%</div>
              )}
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>Zoom</span>
              </div>
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      flexShrink: 0, width: 64, height: 64, overflow: 'hidden',
                      borderRadius: 10, padding: 0, cursor: 'pointer',
                      border: i === activeImage ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      boxShadow: i === activeImage ? '0 0 0 3px var(--brand-sm)' : 'none',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = '/placeholder.jpg'} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {product.category && (
              <Link
                to={`/products?category_id=${product.category.id}`}
                style={{ display: 'inline-flex', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', textDecoration: 'none', marginBottom: 14 }}
              >
                {product.category.name}
              </Link>
            )}
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-1)', margin: 0, lineHeight: 1.25, marginBottom: 16 }}>{product.name}</h1>

            {product.average_rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                <StarRating rating={product.average_rating} size={18} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>({product.reviews?.length || 0} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20 }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-1)' }}>{product.final_price?.toLocaleString()} MAD</span>
              {product.compare_price && Number(product.compare_price) > product.final_price && (
                <span style={{ fontSize: '1.25rem', textDecoration: 'line-through', color: 'var(--text-3)' }}>{Number(product.compare_price).toLocaleString()} MAD</span>
              )}
              {product.discount_percent > 0 && (
                <span className="badge badge-blue">
                  Save {(Number(product.price) - product.final_price).toLocaleString()} MAD
                </span>
              )}
            </div>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              {product.stock > 0 ? (
                <>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#16a34a' }}>
                    {product.stock <= (product.low_stock_alert || 5) ? `Low stock: ${product.stock} left` : `${t('products.inStock')} (${product.stock})`}
                  </span>
                </>
              ) : (
                <>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#dc2626' }}>{t('products.outOfStock')}</span>
                </>
              )}
            </div>

            {/* Seller */}
            {product.seller && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: 36 }}>
                <Package size={14} /> Sold by <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{product.seller.name}</span>
              </div>
            )}

            {/* Quantity + Cart */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>{t('common.quantity')}:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '4px 12px' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ width: 32, textAlign: 'center', fontWeight: 600, color: 'var(--text-1)' }}>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleAddToCart} disabled={addingToCart} className="btn-primary" style={{ flex: 1, padding: '14px 20px', fontSize: '1rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingCart size={18} />
                    {addingToCart ? t('common.loading') : t('products.addToCart')}
                  </button>
                  <button
                    onClick={handleWishlist}
                    style={{
                      padding: 14, borderRadius: 12, cursor: 'pointer',
                      border: inWishlist ? '1.5px solid var(--border-accent)' : '1.5px solid var(--border)',
                      background: inWishlist ? 'var(--bg-accent)' : 'var(--bg-card)',
                      color: inWishlist ? 'var(--primary)' : 'var(--text-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--primary)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = inWishlist ? 'var(--border-accent)' : 'var(--border)'; e.currentTarget.style.color = inWishlist ? 'var(--primary)' : 'var(--text-3)' }}
                  >
                    <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            )}

            {/* Shipping info */}
            <div style={{ paddingTop: 28, borderTop: '1.5px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: 'var(--text-2)' }}>
                <Truck size={16} style={{ color: 'var(--text-3)' }} /> Standard shipping: 29 MAD (3–5 days)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: 'var(--text-2)' }}>
                <Truck size={16} style={{ color: 'var(--text-3)' }} /> Express shipping: 59 MAD (1–2 days)
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product.tags.map((tag) => (
                  <span key={tag.id} className="badge badge-gray">{tag.tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', gap: 32, marginBottom: 32, borderBottom: '1.5px solid var(--border-light)' }}>
            {['description', 'reviews', 'specifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  paddingBottom: 16, fontSize: '0.9rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-3)',
                  marginBottom: -1.5, transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-2)' }}
                onMouseLeave={(e) => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-3)' }}
              >
                {t(`products.${tab}`)} {tab === 'reviews' && product.reviews?.length > 0 && `(${product.reviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div style={{ fontSize: '0.875rem', lineHeight: 1.75, whiteSpace: 'pre-wrap', color: 'var(--text-1)' }}>
              {product.description || 'No description available.'}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {product.average_rating > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 32, boxShadow: 'var(--shadow-card)' }} className="sm:flex-row">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3.75rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>{product.average_rating}</div>
                    <StarRating rating={product.average_rating} size={20} />
                    <div style={{ fontSize: '0.875rem', marginTop: 4, color: 'var(--text-3)' }}>out of {product.reviews?.length} reviews</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = product.rating_breakdown?.[star] || 0
                      const total = product.reviews?.length || 1
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '0.75rem', width: 16, color: 'var(--text-3)' }}>{star}★</span>
                          <div style={{ flex: 1, borderRadius: 9999, height: 8, background: 'var(--border-light)' }}>
                            <div style={{ height: 8, borderRadius: 9999, background: '#f59e0b', width: `${(count / total) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', width: 16, color: 'var(--text-3)' }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Review form */}
              {user && (
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-card)' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-1)', fontSize: '0.9375rem' }}>{t('reviews.write')}</h3>
                  <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-1)' }}>{t('reviews.rating')}</label>
                      <StarRating rating={reviewForm.rating} size={24} interactive onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                    </div>
                    <input value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder={t('reviews.titleField')} className="input" />
                    <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder={t('reviews.comment')} rows={3} className="input resize-none" />
                    <button type="submit" disabled={submittingReview} className="btn-primary" style={{ alignSelf: 'flex-start' }}>{submittingReview ? '...' : t('reviews.submit')}</button>
                  </form>
                </div>
              )}

              {/* Reviews list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {product.reviews?.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)' }}>{t('reviews.noReviews')}</p>
                ) : product.reviews?.map((review) => (
                  <div key={review.id} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <img
                        src={review.user?.avatar ? `${import.meta.env.VITE_STORAGE_URL}/${review.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&background=0D6EFD&color=fff`}
                        alt=""
                        style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>{review.user?.name}</span>
                          <StarRating rating={review.rating} size={14} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{new Date(review.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                        {review.title && <p style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: 4, color: 'var(--text-1)' }}>{review.title}</p>}
                        {review.comment && <p style={{ fontSize: '0.875rem', marginTop: 4, color: 'var(--text-2)' }}>{review.comment}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: 36, boxShadow: 'var(--shadow-card)' }}>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {product.weight && <div><dt style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>Weight</dt><dd style={{ fontWeight: 600, color: 'var(--text-1)' }}>{product.weight} kg</dd></div>}
                {product.sku && <div><dt style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>SKU</dt><dd style={{ fontWeight: 600, color: 'var(--text-1)' }}>{product.sku}</dd></div>}
                {product.attributes && Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key}>
                    <dt style={{ fontSize: '0.875rem', textTransform: 'capitalize', color: 'var(--text-3)' }}>{key}</dt>
                    <dd style={{ fontWeight: 600, color: 'var(--text-1)' }}>{String(val)}</dd>
                  </div>
                ))}
                {!product.weight && !product.sku && !product.attributes && (
                  <p style={{ gridColumn: '1 / -1', color: 'var(--text-3)' }}>No specifications available.</p>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: 28, color: 'var(--text-1)' }}>{t('products.related')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Also viewed */}
        {alsoViewed.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 24, color: 'var(--text-1)' }}>{t('products.alsoViewed')}</h2>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }}>
              {alsoViewed.map((p) => (
                <div key={p.id} style={{ flexShrink: 0, width: 192 }}><ProductCard product={p} /></div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Lightbox */}
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } } @keyframes scaleIn { from { transform: scale(0.88); opacity: 0 } to { transform: scale(1); opacity: 1 } }`}</style>
          <img
            src={currentImage}
            alt={product.name}
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              objectFit: 'contain', borderRadius: 16,
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              animation: 'scaleIn 0.25s ease',
            }}
            onError={(e) => e.target.src = '/placeholder.jpg'}
          />
          <button
            onClick={() => setZoomed(false)}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#fff', fontSize: '1.2rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >✕</button>
        </div>
      )}
    </div>
  )
}
