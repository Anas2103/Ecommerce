export default function LoadingSpinner({ size = 'md', center = false }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className={center ? 'flex items-center justify-center py-20' : 'inline-flex'}>
      <div className={`${s} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`} style={{ borderTopColor: '#2196F3' }} />
    </div>
  )
}

