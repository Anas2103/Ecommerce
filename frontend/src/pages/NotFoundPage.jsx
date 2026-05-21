import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--bg-page)' }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{ fontSize: '7rem', fontWeight: 900, color: 'var(--border-light)', lineHeight: 1, marginBottom: 8, userSelect: 'none' }}>404</div>
        <div style={{ width: 56, height: 4, background: 'var(--primary)', borderRadius: 99, margin: '0 auto 28px' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 12 }}>Page not found</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-2)', marginBottom: 36, lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px' }}>
            <Home size={16} /> Go Home
          </Link>
          <Link to="/products" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px' }}>
            <Search size={16} /> Browse Products
          </Link>
        </div>
        <button onClick={() => window.history.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-3)', textDecoration: 'underline' }}>
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    </div>
  )
}
