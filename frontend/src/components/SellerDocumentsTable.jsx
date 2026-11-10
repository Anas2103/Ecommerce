import { Check, Download, FileText, X } from 'lucide-react'
import toast from 'react-hot-toast'
import StatusBadge from './ui/StatusBadge'
import { downloadFile } from '../services/download'
import { DOCUMENT_TYPES } from '../constants/sellerDocuments'

/** Table of seller verification documents. `onReview` (admin only) adds approve / reject buttons. */
export default function SellerDocumentsTable({ documents, showSeller = false, onReview, busyId }) {
  const download = async (doc) => {
    try {
      const ext = doc.file_path?.split('.').pop() || 'pdf'
      await downloadFile(`/seller/documents/${doc.id}/download`, `${doc.type}-${doc.id}.${ext}`)
    } catch { toast.error('Could not download the document') }
  }

  if (documents.length === 0) return <div className="panel-empty">No documents yet.</div>

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {showSeller && <th>Seller</th>}
            <th>Document</th><th>Submitted</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              {showSeller && (
                <td>{doc.user?.name}<div className="muted">{doc.user?.email}</div></td>
              )}
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={15} style={{ color: 'var(--primary)' }} />
                  {DOCUMENT_TYPES[doc.type] || doc.type}
                </span>
              </td>
              <td className="muted">{new Date(doc.created_at).toLocaleDateString('en-GB')}</td>
              <td><StatusBadge status={doc.status} label={doc.status[0].toUpperCase() + doc.status.slice(1)} /></td>
              <td>
                <div className="actions">
                  <button type="button" className="btn-sm" onClick={() => download(doc)}><Download size={13} /> View</button>
                  {onReview && doc.status !== 'approved' && (
                    <button type="button" className="btn-sm is-success" disabled={busyId === doc.id} onClick={() => onReview(doc, 'approve')}><Check size={13} /> Approve</button>
                  )}
                  {onReview && doc.status !== 'rejected' && (
                    <button type="button" className="btn-sm is-danger" disabled={busyId === doc.id} onClick={() => onReview(doc, 'reject')}><X size={13} /> Reject</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
