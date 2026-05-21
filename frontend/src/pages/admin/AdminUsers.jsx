import { useState, useEffect } from 'react'
import { Trash2, ToggleLeft, ToggleRight, Download, CheckSquare, Square } from 'lucide-react'
import api from '../../services/api'
import Pagination from '../../components/ui/Pagination'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

function exportCSV(rows) {
  const headers = ['Name', 'Email', 'Role', 'Orders', 'Products', 'Joined', 'Status']
  const lines = [headers, ...rows.map((u) => [
    u.name, u.email, u.role, u.orders_count ?? 0, u.products_count ?? 0,
    new Date(u.created_at).toLocaleDateString('en-GB'), u.is_active ? 'Active' : 'Inactive',
  ])].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())

  const allSelected = users.length > 0 && users.every((u) => selected.has(u.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(users.map((u) => u.id)))
  const toggleOne = (id) => setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} users?`)) return
    try {
      await Promise.all([...selected].map((id) => api.delete(`/admin/users/${id}`)))
      setUsers(users.filter((u) => !selected.has(u.id)))
      setSelected(new Set())
      toast.success(`Deleted ${selected.size} users`)
    } catch { toast.error('Error') }
  }

  useEffect(() => {
    setLoading(true)
    api.get('/admin/users', { params: { role: roleFilter || undefined, search: search || undefined, page } })
      .then(({ data }) => { setUsers(data.data); setMeta(data.meta) })
      .finally(() => setLoading(false))
  }, [roleFilter, search, page])

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active })
      setUsers(users.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      toast.success('Status updated')
    } catch { toast.error('Error') }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(users.filter((u) => u.id !== id))
      toast.success('User deleted')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const roleBadge = (role) => {
    const map = { admin: { bg: '#fff1f2', color: '#ef4444', border: '#fecaca' }, seller: { bg: '#faf5ff', color: '#9333ea', border: '#e9d5ff' }, client: { bg: 'var(--bg-accent)', color: 'var(--primary)', border: 'var(--border-accent)' } }
    return map[role] || map.client
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap" style={{ paddingBottom: 8, gap: 10 }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>Users</h1>
        </div>
        <button
          onClick={() => exportCSV(users)}
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
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Name, email..." className="input text-sm max-w-xs" />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }} className="input text-sm w-auto">
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="client">Client</option>
          </select>
          {selected.size > 0 && (
            <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>{selected.size} selected</span>
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
                  {['User', 'Role', 'Orders', 'Products', 'Joined', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left" style={{ padding: '10px 16px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const rb = roleBadge(user.role)
                  return (
                    <tr key={user.id} style={{ borderTop: i > 0 ? '1px solid var(--border-light)' : 'none', background: selected.has(user.id) ? 'var(--bg-accent)' : 'transparent' }}
                      onMouseEnter={(e) => { if (!selected.has(user.id)) e.currentTarget.style.background = 'var(--bg-page)' }}
                      onMouseLeave={(e) => { if (!selected.has(user.id)) e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '12px 12px', width: 40 }}>
                        <button onClick={() => toggleOne(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: selected.has(user.id) ? 'var(--primary)' : 'var(--text-3)', display: 'flex', padding: 0 }}>
                          {selected.has(user.id) ? <CheckSquare size={15} /> : <Square size={15} />}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-3">
                          <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D6EFD&color=fff`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-1)' }}>{user.name}</p>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: rb.bg, color: rb.color, border: `1px solid ${rb.border}` }}>{user.role}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{user.orders_count}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{user.products_count}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                          background: user.is_active ? 'rgba(22,163,74,0.1)' : 'var(--bg-page)',
                          color: user.is_active ? '#16a34a' : 'var(--text-3)',
                          border: `1px solid ${user.is_active ? 'rgba(22,163,74,0.3)' : 'var(--border)'}`,
                        }}>{user.is_active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleActive(user)}
                            style={{ padding: 6, borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: user.is_active ? '#16a34a' : 'var(--text-3)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          {user.role !== 'admin' && (
                            <button onClick={() => deleteUser(user.id)}
                              style={{ padding: 6, borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
