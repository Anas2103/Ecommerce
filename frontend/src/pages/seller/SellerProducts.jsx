import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Download, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import api from '../../services/api'
import Pagination from '../../components/ui/Pagination'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const CSV_HEADERS = ['name', 'name_fr', 'price', 'compare_price', 'discount_percent', 'stock', 'sku', 'category_id', 'description', 'is_active']
const CSV_TEMPLATE = [CSV_HEADERS.join(','), 'My Product,Mon Produit,199.99,249.99,20,50,SKU001,1,Product description,1'].join('\n')

function parseCSV(text) {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row = {}
    headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
    return row
  })
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'products_template.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function SellerProducts() {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState([])
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState(null)
  const fileRef = useRef(null)

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result)
      setImportRows(rows)
      setImportResults(null)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!importRows.length) return
    setImporting(true)
    const results = { success: 0, errors: [] }
    for (const row of importRows) {
      try {
        await api.post('/products', {
          name: row.name, name_fr: row.name_fr,
          price: Number(row.price) || 0,
          compare_price: Number(row.compare_price) || undefined,
          discount_percent: Number(row.discount_percent) || 0,
          stock: Number(row.stock) || 0,
          sku: row.sku || undefined,
          category_id: Number(row.category_id) || undefined,
          description: row.description || undefined,
          is_active: row.is_active === '1' || row.is_active === 'true',
        })
        results.success++
      } catch (err) {
        results.errors.push({ name: row.name, error: err.response?.data?.message || 'Error' })
      }
    }
    setImportResults(results)
    setImporting(false)
    if (results.success > 0) {
      toast.success(`${results.success} product(s) imported`)
      load()
    }
  }

  const closeImport = () => { setImportOpen(false); setImportRows([]); setImportResults(null); if (fileRef.current) fileRef.current.value = '' }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4" style={{ paddingBottom: 8, flexWrap: 'wrap' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>My Products</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setImportOpen(true)} className="btn-secondary flex items-center gap-2" style={{ fontSize: '0.875rem', padding: '10px 18px' }}>
            <Upload size={15} /> Import CSV
          </button>
          <Link to="/seller/products/new" className="btn-primary flex items-center gap-2" style={{ fontSize: '0.875rem', padding: '10px 20px' }}>
            <Plus size={15} /> New Product
          </Link>
        </div>
      </div>

      {/* CSV Import Modal */}
      {importOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Bulk Import Products</h2>
              <button onClick={closeImport} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
              Download the CSV template, fill it in, then upload it here. Required columns: <strong style={{ color: 'var(--text-1)' }}>name, price, stock</strong>.
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-2" style={{ fontSize: '0.8125rem', padding: '9px 16px' }}>
                <Download size={14} /> Download Template
              </button>
            </div>

            {/* File drop area */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-page)', transition: 'border-color 0.15s, background 0.15s', marginBottom: 20 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-page)' }}
            >
              <Upload size={24} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)', margin: '0 0 4px' }}>Click to upload CSV file</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0 }}>or drag and drop</p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>

            {/* Preview */}
            {importRows.length > 0 && !importResults && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>Preview — {importRows.length} row(s)</p>
                <div style={{ border: '1.5px solid var(--border-light)', borderRadius: 10, overflow: 'hidden', maxHeight: 200, overflowY: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border-light)' }}>
                        {['Name', 'Price', 'Stock', 'SKU', 'Category'].map((h) => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-3)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.slice(0, 10).map((row, i) => (
                        <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border-light)' : 'none' }}>
                          <td style={{ padding: '8px 12px', color: 'var(--text-1)', fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{row.price} MAD</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{row.stock}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-3)' }}>{row.sku}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-3)' }}>{row.category_id}</td>
                        </tr>
                      ))}
                      {importRows.length > 10 && (
                        <tr><td colSpan={5} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-3)', fontStyle: 'italic' }}>+{importRows.length - 10} more rows…</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={handleImport} disabled={importing} className="btn-primary flex items-center gap-2" style={{ fontSize: '0.875rem' }}>
                    {importing ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Importing…</> : <><Upload size={14} /> Import {importRows.length} Products</>}
                  </button>
                  <button onClick={() => { setImportRows([]); if (fileRef.current) fileRef.current.value = '' }} className="btn-secondary" style={{ fontSize: '0.875rem' }}>Clear</button>
                </div>
              </div>
            )}

            {/* Results */}
            {importResults && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: importResults.success > 0 ? 'rgba(22,163,74,0.08)' : '#fff1f2', border: `1.5px solid ${importResults.success > 0 ? 'rgba(22,163,74,0.25)' : '#fecaca'}`, borderRadius: 10 }}>
                  <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>{importResults.success} product(s) imported successfully</span>
                </div>
                {importResults.errors.length > 0 && importResults.errors.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: '#fff1f2', border: '1.5px solid #fecaca', borderRadius: 10 }}>
                    <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: '0.8rem', color: '#dc2626' }}><strong>{e.name}:</strong> {e.error}</span>
                  </div>
                ))}
                <button onClick={closeImport} className="btn-primary" style={{ marginTop: 4 }}>Done</button>
              </div>
            )}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

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
                          style={{ padding: 6, borderRadius: 7, color: 'var(--primary)', display: 'flex', background: 'transparent' }}
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
      <div style={{ paddingTop: 8, paddingBottom: 8 }}>
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      </div>
    </div>
  )
}
