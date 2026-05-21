import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, lastPage, total, onPageChange }) {
  if (lastPage <= 1) return null

  const delta = 2
  const pages = []
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(lastPage, currentPage + delta); i++) {
    pages.push(i)
  }

  const perPage = total ? Math.ceil(total / lastPage) : null
  const from = perPage ? (currentPage - 1) * perPage + 1 : null
  const to = perPage ? Math.min(currentPage * perPage, total) : null

  const btnBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 38,
    padding: '0 14px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s ease',
  }

  const navBtn = (disabled) => ({
    ...btnBase,
    background: disabled ? '#f3f4f6' : '#fff',
    color: disabled ? '#c1c7d0' : '#374151',
    border: '1.5px solid ' + (disabled ? '#e5e7eb' : '#d1d5db'),
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
  })

  const pageBtn = (active) => ({
    ...btnBase,
    minWidth: 38,
    padding: '0 10px',
    background: active ? 'var(--primary-btn)' : '#fff',
    color: active ? '#fff' : '#374151',
    border: '1.5px solid ' + (active ? 'var(--primary-btn)' : '#d1d5db'),
    boxShadow: active ? '0 2px 8px var(--brand-bd)' : '0 1px 3px rgba(0,0,0,0.06)',
    transform: active ? 'scale(1.05)' : 'scale(1)',
    fontWeight: active ? 700 : 500,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {total != null && from != null && (
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
          Showing <strong style={{ color: '#374151' }}>{from}</strong>
          {' '}to{' '}
          <strong style={{ color: '#374151' }}>{to}</strong>
          {' '}of{' '}
          <strong style={{ color: '#374151' }}>{total}</strong> results
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={navBtn(currentPage === 1)}
        >
          <ChevronLeft size={15} />
          <span>Prev</span>
        </button>

        {pages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={pageBtn(false)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151' }}
            >1</button>
            {pages[0] > 2 && (
              <span style={{ width: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14, letterSpacing: 2 }}>...</span>
            )}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={pageBtn(p === currentPage)}
            onMouseEnter={e => { if (p !== currentPage) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' } }}
            onMouseLeave={e => { if (p !== currentPage) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151' } }}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < lastPage && (
          <>
            {pages[pages.length - 1] < lastPage - 1 && (
              <span style={{ width: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14, letterSpacing: 2 }}>...</span>
            )}
            <button
              onClick={() => onPageChange(lastPage)}
              style={pageBtn(false)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151' }}
            >{lastPage}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          style={navBtn(currentPage === lastPage)}
        >
          <span>Next</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
