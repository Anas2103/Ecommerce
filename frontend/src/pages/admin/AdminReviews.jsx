import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, EyeOff, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Pagination from '../../components/ui/Pagination'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'

const FILTERS = [
  { key: 'pending',  label: 'Awaiting moderation', param: false },
  { key: 'approved', label: 'Published',           param: true },
  { key: 'all',      label: 'All',                 param: undefined },
]

export default function AdminReviews() {
  const [filter, setFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [reloadToken, setReloadToken] = useState(0)
  const fetchKey = `${filter}|${page}|${reloadToken}`
  const [loadedKey, setLoadedKey] = useState(null)
  const loading = loadedKey !== fetchKey
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let stale = false
    const isApproved = FILTERS.find((f) => f.key === filter).param
    api.get('/admin/reviews', { params: { page, is_approved: isApproved === undefined ? undefined : Number(isApproved) } })
      .then(({ data }) => { if (!stale) { setReviews(data.data); setMeta(data.meta) } })
      .catch(() => { if (!stale) toast.error('Could not load reviews') })
      .finally(() => { if (!stale) setLoadedKey(fetchKey) })
    return () => { stale = true }
  }, [filter, page, fetchKey])

  const changeFilter = (key) => { setFilter(key); setPage(1) }
  const reload = () => setReloadToken((n) => n + 1)

  const toggleApproval = async (review) => {
    setBusyId(review.id)
    try {
      await api.put(`/admin/reviews/${review.id}/approve`)
      toast.success(review.is_approved ? 'Review hidden' : 'Review published')
      reload()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setBusyId(null) }
  }

  const remove = async (review) => {
    if (!window.confirm('Delete this review permanently?')) return
    setBusyId(review.id)
    try {
      await api.delete(`/reviews/${review.id}`)
      toast.success('Review deleted')
      reload()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setBusyId(null) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">New reviews stay hidden until they are published here.</p>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} className={`tab${filter === f.key ? ' is-active' : ''}`} onClick={() => changeFilter(f.key)}>
            {f.label}
            {filter === f.key && !loading && <span className="tab-count">{meta.total}</span>}
          </button>
        ))}
      </div>

      <div className="panel">
        {loading ? <LoadingSpinner center /> : reviews.length === 0 ? (
          <div className="panel-empty">No reviews here.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Product</th><th>Rating</th><th>Review</th><th>Customer</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td>{r.product ? <Link to={`/products/${r.product.slug ?? ''}`} className="card-name">{r.product.name}</Link> : <span className="muted">Deleted product</span>}</td>
                    <td>
                      <span className="stars" aria-label={`${r.rating} out of 5`}>
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={13} fill={s <= r.rating ? 'currentColor' : 'none'} />)}
                      </span>
                    </td>
                    <td style={{ maxWidth: 360 }}>
                      {r.title && <strong>{r.title}</strong>}
                      {r.comment && <div className="muted">{r.comment}</div>}
                    </td>
                    <td>
                      {r.user?.name ?? '—'}
                      <div className="muted">{new Date(r.created_at).toLocaleDateString('en-GB')}</div>
                    </td>
                    <td><StatusBadge status={r.is_approved ? 'approved' : 'pending'} label={r.is_approved ? 'Published' : 'Pending'} /></td>
                    <td>
                      <div className="actions">
                        <button type="button" className={`btn-sm ${r.is_approved ? '' : 'is-success'}`} disabled={busyId === r.id} onClick={() => toggleApproval(r)}>
                          {r.is_approved ? <><EyeOff size={13} /> Hide</> : <><Check size={13} /> Publish</>}
                        </button>
                        <button type="button" className="btn-sm is-danger" disabled={busyId === r.id} onClick={() => remove(r)} aria-label="Delete review">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.last_page > 1 && <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />}
    </div>
  )
}
