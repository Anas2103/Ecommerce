import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search } from 'lucide-react'
import api from '../services/api'

const DEMO_BRANDS = [
  { id: 1, name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/200px-Samsung_Logo.svg.png', products_count: 48, category: 'Electronics' },
  { id: 2, name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/100px-Apple_logo_black.svg.png', products_count: 32, category: 'Electronics' },
  { id: 3, name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png', products_count: 124, category: 'Fashion' },
  { id: 4, name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png', products_count: 98, category: 'Fashion' },
  { id: 5, name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/LG_logo_%282015%29.svg/200px-LG_logo_%282015%29.svg.png', products_count: 35, category: 'Electronics' },
  { id: 6, name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/200px-Sony_logo.svg.png', products_count: 28, category: 'Electronics' },
  { id: 7, name: 'IKEA', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/IKEA_logo_svg.svg/200px-IKEA_logo_svg.svg.png', products_count: 76, category: 'Home' },
  { id: 8, name: "L'Oréal", logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/L%27Oreal_logo.svg/200px-L%27Oreal_logo.svg.png', products_count: 54, category: 'Beauty' },
  { id: 9, name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/100px-HP_logo_2012.svg.png', products_count: 22, category: 'Electronics' },
  { id: 10, name: 'Lenovo', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/200px-Lenovo_logo_2015.svg.png', products_count: 19, category: 'Electronics' },
  { id: 11, name: 'Huawei', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Huawei_Logo.svg/200px-Huawei_Logo.svg.png', products_count: 15, category: 'Electronics' },
  { id: 12, name: 'Philips', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Philips_logo_new.svg/200px-Philips_logo_new.svg.png', products_count: 41, category: 'Home' },
]

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    api.get('/brands').then(({ data }) => setBrands(data.data || [])).catch(() => setBrands(DEMO_BRANDS)).finally(() => setLoading(false))
  }, [])

  const filtered = brands.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const grouped = filtered.reduce((acc, brand) => {
    const cat = brand.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(brand)
    return acc
  }, {})

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Helmet>
        <title>All Brands — Ecommerce.ma</title>
        <meta name="description" content="Browse all brands available on Ecommerce.ma. Find your favourite brand and shop their products." />
      </Helmet>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 72px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-1)' }}>All Brands</h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginLeft: 14, marginBottom: 24 }}>
            {brands.length} brands available
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands…"
              className="input"
              style={{ paddingLeft: 42 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ height: 120, borderRadius: 14, background: 'var(--skeleton-base)', backgroundImage: 'linear-gradient(90deg,var(--skeleton-base),var(--skeleton-shine),var(--skeleton-base))', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '48px 0' }}>No brands found.</p>
        ) : (
          Object.entries(grouped).map(([category, categoryBrands]) => (
            <div key={category} style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 20, paddingBottom: 10, borderBottom: '1.5px solid var(--border-light)' }}>
                {category}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {categoryBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/products?brand=${encodeURIComponent(brand.name)}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: 'var(--bg-card)', border: '1.5px solid var(--border-light)',
                      borderRadius: 14, padding: '24px 20px', textAlign: 'center',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--brand-sm)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          style={{ maxHeight: 48, maxWidth: 120, objectFit: 'contain', filter: 'var(--brand-logo-filter, none)' }}
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                        />
                        <span style={{ display: 'none', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>{brand.name}</span>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: 4 }}>{brand.name}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{brand.products_count} products</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
