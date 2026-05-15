import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { X, Upload, ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', name_fr: '', description: '', description_fr: '',
  price: '', compare_price: '', discount_percent: 0,
  stock: '', low_stock_alert: 5, sku: '',
  category_id: '', is_active: true, is_featured: false,
  attributes: '', tags: '',
}

const labelStyle = { fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 5, display: 'block' }

export default function SellerProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data || []))
    if (isEdit) {
      api.get(`/seller/products/${id}`).then(({ data }) => {
        const p = data.data
        setForm({
          name: p.name || '', name_fr: p.name_fr || '',
          description: p.description || '', description_fr: p.description_fr || '',
          price: p.price || '', compare_price: p.compare_price || '',
          discount_percent: p.discount_percent || 0,
          stock: p.stock ?? '', low_stock_alert: p.low_stock_alert || 5,
          sku: p.sku || '', category_id: p.category_id || '',
          is_active: p.is_active, is_featured: p.is_featured,
          attributes: p.attributes ? JSON.stringify(p.attributes, null, 2) : '',
          tags: (p.tags || []).map((t) => t.tag || t.name || '').filter(Boolean).join(', '),
        })
        setExistingImages(p.images || [])
      }).finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const onDrop = useCallback((accepted) => {
    const newFiles = accepted.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) }))
    setImages((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: true, maxSize: 5 * 1024 * 1024,
  })

  const removeNewImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const removeExistingImage = async (imgId) => {
    try {
      await api.delete(`/product-images/${imgId}`)
      setExistingImages((prev) => prev.filter((img) => img.id !== imgId))
      toast.success('Image removed')
    } catch { toast.error('Error') }
  }

  const setAsPrimary = async (imgId) => {
    try {
      await api.put(`/product-images/${imgId}/primary`)
      setExistingImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imgId })))
    } catch { toast.error('Error') }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      const fields = { ...form }
      delete fields.tags
      delete fields.attributes
      Object.entries(fields).forEach(([k, v]) => fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : v))
      if (form.tags) form.tags.split(',').forEach((t) => fd.append('tags[]', t.trim()))
      if (form.attributes) {
        try { const parsed = JSON.parse(form.attributes); Object.entries(parsed).forEach(([k, v]) => fd.append(`attributes[${k}]`, v)) }
        catch { /* ignore invalid JSON */ }
      }
      images.forEach((file) => fd.append('images[]', file))

      if (isEdit) {
        fd.append('_method', 'PUT')
        await api.post(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product updated')
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product created')
      }
      navigate('/seller/products')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach((msg) => toast.error(msg))
      else toast.error(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner center size="lg" />

  const flatCategories = []
  const flatten = (cats, depth = 0) => cats.forEach((c) => { flatCategories.push({ ...c, depth }); if (c.children?.length) flatten(c.children, depth + 1) })
  flatten(categories)

  const sectionCard = { background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: 20 }
  const sectionTitle = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }

  return (
    <div style={{ maxWidth: 900 }} className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => navigate('/seller/products')}
          style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ width: 4, height: 28, background: '#0066CC', borderRadius: 3 }} />
        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>{isEdit ? 'Edit product' : 'New product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* General info */}
        <div style={sectionCard}>
          <p style={sectionTitle}>General information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Name (EN) *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input text-sm" />
            </div>
            <div>
              <label style={labelStyle}>Name (FR)</label>
              <input name="name_fr" value={form.name_fr} onChange={handleChange} className="input text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label style={labelStyle}>Description (EN)</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input text-sm resize-none" />
            </div>
            <div>
              <label style={labelStyle}>Description (FR)</label>
              <textarea name="description_fr" value={form.description_fr} onChange={handleChange} rows={4} className="input text-sm resize-none" />
            </div>
          </div>
          <div className="mt-4">
            <label style={labelStyle}>Category *</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required className="input text-sm">
              <option value="">Select a category</option>
              {flatCategories.map((c) => (
                <option key={c.id} value={c.id}>{'   '.repeat(c.depth)}{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Stock */}
        <div style={sectionCard}>
          <p style={sectionTitle}>Price &amp; Stock</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label style={labelStyle}>Price (MAD) *</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required className="input text-sm" />
            </div>
            <div>
              <label style={labelStyle}>Compare price (MAD)</label>
              <input name="compare_price" type="number" step="0.01" min="0" value={form.compare_price} onChange={handleChange} className="input text-sm" />
            </div>
            <div>
              <label style={labelStyle}>Discount (%)</label>
              <input name="discount_percent" type="number" min="0" max="100" value={form.discount_percent} onChange={handleChange} className="input text-sm" />
            </div>
            <div>
              <label style={labelStyle}>SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange} className="input text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label style={labelStyle}>Stock *</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className="input text-sm" />
            </div>
            <div>
              <label style={labelStyle}>Low stock alert</label>
              <input name="low_stock_alert" type="number" min="0" value={form.low_stock_alert} onChange={handleChange} className="input text-sm" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div style={sectionCard}>
          <p style={sectionTitle}>Images</p>
          {existingImages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {existingImages.map((img) => (
                <div key={img.id} style={{ position: 'relative' }} className="group">
                  <img src={img.url} alt="" style={{ width: 96, height: 96, borderRadius: 10, objectFit: 'cover', border: img.is_primary ? '2px solid #0066CC' : '1.5px solid var(--border-light)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} className="group-hover:opacity-100 transition-opacity">
                    {!img.is_primary && (
                      <button type="button" onClick={() => setAsPrimary(img.id)} style={{ fontSize: '0.68rem', color: '#fff', background: '#0066CC', borderRadius: 4, padding: '2px 6px', border: 'none', cursor: 'pointer' }}>Main</button>
                    )}
                    <button type="button" onClick={() => removeExistingImage(img.id)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
                  </div>
                  {img.is_primary && <span style={{ position: 'absolute', top: 4, left: 4, fontSize: '0.68rem', background: '#0066CC', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>✓</span>}
                </div>
              ))}
            </div>
          )}

          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? '#0066CC' : 'var(--border)'}`,
              background: isDragActive ? 'var(--bg-accent)' : 'transparent',
              borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <input {...getInputProps()} />
            <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--text-3)', display: 'block' }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>Drag images here or click to select</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>JPG, PNG, WebP — max 5 MB per image</p>
          </div>

          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
              {images.map((file, i) => (
                <div key={i} style={{ position: 'relative' }} className="group">
                  <img src={file.preview} alt="" style={{ width: 96, height: 96, borderRadius: 10, objectFit: 'cover', border: '1.5px solid var(--border-light)' }} />
                  <button type="button" onClick={() => removeNewImage(i)} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: '50%', border: 'none', cursor: 'pointer', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }} className="group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags & Attributes */}
        <div style={sectionCard}>
          <p style={sectionTitle}>Tags &amp; Attributes</p>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. new, sale, featured" className="input text-sm" />
            </div>
            <div>
              <label style={labelStyle}>Attributes (JSON)</label>
              <textarea name="attributes" value={form.attributes} onChange={handleChange} rows={3} className="input text-sm resize-none" style={{ fontFamily: 'monospace' }} placeholder='{"color": "red", "size": "M"}' />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-1)' }}>
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} style={{ accentColor: '#0066CC', width: 16, height: 16 }} />
              Active (visible to customers)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-1)' }}>
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} style={{ accentColor: '#0066CC', width: 16, height: 16 }} />
              Featured product
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <LoadingSpinner size="sm" /> : (isEdit ? 'Update product' : 'Create product')}
          </button>
          <button type="button" onClick={() => navigate('/seller/products')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
