import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Zap, Shield, RotateCcw, Truck, Flame } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

function useCountdown() {
  const getRemaining = () => {
    const now = new Date()
    const midnight = new Date(now); midnight.setHours(24, 0, 0, 0)
    const diff = Math.max(0, Math.floor((midnight - now) / 1000))
    return { h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 }
  }
  const [time, setTime] = useState(getRemaining)
  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

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
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [flashProducts, setFlashProducts] = useState([])
  const countdown = useCountdown()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products/featured')
        setFeatured(data.data || [])
      } catch {}
      finally { setLoading(false) }
    }
    const loadFlash = async () => {
      try {
        const { data } = await api.get('/products', { params: { sort: 'discount', per_page: 8 } })
        setFlashProducts((data.data || []).filter((p) => p.discount_percent > 0).slice(0, 8))
      } catch {}
    }
    load()
    loadFlash()
    try {
      const rv = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      setRecentlyViewed(rv)
    } catch {}
  }, [])

  const displayProducts = featured.length > 0 ? featured : DEMO_PRODUCTS

  return (
    <div style={{ background: 'var(--bg-page)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: '8px 16px 16px', boxSizing: 'border-box' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-btn) 0%, var(--primary-btn-hover) 100%)',
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
                  className="inline-flex items-center justify-center gap-2 font-semibold transition-all"
                  style={{ background: '#fff', color: 'var(--primary-btn)', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', padding: '12px 28px', fontSize: '0.95rem' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none' }}
                >
                  {t('home.exploreBtn')} <ArrowRight size={15} />
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
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 12,
                padding: '1.5rem',
                textAlign: 'center',
                boxSizing: 'border-box',
                boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              }}
            >
              <p className="text-4xl font-extrabold mb-1" style={{ color: 'var(--primary)', lineHeight: 1 }}>-10%</p>
              <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-1)' }}>{t('home.firstOrderOff')}</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>{t('home.useCode')}</p>
              <div
                className="inline-block font-mono font-bold rounded-lg"
                style={{ background: 'var(--bg-accent)', color: 'var(--primary)', border: '1.5px solid var(--border-accent)', letterSpacing: '0.1em', padding: '10px 22px', fontSize: '1rem' }}
              >
                WELCOME10
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>{t('home.validFirst')}</p>
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
                <Icon size={16} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
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
              <div style={{ width: 4, height: 24, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
              <h2 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
                {featured.length > 0 ? t('home.featuredProducts') : t('home.popularProducts')}
              </h2>
            </div>
            <Link to="/products" className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}
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

      {/* ── Flash Sale ───────────────────────────────────── */}
      {(flashProducts.length > 0 || true) && (
        <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 24, background: '#ef4444', borderRadius: 3, flexShrink: 0 }} />
                <Flame size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>{t('home.flashSale')}</h2>
              </div>
              {/* Countdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500 }}>{t('home.flashSaleEnds')}:</span>
                {[
                  { val: countdown.h, label: 'h' },
                  { val: countdown.m, label: 'm' },
                  { val: countdown.s, label: 's' },
                ].map(({ val, label }, i) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {i > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>:</span>}
                    <span style={{
                      minWidth: 32, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: '0.8125rem',
                      borderRadius: 6, fontVariantNumeric: 'tabular-nums',
                    }}>
                      {String(val).padStart(2, '0')}{label}
                    </span>
                  </span>
                ))}
              </div>
              <Link to="/products?sort=discount" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ef4444', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                {t('home.viewAll')} <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ borderTop: '1px solid var(--border-light)', marginBottom: 16 }} />
            {flashProducts.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)', fontSize: '0.875rem' }}>{t('home.flashSaleEmpty')}</p>
            ) : (
              <div className="product-grid">
                {flashProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Recently Viewed ──────────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{t('home.recentlyViewed')}</h2>
              </div>
              <button
                onClick={() => { localStorage.removeItem('recentlyViewed'); setRecentlyViewed([]) }}
                style={{ fontSize: '0.72rem', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >{t('common.clear')}</button>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {recentlyViewed.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  style={{ flexShrink: 0, width: 140, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8, padding: 10, background: 'var(--bg-page)', border: '1.5px solid var(--border-light)', borderRadius: 10, transition: 'border-color 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                >
                  <img
                    src={p.primary_image_url}
                    alt={p.name}
                    style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 7 }}
                    onError={(e) => e.target.src = '/placeholder.jpg'}
                  />
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-1)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{Number(p.final_price).toLocaleString()} MAD</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Promo banner ─────────────────────────────────── */}
      <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 2px 12px var(--brand-sm)',
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
