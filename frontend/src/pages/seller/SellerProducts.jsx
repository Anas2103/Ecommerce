import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import api from '../../services/api'
import Pagination from '../../components/ui/Pagination'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function SellerProducts() {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/seller/products', {
        params: { search: search || undefined, status: statusFilter || undefined, page }
      })
      setProducts(data.data)
      setMeta(data.meta)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, search, statusFilter])

  const toggleActive = async (product) => {
    try {
      await api.put(`/products/${product.id}`, { is_active: !product.is_active })
      setProducts(products.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      toast.success('Status updated')
    } catch { toast.error('Error') }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter((p) => p.id !== id))
      toast.success('Product deleted')
    } catch { toast.error('Error') }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 28, background: '#0066CC', borderRadius: 3, flexShrink: 0 }} />
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>My Products</h1>
        </div>
        <Link to="/seller/products/new" className="btn-primary text-xs flex items-center gap-1.5 py-1.5">
          <Plus size={13} /> New Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '14px 16px' }}>
        <div className="flex gap-3 flex-wrap">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search..."
            className="input text-sm max-w-xs"
          />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="input text-sm w-auto">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="low_stock">Low Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner center /> : (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-page)', borderBottom: '1.5px solid var(--border-light)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Sales', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left" style={{ padding: '10px 16px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)' }}>No products found</td></tr>
                ) : products.map((p, i) => (
                  <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--border-light)' : 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-page)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-3">
                        <img src={p.primary_image_url || '/placeholder.jpg'} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: 'var(--bg-page)' }} onError={(e) => e.target.src = '/placeholder.jpg'} />
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-1)', maxWidth: 180 }} className="truncate">{p.name}</p>
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{p.category?.name}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-1)' }}>{Number(p.price).toLocaleString()} MAD</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 600, color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f97316' : '#16a34a' }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{p.order_items_count || 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 9999, fontSize: '0.68rem', fontWeight: 700,
                        background: p.is_active ? 'rgba(22,163,74,0.1)' : 'var(--bg-page)',
                        color: p.is_active ? '#16a34a' : 'var(--text-3)',
                        border: `1px solid ${p.is_active ? 'rgba(22,163,74,0.3)' : 'var(--border)'}`,
                      }}>{p.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-1">
                        <Link to={`/seller/products/${p.id}/edit`}
                          style={{ padding: 6, borderRadius: 7, color: '#0066CC', display: 'flex', background: 'transparent' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        ><Edit size={13} /></Link>
                        <button onClick={() => toggleActive(p)}
                          style={{ padding: 6, borderRadius: 7, color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          title={p.is_active ? 'Deactivate' : 'Activate'}
                        >{p.is_active ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                        <button onClick={() => deleteProduct(p.id)}
                          style={{ padding: 6, borderRadius: 7, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        ><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
    </div>
  )
}
