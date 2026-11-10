import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import SellerDocumentsTable from '../../components/SellerDocumentsTable'

const FILTERS = ['pending', 'approved', 'rejected', 'all']

export default function AdminSellerDocuments() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let stale = false
    api.get('/admin/seller-documents')
      .then(({ data }) => { if (!stale) setDocs(data.data || []) })
      .catch(() => { if (!stale) toast.error('Could not load documents') })
      .finally(() => { if (!stale) setLoading(false) })
    return () => { stale = true }
  }, [])

  const review = async (doc, action) => {
    setBusyId(doc.id)
    try {
      const { data } = await api.put(`/admin/seller-documents/${doc.id}/${action}`)
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: data.data.status } : d)))
      toast.success(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setBusyId(null) }
  }

  const count = (s) => (s === 'all' ? docs.length : docs.filter((d) => d.status === s).length)
  const shown = filter === 'all' ? docs : docs.filter((d) => d.status === filter)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Seller verification</h1>
          <p className="page-subtitle">Review the identity and business documents sellers submit.</p>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {FILTERS.map((f) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} className={`tab${filter === f ? ' is-active' : ''}`} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}<span className="tab-count">{count(f)}</span>
          </button>
        ))}
      </div>

      <div className="panel">
        {loading ? <LoadingSpinner center /> : <SellerDocumentsTable documents={shown} showSeller onReview={review} busyId={busyId} />}
      </div>
    </div>
  )
}
