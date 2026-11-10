import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import SellerDocumentsTable from '../../components/SellerDocumentsTable'
import { DOCUMENT_TYPES } from '../../constants/sellerDocuments'

const MAX_MB = 5

export default function SellerVerification() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('business_registration')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    let stale = false
    api.get('/seller/documents')
      .then(({ data }) => { if (!stale) setDocs(data.data || []) })
      .catch(() => { if (!stale) toast.error('Could not load documents') })
      .finally(() => { if (!stale) setLoading(false) })
    return () => { stale = true }
  }, [])

  const verified = docs.some((d) => d.status === 'approved')

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Choose a file first')
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`The file must be smaller than ${MAX_MB} MB`)
    const form = new FormData()
    form.append('type', type)
    form.append('file', file)
    setUploading(true)
    try {
      const { data } = await api.post('/seller/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setDocs((prev) => [data.data, ...prev])
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      toast.success(data.message)
    } catch (err) {
      const errors = err.response?.data?.errors
      toast.error((errors && Object.values(errors)[0]?.[0]) || err.response?.data?.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Verification</h1>
          <p className="page-subtitle">Upload your documents so the marketplace team can verify your shop.</p>
        </div>
        {verified && <span className="badge badge-green" style={{ gap: 6, padding: '4px 12px' }}><ShieldCheck size={14} /> Verified seller</span>}
      </div>

      <form className="panel panel-body form-stack" onSubmit={submit} style={{ marginBottom: 20 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="form-field">
            <span className="form-label">Document type</span>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {Object.entries(DOCUMENT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span className="form-label">File (PDF, JPG or PNG, max {MAX_MB} MB)</span>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={uploading || !file} style={{ gap: 8 }}>
            <Upload size={15} /> {uploading ? 'Uploading…' : 'Submit for review'}
          </button>
        </div>
      </form>

      <div className="panel">
        {loading ? <LoadingSpinner center /> : <SellerDocumentsTable documents={docs} />}
      </div>
    </div>
  )
}
