function Skeleton({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'var(--skeleton-base)',
      backgroundImage: 'linear-gradient(90deg, var(--skeleton-base) 0%, var(--skeleton-shine) 50%, var(--skeleton-base) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s ease-in-out infinite',
      flexShrink: 0,
      ...style,
    }} />
  )
}

export function ProductCardSkeleton() {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
      <Skeleton height={220} borderRadius={0} />
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton height={10} width="40%" />
        <Skeleton height={14} />
        <Skeleton height={14} width="80%" />
        <Skeleton height={20} width="50%" />
        <Skeleton height={38} borderRadius={8} />
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginBottom: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton height={420} borderRadius={16} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4].map((i) => <Skeleton key={i} width={64} height={64} borderRadius={10} />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height={12} width="30%" />
          <Skeleton height={36} />
          <Skeleton height={36} width="70%" />
          <Skeleton height={16} width="40%" />
          <Skeleton height={48} width="60%" />
          <Skeleton height={12} width="35%" />
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Skeleton height={52} borderRadius={12} />
            <Skeleton width={52} height={52} borderRadius={12} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrderRowSkeleton() {
  return (
    <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border-light)' }}>
      <Skeleton width={80} height={14} />
      <Skeleton width={120} height={14} />
      <Skeleton width={80} height={14} />
      <Skeleton width={70} height={22} borderRadius={99} />
      <Skeleton width={90} height={14} />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <Skeleton height={13} width={i === 0 ? '70%' : '55%'} />
        </td>
      ))}
    </tr>
  )
}

export default Skeleton
