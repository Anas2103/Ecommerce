import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, lastPage, onPageChange }) {
  if (lastPage <= 1) return null

  const pages = []
  const delta = 2
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(lastPage, currentPage + delta); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors text-gray-600"
        style={{ borderRadius: '8px' }}
      >
        <ChevronLeft size={15} />
      </button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors" style={{ borderRadius: '8px' }}>1</button>
          {pages[0] > 2 && <span className="px-2 text-gray-400 text-sm">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className="px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            borderRadius: '2px',
            background: p === currentPage ? '#2196F3' : 'transparent',
            color: p === currentPage ? '#fff' : '#374151',
          }}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < lastPage && (
        <>
          {pages[pages.length - 1] < lastPage - 1 && <span className="px-2 text-gray-400 text-sm">…</span>}
          <button onClick={() => onPageChange(lastPage)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors" style={{ borderRadius: '8px' }}>{lastPage}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="p-2 border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors text-gray-600"
        style={{ borderRadius: '8px' }}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

