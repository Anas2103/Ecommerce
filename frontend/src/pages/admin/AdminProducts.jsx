import { useState, useEffect } from 'react'
import { Trash2, Eye, EyeOff, Download, CheckSquare, Square } from 'lucide-react'
import api from '../../services/api'
import Pagination from '../../components/ui/Pagination'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

function exportCSV(rows) {
  const headers = ['Name', 'SKU', 'Category', 'Price (MAD)', 'Stock', 'Sold', 'Status']
  const lines = [headers, ...rows.map((p) => [
    p.name, p.sku || '', p.category?.name || '',
    Number(p.price).toFixed(2), p.stock, p.order_items_count ?? 0, p.is_active ? 'Active' : 'Inactive',
  ])].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `products_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())

  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)))
  const toggleOne = (id) => setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} products?`)) return
    try {
      await Promise.all([...selected].map((id) => api.delete(`/products/${id}`)))
      setProducts(products.filter((p) => !selected.has(p.id)))
      setSelected(new Set())
      toast.success(`Deleted ${selected.size} products`)
    } catch { toast.error('Error') }
  }

  const bulkToggle = async (activate) => {
    try {
      await Promise.all([...selected].map((id) => api.put(`/products/${id}`, { is_active: activate })))
      setProducts(products.map((p) => selected.has(p.id) ? { ...p, is_active: activate } : p))
      setSelected(new Set())
      toast.success(`${activate ? 'Activated' : 'Deactivated'} ${selected.size} products`)
    } catch { toast.error('Error') }
  }

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/products', { params: { search: search || undefined, page } })
      setProducts(data.data)
      setMeta(data.meta)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, search])

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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap" style={{ paddingBottom: 8, gap: 10 }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>Products</h1>
        </div>
        <button
          onClick={() => exportCSV(products)}
          className="flex items-center gap-2"
          style={{ fontSize: '0.8rem', padding: '8px 16px', borderRadius: 8, background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', cursor: 'pointer', color: 'var(--text-2)', fontWeight: 600 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-2)' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '14px 16px' }}>
        <div className="flex gap-3 flex-wrap items-center">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search products..." className="input text-sm max-w-xs" />
          {selected.size > 0 && (
            <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>{selected.size} selected</span>
              <button onClick={() => bulkToggle(true)} style={{ fontSize: '0.78rem', padding: '7px 14px', borderRadius: 8, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', cursor: 'pointer', color: '#16a34a', fontWeight: 600 }}>Activate</button>
              <button onClick={() => bulkToggle(false)} style={{ fontSize: '0.78rem', padding: '7px 14px', borderRadius: 8, background: 'var(--bg-page)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-3)', fontWeight: 600 }}>Deactivate</button>
              <button onClick={bulkDelete} className="flex items-center gap-1" style={{ fontSize: '0.78rem', padding: '7px 14px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fecaca', cursor: 'pointer', color: '#ef4444', fontWeight: 600 }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? <LoadingSpinner center /> : (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-page)', borderBottom: '1.5px solid var(--border-light)' }}>
                  <th style={{ padding: '10px 12px', width: 40 }}>
                    <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: allSelected ? 'var(--primary)' : 'var(--text-3)', display: 'flex', padding: 0 }}>
                      {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                    </button>
                  </th>
                  {['Product', 'Category', 'Price', 'Stock', 'Sold', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left" style={{ padding: '10px 16px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--border-light)' : 'none', background: selected.has(p.id) ? 'var(--bg-accent)' : 'transparent' }}
                    onMouseEnter={(e) => { if (!selected.has(p.id)) e.currentTarget.style.background = 'var(--bg-page)' }}
                    onMouseLeave={(e) => { if (!selected.has(p.id)) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '12px 12px', width: 40 }}>
                      <button onClick={() => toggleOne(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: selected.has(p.id) ? 'var(--primary)' : 'var(--text-3)', display: 'flex', padding: 0 }}>
                        {selected.has(p.id) ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-3">
                        <img src={p.primary_image_url || '/placeholder.jpg'} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-light)' }} onError={(e) => e.target.src = '/placeholder.jpg'} />
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 192 }}>{p.name}</p>
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{p.category?.name}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-1)' }}>{Number(p.price).toLocaleString()} MAD</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 600, color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : '#16a34a' }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{p.order_items_count || 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                        background: p.is_active ? 'rgba(22,163,74,0.1)' : 'var(--bg-page)',
                        color: p.is_active ? '#16a34a' : 'var(--text-3)',
                        border: `1px solid ${p.is_active ? 'rgba(22,163,74,0.3)' : 'var(--border)'}`,
                      }}>{p.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleActive(p)}
                          style={{ padding: 6, borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: p.is_active ? '#16a34a' : 'var(--text-3)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          title={p.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => deleteProduct(p.id)}
                          style={{ padding: 6, borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div style={{ paddingTop: 8, paddingBottom: 8 }}>
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      </div>
    </div>
  )
}
