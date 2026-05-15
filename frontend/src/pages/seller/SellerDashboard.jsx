import { useState, useEffect } from 'react'
import { Package, AlertTriangle } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Link } from 'react-router-dom'

export default function SellerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/seller/products', { params: { per_page: 5 } }),
      api.get('/seller/products', { params: { status: 'low_stock' } }),
    ]).then(([productsRes, lowStockRes]) => {
      setData({ products: productsRes.data, lowStock: lowStockRes.data.data })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner center size="lg" />

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div style={{ width: 4, height: 28, background: '#0066CC', borderRadius: 3, flexShrink: 0 }} />
        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>Seller Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '18px 20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 38, height: 38, background: 'var(--bg-accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={18} style={{ color: '#0066CC' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Total Products</span>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{data?.products?.meta?.total || 0}</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '18px 20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 38, height: 38, background: '#fff7ed', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={18} style={{ color: '#f97316' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Low Stock</span>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f97316', lineHeight: 1 }}>{data?.lowStock?.length || 0}</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Link to="/seller/products/new" className="btn-primary text-sm">+ New Product</Link>
        </div>
      </div>

      {/* Low stock alerts */}
      {data?.lowStock?.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px' }}>
          <h2 className="flex items-center gap-2 mb-4" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)' }}>
            <AlertTriangle size={16} style={{ color: '#f97316' }} />
            Stock Alerts
          </h2>
          <div className="space-y-2">
            {data.lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3" style={{ padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10 }}>
                <img src={p.primary_image_url || '/placeholder.jpg'} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={(e) => e.target.src = '/placeholder.jpg'} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a2332' }} className="truncate">{p.name}</p>
                  <p style={{ fontSize: '0.7rem', color: '#ea580c' }}>Stock: {p.stock} remaining</p>
                </div>
                <Link to={`/seller/products/${p.id}/edit`} style={{ fontSize: '0.72rem', color: '#0066CC', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>Edit →</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
