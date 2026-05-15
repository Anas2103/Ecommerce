import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, X } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/ui/Pagination'

export default function ProductsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta]             = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading]       = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [minPriceDraft, setMinPriceDraft] = useState('')
  const [maxPriceDraft, setMaxPriceDraft] = useState('')
  const priceTimer = useRef(null)

  const SORTS = [
    { value: 'newest',     label: t('products.newest') },
    { value: 'price_asc',  label: t('products.priceAsc') },
    { value: 'price_desc', label: t('products.priceDesc') },
    { value: 'popular',    label: t('products.popular') },
    { value: 'rating',     label: t('products.bestRated') },
  ]

  const search     = searchParams.get('search')      || ''
  const categoryId = searchParams.get('category_id') || ''
  const minPrice   = searchParams.get('min_price')   || ''
  const maxPrice   = searchParams.get('max_price')   || ''
  const sort       = searchParams.get('sort')        || 'newest'
  const page       = parseInt(searchParams.get('page') || '1')
  const inStock    = searchParams.get('in_stock') === 'true'
  const featured   = searchParams.get('featured') === 'true'

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    if (key !== 'page') p.delete('page')
    setSearchParams(p)
  }

  const setPriceParam = (key, val) => {
    if (key === 'min_price') setMinPriceDraft(val)
    else setMaxPriceDraft(val)
    clearTimeout(priceTimer.current)
    priceTimer.current = setTimeout(() => setParam(key, val), 3000)
  }

  useEffect(() => {
    setMinPriceDraft(searchParams.get('min_price') || '')
    setMaxPriceDraft(searchParams.get('max_price') || '')
  }, [searchParams.get('min_price'), searchParams.get('max_price')])

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, per_page: 24 }
    if (search)     params.search      = search
    if (categoryId) params.category_id = categoryId
    if (minPrice)   params.min_price   = minPrice
    if (maxPrice)   params.max_price   = maxPrice
    if (sort)       params.sort        = sort
    if (inStock)    params.in_stock    = 'true'
    if (featured)   params.featured    = 'true'
    api.get('/products', { params })
      .then(({ data }) => {
        setProducts(data.data || [])
        setMeta(data.meta || { current_page: 1, last_page: 1, total: 0 })
      })
      .finally(() => setLoading(false))
  }, [search, categoryId, minPrice, maxPrice, sort, page, inStock, featured])

  const activeFilters = [
    categoryId && { key: 'category_id', label: categories.find(c => c.id == categoryId)?.name || t('products.category') },
    minPrice   && { key: 'min_price',   label: `Min: ${minPrice} MAD` },
    maxPrice   && { key: 'max_price',   label: `Max: ${maxPrice} MAD` },
    inStock    && { key: 'in_stock',    label: t('products.inStock') },
    featured   && { key: 'featured',    label: t('products.featuredLabel') },
  ].filter(Boolean)

  const Sidebar = () => (
    <div className="space-y-6">

      {/* Categories */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
          {t('products.category')}
        </p>
        <div className="space-y-1">
          <button
            onClick={() => setParam('category_id', '')}
            className="w-full text-left text-xs rounded-lg transition-all"
            style={{
              padding: '7px 10px 7px 14px',
              background: !categoryId ? '#0066CC' : 'transparent',
              color: !categoryId ? '#fff' : 'var(--text-2)',
              fontWeight: !categoryId ? 700 : 400,
            }}
          >
            {t('products.allCategories')}
          </button>
          {categories.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => setParam('category_id', cat.id)}
                className="w-full text-left text-xs rounded-lg transition-all"
                style={{
                  padding: '7px 10px 7px 14px',
                  background: categoryId == cat.id ? '#0066CC' : 'transparent',
                  color: categoryId == cat.id ? '#fff' : 'var(--text-2)',
                  fontWeight: categoryId == cat.id ? 700 : 400,
                }}
              >
                {cat.name_en || cat.name_fr || cat.name}
              </button>
              {cat.children?.length > 0 && (
                <div style={{ marginLeft: 14, paddingLeft: 8, borderLeft: '1.5px solid var(--border-light)' }}>
                  {cat.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setParam('category_id', child.id)}
                      className="w-full text-left py-1.5 rounded-lg transition-all"
                      style={{
                        paddingLeft: 10,
                        fontSize: '0.72rem',
                        color: categoryId == child.id ? '#0066CC' : 'var(--text-3)',
                        fontWeight: categoryId == child.id ? 700 : 400,
                        background: categoryId == child.id ? 'var(--bg-accent)' : 'transparent',
                      }}
                    >
                      {child.name_en || child.name_fr || child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border-light)' }} />

      {/* Price */}
      <div style={{ paddingLeft: 14, paddingRight: 14 }}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-3)' }}>
          {t('products.priceRange')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] mb-1 block" style={{ color: 'var(--text-3)' }}>Min</label>
            <input type="number" value={minPriceDraft} onChange={(e) => setPriceParam('min_price', e.target.value)} placeholder="0" className="input py-1" style={{ fontSize: '0.7rem' }} />
          </div>
          <div>
            <label className="text-[9px] mb-1 block" style={{ color: 'var(--text-3)' }}>Max</label>
            <input type="number" value={maxPriceDraft} onChange={(e) => setPriceParam('max_price', e.target.value)} placeholder="∞" className="input py-1" style={{ fontSize: '0.7rem' }} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border-light)', margin: '16px 0' }} />

      {/* Options */}
      <div style={{ paddingLeft: 14 }}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-3)' }}>
          {t('products.options')}
        </p>
        <div className="space-y-4">
          {[
            { checked: inStock,  onChange: (v) => setParam('in_stock',  v ? 'true' : ''), label: t('products.inStockOnly') },
            { checked: featured, onChange: (v) => setParam('featured',  v ? 'true' : ''), label: t('products.featuredOnly') },
          ].map(({ checked, onChange, label }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer">
              <button
                type="button"
                onClick={() => onChange(!checked)}
                className="relative flex-shrink-0 transition-colors"
                style={{ width: 30, height: 17, background: checked ? '#0066CC' : 'var(--border)', borderRadius: 9999 }}
              >
                <div
                  className="absolute top-0.5 bg-white rounded-full shadow transition-transform"
                  style={{ width: 13, height: 13, transform: checked ? 'translateX(15px)' : 'translateX(2px)' }}
                />
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-2)' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <>
          <div style={{ borderTop: '1px solid var(--border-light)' }} />
          <button
            onClick={() => setSearchParams({})}
            className="w-full py-2 text-xs font-semibold rounded-lg transition-colors"
            style={{ color: '#dc2626', border: '1.5px solid #fecaca', background: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {t('products.resetFilters')}
          </button>
        </>
      )}
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <section style={{ padding: '8px 16px 16px', boxSizing: 'border-box' }}>
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px' }}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 4, height: 28, background: '#0066CC', borderRadius: 3, flexShrink: 0 }} />
              <div>
                <h1 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
                  {t('products.ourProducts')}
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {t('products.productCount', { count: meta.total })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden btn-secondary text-xs gap-1.5 py-1.5"
              >
                <SlidersHorizontal size={13} /> {t('products.filters')}
                {activeFilters.length > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 text-white text-[10px] font-bold rounded-full" style={{ background: '#0066CC' }}>
                    {activeFilters.length}
                  </span>
                )}
              </button>
              <select value={sort} onChange={(e) => setParam('sort', e.target.value)} className="input text-xs py-1.5 w-auto">
                {SORTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {activeFilters.map((f) => (
                <span key={f.key} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                  style={{ color: '#0066CC', background: 'var(--bg-accent)', border: '1.5px solid var(--border-accent)', borderRadius: 8 }}
                >
                  {f.label}
                  <button onClick={() => setParam(f.key, '')} className="ml-0.5" style={{ color: 'var(--text-3)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                  ><X size={10} /></button>
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-light)', marginBottom: 20 }} />

          {/* ── Main row: sidebar + grid ── */}
          <div className="flex gap-5">

            {/* Sidebar */}
            <aside className={`flex-shrink-0 w-60 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
              <div
                className="sticky top-36 p-4"
                style={{ background: 'var(--bg-page)', border: '1.5px solid var(--border-light)', borderRadius: 10 }}
              >
                <Sidebar />
              </div>
            </aside>

            {/* Products */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="product-grid">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} style={{ borderRadius: 12, border: '1.5px solid var(--border)', overflow: 'hidden', background: 'var(--bg-card)' }}>
                      <div className="skeleton" style={{ height: 200 }} />
                      <div className="p-3 space-y-2">
                        <div className="skeleton h-2.5 w-full" />
                        <div className="skeleton h-2.5 w-2/3" />
                        <div className="skeleton h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-24 text-center"
                  style={{ background: 'var(--bg-page)', borderRadius: 10, border: '1.5px solid var(--border-light)' }}
                >
                  <SlidersHorizontal size={32} className="mb-4" style={{ color: 'var(--border-accent)', opacity: 0.5 }} />
                  <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>{t('products.noProducts')}</p>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>{t('products.adjustFilters')}</p>
                  <button onClick={() => setSearchParams({})} className="btn-primary text-sm px-6">
                    {t('products.reset')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="product-grid">
                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                  <div className="mt-6">
                    <Pagination
                      currentPage={meta.current_page}
                      lastPage={meta.last_page}
                      onPageChange={(p) => setParam('page', p)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
