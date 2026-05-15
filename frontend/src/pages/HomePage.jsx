import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Zap, Shield, RotateCcw, Truck } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

/* ── Demo products (shown when the API returns nothing) ── */
const DEMO_PRODUCTS = [
  {
    id: 'd1', slug: 'samsung-galaxy-a54',
    name: 'Samsung Galaxy A54 128Go',
    category: { name_fr: 'Smartphones', name_ar: 'هواتف ذكية', name: 'Smartphones' },
    price: 3599, final_price: 2999, discount_percent: 17, average_rating: 4.5, stock: 12,
    primary_image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80&fit=crop',
  },
  {
    id: 'd2', slug: 'macbook-air-m2',
    name: 'MacBook Air M2 256Go',
    category: { name_fr: 'Ordinateurs', name_ar: 'حواسيب', name: 'Ordinateurs' },
    price: 12999, final_price: 11499, discount_percent: 12, average_rating: 4.8, stock: 5,
    primary_image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80&fit=crop',
  },
  {
    id: 'd3', slug: 'parfum-chanel-n5',
    name: 'Chanel N°5 Eau de Parfum 100ml',
    category: { name_fr: 'Beauté', name_ar: 'الجمال والعناية', name: 'Beauté' },
    price: 1899, final_price: 1499, discount_percent: 21, average_rating: 4.7, stock: 20,
    primary_image_url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80&fit=crop',
  },
  {
    id: 'd4', slug: 'robe-elegante-femme',
    name: 'Robe Élégante Femme – Été 2024',
    category: { name_fr: 'Femme', name_ar: 'الأزياء النسائية', name: 'Femme' },
    price: 699, final_price: 499, discount_percent: 29, average_rating: 4.3, stock: 30,
    primary_image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80&fit=crop',
  },
  {
    id: 'd5', slug: 'canape-cuir-3places',
    name: 'Canapé en Cuir 3 Places Milano',
    category: { name_fr: 'Mobilier', name_ar: 'الأثاث', name: 'Mobilier' },
    price: 8499, final_price: 6999, discount_percent: 18, average_rating: 4.6, stock: 4,
    primary_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80&fit=crop',
  },
  {
    id: 'd6', slug: 'tapis-yoga-professionnel',
    name: 'Tapis de Yoga Professionnel 6mm',
    category: { name_fr: 'Sports', name_ar: 'الرياضة', name: 'Sports' },
    price: 399, final_price: 299, discount_percent: 25, average_rating: 4.4, stock: 50,
    primary_image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80&fit=crop',
  },
  {
    id: 'd7', slug: 'roman-alchimiste',
    name: 'L\'Alchimiste – Paulo Coelho',
    category: { name_fr: 'Livres', name_ar: 'الكتب', name: 'Livres' },
    price: 89, final_price: 69, discount_percent: 22, average_rating: 4.9, stock: 100,
    primary_image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80&fit=crop',
  },
  {
    id: 'd8', slug: 'montre-casio-gshock',
    name: 'Casio G-Shock DW-5600E',
    category: { name_fr: 'Accessoires', name_ar: 'الاكسسوارات', name: 'Accessoires' },
    price: 999, final_price: 799, discount_percent: 20, average_rating: 4.6, stock: 18,
    primary_image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80&fit=crop',
  },
  {
    id: 'd9', slug: 'iphone-15-pro',
    name: 'iPhone 15 Pro 256Go – Titane Naturel',
    category: { name_fr: 'Smartphones', name_ar: 'هواتف ذكية', name: 'Smartphones' },
    price: 15999, final_price: 14499, discount_percent: 9, average_rating: 4.8, stock: 7,
    primary_image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80&fit=crop',
  },
  {
    id: 'd10', slug: 'nike-air-max-270',
    name: 'Nike Air Max 270 React – Blanc/Bleu',
    category: { name_fr: 'Sports', name_ar: 'الرياضة', name: 'Sports' },
    price: 1299, final_price: 999, discount_percent: 23, average_rating: 4.5, stock: 24,
    primary_image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&fit=crop',
  },
  {
    id: 'd11', slug: 'appareil-photo-canon-eos',
    name: 'Canon EOS M50 Mark II Kit 15-45mm',
    category: { name_fr: 'Électronique', name_ar: 'الإلكترونيات', name: 'Électronique' },
    price: 6999, final_price: 5799, discount_percent: 17, average_rating: 4.7, stock: 9,
    primary_image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80&fit=crop',
  },
  {
    id: 'd12', slug: 'sneakers-adidas-ultraboost',
    name: 'Adidas Ultraboost 22 Running',
    category: { name_fr: 'Sports', name_ar: 'الرياضة', name: 'Sports' },
    price: 1599, final_price: 1199, discount_percent: 25, average_rating: 4.6, stock: 16,
    primary_image_url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80&fit=crop',
  },
]

export default function HomePage() {
  const { t } = useTranslation()
  const { user } = useSelector((s) => s.auth)
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products/featured')
        setFeatured(data.data || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const displayProducts = featured.length > 0 ? featured : DEMO_PRODUCTS

  return (
    <div style={{ background: 'var(--bg-page)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: '8px 16px 16px', boxSizing: 'border-box' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 55%, #003d7a 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: '1.5rem 2rem',
        }}>
          <div className="flex flex-col lg:flex-row items-center gap-10">

            {/* Left: text */}
            <div style={{ flex: 1, minWidth: 0, boxSizing: 'border-box' }} className="text-center lg:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.60)' }}>
                {t('home.welcome')}
              </p>
              <h1 className="text-xl lg:text-2xl font-bold leading-snug mb-3" style={{ color: '#fff' }}>
                {t('home.heroTitle')}
              </h1>
              <p className="text-xs leading-relaxed mb-6 max-w-sm mx-auto lg:mx-0" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {t('home.heroSub')}
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start" style={{ marginTop: '1rem' }}>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm transition-all"
                  style={{ background: '#fff', color: '#0066CC', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f7ff'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none' }}
                >
                  {t('home.exploreBtn')} <ArrowRight size={12} />
                </Link>
                {!user && (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-xs rounded-lg transition-all"
                    style={{ border: '1.5px solid rgba(255,255,255,0.40)', color: '#fff' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {t('home.createAccount')}
                  </Link>
                )}
              </div>
            </div>

            {/* Right: promo card */}
            <div
              className="flex-shrink-0 w-full lg:w-56"
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '1.5rem',
                textAlign: 'center',
                boxSizing: 'border-box',
                boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              }}
            >
              <p className="text-4xl font-extrabold mb-1" style={{ color: '#0066CC', lineHeight: 1 }}>-10%</p>
              <p className="text-sm font-bold mb-2" style={{ color: '#1a2332' }}>{t('home.firstOrderOff')}</p>
              <p className="text-xs mb-3" style={{ color: '#6b8caa' }}>{t('home.useCode')}</p>
              <div
                className="inline-block font-mono font-bold text-sm px-4 py-1.5 rounded-lg"
                style={{ background: '#e8f4fd', color: '#0066CC', border: '1.5px solid #90c8f0', letterSpacing: '0.08em' }}
              >
                WELCOME10
              </div>
              <p className="text-xs mt-2" style={{ color: '#9bbdd6' }}>{t('home.validFirst')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────── */}
      <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center">
            {[
              { icon: Truck,     key: 'delivery' },
              { icon: Shield,    key: 'securePay' },
              { icon: RotateCcw, key: 'freeReturns' },
              { icon: Zap,       key: 'support' },
            ].map(({ icon: Icon, key }, i) => (
              <div
                key={key}
                className="flex items-center gap-3 px-8 py-4 text-sm flex-1 justify-center"
                style={{ color: 'var(--text-2)', borderRight: i < 3 ? '1px solid var(--border-light)' : 'none' }}
              >
                <Icon size={16} className="flex-shrink-0" style={{ color: '#0066CC' }} />
                <span className="font-medium">{t(`home.${key}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Featured Products ────────────────────────────── */}
      <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 4, height: 24, background: '#0066CC', borderRadius: 3, flexShrink: 0 }} />
              <h2 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
                {featured.length > 0 ? t('home.featuredProducts') : t('home.popularProducts')}
              </h2>
            </div>
            <Link to="/products" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#0066CC' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              {t('home.viewAll')} <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', marginBottom: 20 }} />

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 12, border: '1.5px solid var(--border)', overflow: 'hidden', background: 'var(--bg-card)' }}>
                  <div className="skeleton" style={{ height: 220 }} />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-3 w-2/3" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {displayProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Promo banner ─────────────────────────────────── */}
      <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,102,204,0.06)',
            padding: '20px 24px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>{t('home.limitedOffer')}</p>
            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-1)' }}>{t('home.promoTitle')}</h2>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              {t('home.promoSub', { code: 'WELCOME10' })}
            </p>
          </div>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm" style={{ flexShrink: 0, marginLeft: 'auto' }}>
            {t('home.orderNow')} <ArrowRight size={13} />
          </Link>
        </div>
      </section>

    </div>
  )
}
