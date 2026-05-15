import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTranslation } from 'react-i18next'

export default function WishlistPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/wishlist').then(({ data }) => setItems(data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner center size="lg" />

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <section style={{ padding: '8px 16px 32px', boxSizing: 'border-box' }}>
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px' }}>

          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: 4, height: 28, background: '#0066CC', borderRadius: 3, flexShrink: 0 }} />
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>{t('wishlist.title')}</h1>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div style={{ width: 64, height: 64, background: 'var(--bg-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Heart size={28} style={{ color: '#0066CC', opacity: 0.6 }} />
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>{t('wishlist.empty')}</p>
              <Link to="/products" className="btn-primary text-sm mt-4">{t('cart.continueShopping')}</Link>
            </div>
          ) : (
            <div className="product-grid">
              {items.map((item) => item.product && <ProductCard key={item.id} product={item.product} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
