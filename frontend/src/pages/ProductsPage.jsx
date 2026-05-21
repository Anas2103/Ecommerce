import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/ui/Pagination'

export default function ProductsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [categories, setCategories]     = useState([])
  const [meta, setMeta]                 = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading]           = useState(true)
  const [filterOpen, setFilterOpen]     = useState(false)
  const [minPriceDraft, setMinPriceDraft] = useState('')
  const [maxPriceDraft, setMaxPriceDraft] = useState('')
  const filterRef   = useRef(null)
  const pillsRef    = useRef(null)
  const priceTimer  = useRef(null)
  const isDragging  = useRef(false)
  const didDrag     = useRef(false)
  const dragStartX  = useRef(0)
  const dragScrollL = useRef(0)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = pillsRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  const scrollPills = (dir) => {
    const el = pillsRef.current
    if (!el) return
    el.scrollBy({ left: dir * 240, behavior: 'smooth' })
  }

  const onPillsMouseDown = (e) => {
    const el = pillsRef.current
    if (!el) return
    isDragging.current = true
    didDrag.current = false
    dragStartX.current = e.pageX - el.offsetLeft
    dragScrollL.current = el.scrollLeft
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }

  const onPillsMouseMove = (e) => {
    if (!isDragging.current) return
    const el = pillsRef.current
    if (!el) return
    const x = e.pageX - el.offsetLeft
    const dist = x - dragStartX.current
    if (Math.abs(dist) > 4) didDrag.current = true
    el.scrollLeft = dragScrollL.current - dist
  }

  const onPillsMouseUp = () => {
    isDragging.current = false
    const el = pillsRef.current
    if (el) { el.style.cursor = 'grab'; el.style.userSelect = '' }
  }

  const onPillClick = (e, cb) => {
    if (didDrag.current) { e.preventDefault(); return }
    cb()
  }

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
    priceTimer.current = setTimeout(() => setParam(key, val), 800)
  }

  useEffect(() => {
    setMinPriceDraft(searchParams.get('min_price') || '')
    setMaxPriceDraft(searchParams.get('max_price') || '')
  }, [searchParams.get('min_price'), searchParams.get('max_price')])

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data || []))
  }, [])

  useEffect(() => {
    // Check after categories render whether the pills overflow
    setTimeout(updateScrollState, 50)
  }, [categories])

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

  // Close filter popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeFilters = [
    categoryId && { key: 'category_id', label: categories.find(c => c.id == categoryId)?.name || t('products.category') },
    minPrice   && { key: 'min_price',   label: `Min: ${minPrice} MAD` },
    maxPrice   && { key: 'max_price',   label: `Max: ${maxPrice} MAD` },
    inStock    && { key: 'in_stock',    label: t('products.inStock') },
    featured   && { key: 'featured',    label: t('products.featuredLabel') },
  ].filter(Boolean)

  // Flatten: show parent categories + their children as a single list of chips
  const allCategoryChips = categories.reduce((acc, cat) => {
    acc.push(cat)
    if (cat.children?.length) acc.push(...cat.children)
    return acc
  }, [])

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px 48px' }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }}>
            {search ? `"${search}"` : t('products.ourProducts')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
            {t('products.productCount', { count: meta.total })}
          </p>
        </div>

        {/* ── Toolbar: sort + filter button ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          marginBottom: 20,
        }}>
          {/* Filter popover */}
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 16px',
                background: filterOpen ? 'var(--primary-btn)' : 'var(--bg-card)',
                color: filterOpen ? '#fff' : 'var(--text-1)',
                border: '1.5px solid',
                borderColor: filterOpen ? 'var(--primary-btn)' : 'var(--border)',
                borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                transition: 'all 0.15s',
              }}
            >
              <SlidersHorizontal size={15} />
              {t('products.filters')}
              {activeFilters.length > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 999,
                  background: filterOpen ? 'rgba(255,255,255,0.3)' : 'var(--primary-btn)',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px',
                }}>
                  {activeFilters.length}
                </span>
              )}
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {/* Dropdown panel */}
            {filterOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 35,
                width: 300,
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border)',
                borderRadius: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                padding: 20,
              }}>
                {/* Price range */}
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>
                  {t('products.priceRange')}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Min', key: 'min_price', val: minPriceDraft, ph: '0' },
                    { label: 'Max', key: 'max_price', val: maxPriceDraft, ph: '∞' },
                  ].map(({ label, key, val, ph }) => (
                    <div key={key}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{label} (MAD)</label>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => setPriceParam(key, e.target.value)}
                        placeholder={ph}
                        className="input"
                        style={{ fontSize: '0.8rem', padding: '7px 10px' }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', marginBottom: 16 }} />

                {/* Toggles */}
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>
                  {t('products.options')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { checked: inStock,  onChange: (v) => setParam('in_stock', v ? 'true' : ''), label: t('products.inStockOnly') },
                    { checked: featured, onChange: (v) => setParam('featured', v ? 'true' : ''), label: t('products.featuredOnly') },
                  ].map(({ checked, onChange, label }) => (
                    <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <button
                        type="button"
                        onClick={() => onChange(!checked)}
                        style={{
                          width: 36, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer',
                          background: checked ? 'var(--primary-btn)' : 'var(--border)',
                          position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 3, width: 14, height: 14,
                          background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          transition: 'transform 0.2s',
                          transform: checked ? 'translateX(18px)' : 'translateX(3px)',
                        }} />
                      </button>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>
                    </label>
                  ))}
                </div>

                {activeFilters.length > 0 && (
                  <>
                    <div style={{ borderTop: '1px solid var(--border-light)', margin: '16px 0' }} />
                    <button
                      onClick={() => { setSearchParams({}); setFilterOpen(false) }}
                      style={{
                        width: '100%', padding: '8px', border: '1.5px solid #fecaca',
                        background: 'transparent', borderRadius: 8, color: '#dc2626',
                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {t('products.resetFilters')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="input"
            style={{ fontSize: '0.875rem', padding: '9px 14px', width: 'auto', fontWeight: 500 }}
          >
            {SORTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>

          {/* Active filter chips */}
          {activeFilters.map((f) => (
            <span
              key={f.key}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: 'var(--bg-accent)', border: '1.5px solid var(--border-accent)',
                borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)',
              }}
            >
              {f.label}
              <button
                onClick={() => setParam(f.key, '')}
                style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.6 }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        {/* ── Category pills (horizontal scroll with arrow buttons) ── */}
        <style>{`
          .pills-track::-webkit-scrollbar { display: none; }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div style={{ position: 'relative', marginBottom: 28 }}>
          {/* Left fade + arrow */}
          {canScrollLeft && (
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 4, width: 56, zIndex: 2,
              background: 'linear-gradient(to right, var(--bg-page) 55%, transparent)',
              display: 'flex', alignItems: 'center',
            }}>
              <button
                onClick={() => scrollPills(-1)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-card)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <ChevronLeft size={15} color="var(--text-2)" />
              </button>
            </div>
          )}

          {/* Scrollable track */}
          <div
            ref={pillsRef}
            className="pills-track"
            onScroll={updateScrollState}
            onMouseDown={onPillsMouseDown}
            onMouseMove={onPillsMouseMove}
            onMouseUp={onPillsMouseUp}
            onMouseLeave={onPillsMouseUp}
            style={{
              display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
              scrollbarWidth: 'none',
              paddingLeft: canScrollLeft ? 44 : 0,
              paddingRight: canScrollRight ? 44 : 0,
              cursor: 'grab',
            }}
          >
            {[{ id: '', name: t('products.allCategories') }, ...allCategoryChips].map((cat) => {
              const active = (cat.id === '' && !categoryId) || (cat.id && categoryId == cat.id)
              return (
                <button
                  key={cat.id || 'all'}
                  onClick={(e) => onPillClick(e, () => setParam('category_id', cat.id ? String(cat.id) : ''))}
                  style={{
                    flexShrink: 0,
                    padding: '8px 18px',
                    borderRadius: 999,
                    border: '1.5px solid',
                    borderColor: active ? 'var(--primary-btn)' : 'var(--border)',
                    background: active ? 'var(--primary-btn)' : 'var(--bg-card)',
                    color: active ? '#fff' : 'var(--text-2)',
                    fontSize: '0.8rem', fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    boxShadow: active ? '0 2px 10px var(--brand-bd)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' } }}
                >
                  {cat.name_en || cat.name_fr || cat.name}
                </button>
              )
            })}
          </div>

          {/* Right fade + arrow */}
          {canScrollRight && (
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 4, width: 56, zIndex: 2,
              background: 'linear-gradient(to left, var(--bg-page) 55%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => scrollPills(1)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-card)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <ChevronRight size={15} color="var(--text-2)" />
              </button>
            </div>
          )}
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 12, border: '1.5px solid var(--border)', overflow: 'hidden', background: 'var(--bg-card)' }}>
                <div className="skeleton" style={{ height: 220 }} />
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 10, width: '100%', borderRadius: 6 }} />
                  <div className="skeleton" style={{ height: 10, width: '65%', borderRadius: 6 }} />
                  <div className="skeleton" style={{ height: 16, width: '45%', borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '80px 24px', textAlign: 'center',
            background: 'var(--bg-card)', borderRadius: 16, border: '1.5px solid var(--border-light)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
            }}>
              <SlidersHorizontal size={28} color="var(--primary)" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>{t('products.noProducts')}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginBottom: 24 }}>{t('products.adjustFilters')}</p>
            <button onClick={() => setSearchParams({})} className="btn-primary" style={{ padding: '10px 28px' }}>
              {t('products.reset')}
            </button>
          </div>
        ) : (
          <>
            <div className="product-grid" style={{ animationName: 'fadeInUp', animationDuration: '0.3s', animationFillMode: 'both' }}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div style={{ marginTop: 40 }}>
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                total={meta.total}
                onPageChange={(p) => setParam('page', p)}
              />
            </div>
          </>
        )}

      </section>
    </div>
  )
}
