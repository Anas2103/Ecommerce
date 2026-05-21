import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Store, Package, Star, Calendar, MapPin } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function SellerStorePage() {
  const { id } = useParams()
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/sellers/${id}`),
      api.get('/products', { params: { seller_id: id, sort, page, per_page: 12 } }),
    ]).then(([sellerRes, productsRes]) => {
      setSeller(sellerRes.data.data || sellerRes.data)
      setProducts(productsRes.data.data || [])
      setMeta(productsRes.data.meta || { current_page: 1, last_page: 1 })
    }).catch(() => {
      // fallback: try to load products even if seller endpoint fails
      api.get('/products', { params: { seller_id: id, sort, page, per_page: 12 } })
        .then(({ data }) => { setProducts(data.data || []); setMeta(data.meta || { current_page: 1, last_page: 1 }) })
    }).finally(() => setLoading(false))
  }, [id, sort, page])

  if (loading) return <LoadingSpinner center size="lg" />

  const joinedDate = seller?.created_at ? new Date(seller.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }) : null

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-btn) 0%, var(--primary-btn-hover) 100%)',
        padding: '48px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
          <svg width="100%" height="100%"><pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white"/></pattern><rect width="100%" height="100%" fill="url(#dots)"/></svg>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '-56px auto 0', padding: '0 24px 72px', position: 'relative', zIndex: 1 }}>

        {/* Seller card */}
        <div style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border-light)',
          borderRadius: 20, padding: '32px 36px',
          boxShadow: 'var(--shadow-card)', marginBottom: 40,
          display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap',
        }}>
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary-btn), var(--primary-btn-hover))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '4px solid var(--bg-card)', boxShadow: '0 4px 16px var(--brand-sm)',
            fontSize: '2rem', fontWeight: 800, color: '#fff',
          }}>
            {seller?.name ? seller.name.charAt(0).toUpperCase() : <Store size={36} color="#fff" />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>
                {seller?.name || `Seller #${id}`}
              </h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg-accent)', color: 'var(--primary)', border: '1.5px solid var(--border-accent)', borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
                <Store size={11} /> Official Store
              </span>
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
              {seller?.email && (
                <span style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>{seller.email}</span>
              )}
              {joinedDate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.84rem', color: 'var(--text-3)' }}>
                  <Calendar size={13} /> Joined {joinedDate}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{meta?.total ?? products.length}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products</div>
              </div>
              {seller?.orders_count != null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{seller.orders_count}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders</div>
                </div>
              )}
              {seller?.average_rating > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={18} fill="#f59e0b" stroke="none" /> {seller.average_rating}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 24, background: 'var(--primary)', borderRadius: 3 }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>
              Products <span style={{ fontSize: '0.84rem', color: 'var(--text-3)', fontWeight: 400 }}>({meta?.total ?? products.length})</span>
            </h2>
          </div>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            className="input text-sm"
            style={{ width: 'auto' }}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16 }}>
            <Package size={48} style={{ color: 'var(--border-light)', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: 20 }}>No products in this store yet.</p>
            <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 24px' }}>Browse All Products</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {meta.last_page > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 38, height: 38, borderRadius: 8, border: '1.5px solid',
                      borderColor: p === page ? 'var(--primary)' : 'var(--border-light)',
                      background: p === page ? 'var(--primary-btn)' : 'var(--bg-card)',
                      color: p === page ? '#fff' : 'var(--text-2)',
                      fontWeight: p === page ? 700 : 400,
                      cursor: 'pointer', fontSize: '0.875rem',
                    }}
                  >{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
