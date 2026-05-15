import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import api from '../../services/api'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', name_fr: '', description: '', parent_id: '', is_active: true, sort_order: 0 })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    api.get('/admin/categories/all').then(({ data }) => setCategories(data.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', name_fr: '', description: '', parent_id: '', is_active: true, sort_order: 0 }); setModalOpen(true) }
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, name_fr: cat.name_fr || '', description: cat.description || '', parent_id: cat.parent_id || '', is_active: cat.is_active, sort_order: cat.sort_order || 0 }); setModalOpen(true) }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...form, parent_id: form.parent_id || null }
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, payload)
        toast.success('Category updated')
      } else {
        await api.post('/admin/categories', payload)
        toast.success('Category created')
      }
      setModalOpen(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const deleteCat = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try { await api.delete(`/admin/categories/${id}`); load(); toast.success('Category deleted') }
    catch { toast.error('Error') }
  }

  const rootCats = categories.filter((c) => !c.parent_id)
  const labelStyle = { fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 5, display: 'block' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 28, background: '#0066CC', borderRadius: 3, flexShrink: 0 }} />
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>Categories</h1>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1.5 py-1.5">
          <Plus size={13} /> Add Category
        </button>
      </div>

      {loading ? <LoadingSpinner center /> : (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-page)', borderBottom: '1.5px solid var(--border-light)' }}>
                  {['Name', 'Name FR', 'Parent', 'Products', 'Order', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left" style={{ padding: '10px 16px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.id}
                    style={{ borderTop: i > 0 ? '1px solid var(--border-light)' : 'none', background: cat.parent_id ? 'var(--bg-page)' : 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = cat.parent_id ? 'var(--bg-page)' : 'transparent'}
                  >
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                        {cat.parent_id && <span style={{ color: 'var(--text-3)', marginRight: 6 }}>└</span>}
                        {cat.name}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', color: 'var(--text-2)' }}>{cat.name_fr}</td>
                    <td style={{ padding: '11px 16px', fontSize: '0.72rem', color: 'var(--text-3)' }}>{cat.parent?.name || '—'}</td>
                    <td style={{ padding: '11px 16px', color: 'var(--text-2)' }}>{cat.products_count}</td>
                    <td style={{ padding: '11px 16px', color: 'var(--text-2)' }}>{cat.sort_order}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                        background: cat.is_active ? 'rgba(22,163,74,0.1)' : 'var(--bg-page)',
                        color: cat.is_active ? '#16a34a' : 'var(--text-3)',
                        border: `1px solid ${cat.is_active ? 'rgba(22,163,74,0.3)' : 'var(--border)'}`,
                      }}>{cat.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(cat)}
                          style={{ padding: 6, borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: '#0066CC' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        ><Edit size={13} /></button>
                        <button onClick={() => deleteCat(cat.id)}
                          style={{ padding: 6, borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'New category'} size="sm">
        <div className="space-y-3">
          <div><label style={labelStyle}>Name (EN)</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input text-sm" /></div>
          <div><label style={labelStyle}>Name (FR)</label><input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} className="input text-sm" /></div>
          <div>
            <label style={labelStyle}>Parent</label>
            <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="input text-sm">
              <option value="">None (Root)</option>
              {rootCats.filter((c) => c.id !== editing?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input text-sm resize-none" /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} style={{ accentColor: '#0066CC' }} />
            <label htmlFor="is_active" style={{ fontSize: '0.82rem', color: 'var(--text-1)' }}>Active</label>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center text-sm">{saving ? '...' : 'Save'}</button>
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
