import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Clock, Tag, ArrowRight, BookOpen } from 'lucide-react'
import api from '../services/api'

const DEMO_POSTS = [
  {
    id: 1, slug: 'top-tech-deals-2025', title: 'Top Tech Deals to Watch in 2025',
    excerpt: 'From smartphones to laptops, here are the best tech products at unbeatable prices this year.',
    category: 'Technology', read_time: 5, published_at: '2025-03-01',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&fit=crop',
  },
  {
    id: 2, slug: 'home-decor-trends', title: 'Home Decor Trends for a Modern Moroccan Home',
    excerpt: 'Blend traditional craftsmanship with modern minimalism. Our curated guide to the best home decor picks.',
    category: 'Home & Living', read_time: 4, published_at: '2025-02-20',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop',
  },
  {
    id: 3, slug: 'fashion-guide-spring', title: 'Spring Fashion Guide: What to Wear This Season',
    excerpt: 'Light fabrics, bold colours, and the styles that are dominating this spring in Morocco and beyond.',
    category: 'Fashion', read_time: 6, published_at: '2025-02-10',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80&fit=crop',
  },
  {
    id: 4, slug: 'buying-guide-laptops', title: 'The Complete Laptop Buying Guide for Students',
    excerpt: 'Battery life, performance, and budget — everything you need to know before buying your next laptop.',
    category: 'Technology', read_time: 8, published_at: '2025-01-28',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&fit=crop',
  },
  {
    id: 5, slug: 'skincare-routine-summer', title: '5 Skincare Essentials for the Moroccan Summer',
    excerpt: 'Protect, nourish, and glow. Our top product picks for a solid summer skincare routine.',
    category: 'Beauty', read_time: 4, published_at: '2025-01-15',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80&fit=crop',
  },
  {
    id: 6, slug: 'gift-ideas-all-occasions', title: '20 Gift Ideas for Every Occasion',
    excerpt: 'Never be stuck for ideas again. Our curated list of thoughtful gifts for birthdays, Eid, and more.',
    category: 'Lifestyle', read_time: 7, published_at: '2025-01-05',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&q=80&fit=crop',
  },
]

const CATEGORIES = ['All', 'Technology', 'Fashion', 'Home & Living', 'Beauty', 'Lifestyle']

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/blog/posts').then(({ data }) => setPosts(data.data || [])).catch(() => setPosts(DEMO_POSTS)).finally(() => setLoading(false))
  }, [])

  const displayed = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory)
  const [featured, ...rest] = displayed

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Helmet>
        <title>Blog — Ecommerce.ma</title>
        <meta name="description" content="Guides d'achat, tendances mode, tech et lifestyle. Tout ce dont vous avez besoin pour faire les meilleurs choix." />
      </Helmet>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 72px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '6px 16px', borderRadius: 99, background: 'var(--bg-accent)', border: '1px solid var(--border-accent)' }}>
            <BookOpen size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Our Blog</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1.2, marginBottom: 16 }}>
            Buying Guides & Trends
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-3)', maxWidth: 520, margin: '0 auto' }}>
            Expert advice, product guides, and lifestyle inspiration — all in one place.
          </p>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 18px', borderRadius: 99, border: '1.5px solid',
                borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
                background: activeCategory === cat ? 'var(--primary-btn)' : 'var(--bg-card)',
                color: activeCategory === cat ? '#fff' : 'var(--text-2)',
                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-card)', border: '1.5px solid var(--border-light)' }}>
                <div style={{ height: 200, background: 'var(--skeleton-base)', backgroundImage: 'linear-gradient(90deg,var(--skeleton-base),var(--skeleton-shine),var(--skeleton-base))', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'var(--skeleton-base)', backgroundImage: 'linear-gradient(90deg,var(--skeleton-base),var(--skeleton-shine),var(--skeleton-base))', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                  <div style={{ height: 20, borderRadius: 6, background: 'var(--skeleton-base)', backgroundImage: 'linear-gradient(90deg,var(--skeleton-base),var(--skeleton-shine),var(--skeleton-base))', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '48px 0' }}>No posts in this category yet.</p>
        ) : (
          <div>
            {/* Featured */}
            {featured && (
              <Link to={`/blog/${featured.slug}`} style={{ display: 'block', textDecoration: 'none', marginBottom: 32 }}>
                <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-card)', display: 'grid', gridTemplateColumns: '1fr 1fr', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,102,204,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <img src={featured.image} alt={featured.title} style={{ width: '100%', height: 320, objectFit: 'cover' }} onError={(e) => e.target.src = '/placeholder.jpg'} />
                  <div style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                      <Tag size={12} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{featured.category}</span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <Clock size={12} style={{ color: 'var(--text-3)' }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{featured.read_time} min read</span>
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.3, marginBottom: 14 }}>{featured.title}</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 24 }}>{featured.excerpt}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                      Read article <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {rest.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <article style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-card)', height: '100%', transition: 'box-shadow 0.2s, transform 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,102,204,0.13)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img src={post.image} alt={post.title} style={{ width: '100%', height: 200, objectFit: 'cover', transition: 'transform 0.35s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onError={(e) => e.target.src = '/placeholder.jpg'}
                      />
                      <span style={{ position: 'absolute', top: 12, left: 12, padding: '3px 10px', borderRadius: 99, background: 'var(--primary-btn)', color: '#fff', fontSize: '0.68rem', fontWeight: 700 }}>{post.category}</span>
                    </div>
                    <div style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Clock size={12} style={{ color: 'var(--text-3)' }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{post.read_time} min · {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4, marginBottom: 8 }}>{post.title}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{post.excerpt}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
