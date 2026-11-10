import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Modal from './ui/Modal'

const REASONS = {
  defective: 'Defective or not working',
  damaged: 'Arrived damaged',
  wrong_item: 'Wrong item received',
  not_as_described: 'Not as described',
  changed_mind: 'Changed my mind',
}

/** Lets a customer request a return for one item of a delivered order. */
export default function ReturnRequestModal({ order, item, onClose, onCreated }) {
  const [reason, setReason] = useState('defective')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const { data } = await api.post('/returns', { order_id: order.id, order_item_id: item.id, reason, description: description.trim() || undefined })
      toast.success(data.message)
      onCreated(data.data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send the request')
    } finally { setSending(false) }
  }

  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title="Request a return" size="sm">
      {item && (
        <form className="form-stack" onSubmit={submit}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2)' }}>
            <strong style={{ color: 'var(--text-1)' }}>{item.product_name}</strong> · order {order.order_number}
          </p>
          <label className="form-field">
            <span className="form-label">Reason</span>
            <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
              {Object.entries(REASONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span className="form-label">Details (optional)</span>
            <textarea className="input" rows={4} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell the seller what happened…" />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Send request'}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}
