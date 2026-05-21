import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Clock, Tag, ArrowLeft, ArrowRight, Share2, Copy, Check } from 'lucide-react'
import api from '../services/api'

const DEMO_POSTS = {
  'top-tech-deals-2025': {
    id: 1, slug: 'top-tech-deals-2025', title: 'Top Tech Deals to Watch in 2025',
    category: 'Technology', read_time: 5, published_at: '2025-03-01',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&fit=crop',
    content: `The tech landscape in 2025 is buzzing with incredible deals. Whether you're looking for a new smartphone, laptop, or smart home gadget, this guide has you covered.

## Smartphones

The latest mid-range phones offer flagship-level performance at half the price. Look for devices with at least 128GB storage, 5G connectivity, and a 50MP+ camera system.

## Laptops

For students and professionals alike, the new generation of slim laptops offers 15+ hours of battery life without sacrificing performance. Focus on models with OLED displays and fast NVMe SSDs.

## Smart Home

Smart speakers, connected lighting, and robot vacuums have never been more affordable. Investing in a smart home ecosystem can save you hours of time each week.

## Our Top Pick

Our editors consistently recommend investing in refurbished premium devices — you get the quality of a flagship product at a significant discount, usually with a warranty included.`,
  },
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/blog/posts/${slug}`).then(({ data }) => setPost(data.data)).catch(() => {
      setPost(DEMO_POSTS[slug] || null)
    }).finally(() => setLoading(false))
  }, [slug])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!post) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)' }}>Article not found</p>
      <Link to="/blog" className="btn-primary">Back to Blog</Link>
    </div>
  )

  const paragraphs = (post.content || '').split('\n\n').filter(Boolean)

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Helmet>
        <title>{post.title} — Ecommerce.ma Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta property="og:title" content={post.title} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
      </Helmet>

      <article style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Back */}
        <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32, color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
        >
          <ArrowLeft size={15} /> Back to Blog
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 99, background: 'var(--bg-accent)', border: '1px solid var(--border-accent)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
            <Tag size={11} /> {post.category}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: '0.8rem' }}>
            <Clock size={13} /> {post.read_time} min read
          </span>
          <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
            {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1.25, marginBottom: 24 }}>{post.title}</h1>

        {/* Cover image */}
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
          <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: 440, objectFit: 'cover' }} onError={(e) => e.target.src = '/placeholder.jpg'} />
        </div>

        {/* Content */}
        <div style={{ color: 'var(--text-1)', lineHeight: 1.8, fontSize: '1rem' }}>
          {paragraphs.map((para, i) => {
            if (para.startsWith('## ')) return (
              <h2 key={i} style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-1)', margin: '36px 0 16px', paddingBottom: 8, borderBottom: '1.5px solid var(--border-light)' }}>
                {para.replace('## ', '')}
              </h2>
            )
            if (para.startsWith('# ')) return (
              <h2 key={i} style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-1)', margin: '40px 0 20px' }}>
                {para.replace('# ', '')}
              </h2>
            )
            return <p key={i} style={{ marginBottom: 20, color: 'var(--text-2)' }}>{para}</p>
          })}
        </div>

        {/* Share */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1.5px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Found this helpful?</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Share it with a friend</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copyLink} className="btn-secondary" style={{ gap: 6, fontSize: '0.82rem' }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ gap: 6, fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              <Share2 size={14} /> Share
            </a>
          </div>
        </div>

        {/* Back to blog */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> More articles
          </Link>
        </div>
      </article>
    </div>
  )
}
