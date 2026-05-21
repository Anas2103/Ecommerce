import { useState, useEffect } from 'react'
import { Package, AlertTriangle, Plus, ShoppingCart, Clock, ChevronRight, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts'
import api from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Link } from 'react-router-dom'

const STATUS_STYLES = {
  pending:    { bg: '#fefce8', color: '#ca8a04',  border: '#fde047' },
  confirmed:  { bg: '#eff6ff', color: 'var(--primary)',  border: '#bfdbfe' },
  processing: { bg: '#f0fdf4', color: '#16a34a',  border: '#bbf7d0' },
  shipped:    { bg: '#faf5ff', color: '#9333ea',  border: '#e9d5ff' },
  delivered:  { bg: '#f0fdf4', color: '#15803d',  border: '#86efac' },
  cancelled:  { bg: '#fff1f2', color: '#ef4444',  border: '#fecaca' },
  refunded:   { bg: '#f9fafb', color: '#6b7280',  border: '#e5e7eb' },
}

function buildRevenueChart(orders) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push({ label: d.toLocaleDateString('en-GB', { weekday: 'short' }), date: d.toISOString().slice(0, 10), revenue: 0, count: 0 })
  }
  orders.forEach((o) => {
    const d = o.created_at?.slice(0, 10)
    const day = days.find((x) => x.date === d)
    if (day) { day.revenue += Number(o.total) || 0; day.count++ }
  })
  return days
}

export default function SellerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartTab, setChartTab] = useState('revenue')

  useEffect(() => {
    Promise.all([
      api.get('/seller/products', { params: { per_page: 5 } }),
      api.get('/seller/products', { params: { status: 'low_stock', per_page: 50 } }),
      api.get('/seller/orders',   { params: { per_page: 50 } }),
      api.get('/seller/orders',   { params: { status: 'pending', per_page: 1 } }),
    ]).then(([productsRes, lowStockRes, ordersRes, pendingRes]) => {
      const allOrders = ordersRes.data.data || []
      setData({
        products:      productsRes.data,
        lowStock:      lowStockRes.data.data,
        recentOrders:  allOrders.slice(0, 5),
        totalOrders:   ordersRes.data.meta?.total || 0,
        pendingOrders: pendingRes.data.meta?.total || 0,
        chartData:     buildRevenueChart(allOrders),
        totalRevenue:  allOrders.reduce((s, o) => s + (Number(o.total) || 0), 0),
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner center size="lg" />

  const card = { background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14 }

  const kpis = [
    {
      label: 'Total Products', value: data?.products?.meta?.total || 0,
      sub: 'in your catalogue', icon: Package,
      iconBg: 'var(--bg-accent)', iconColor: 'var(--primary)',
      link: '/seller/products',
    },
    {
      label: 'Revenue (loaded)', value: `${(data?.totalRevenue || 0).toLocaleString()} MAD`,
      sub: 'from loaded orders', icon: TrendingUp,
      iconBg: '#f0fdf4', iconColor: '#16a34a',
      link: null,
    },
    {
      label: 'Total Orders', value: data?.totalOrders || 0,
      sub: 'orders containing your products', icon: ShoppingCart,
      iconBg: 'var(--bg-accent)', iconColor: 'var(--primary)',
      link: '/seller/orders',
    },
    {
      label: 'Pending Orders', value: data?.pendingOrders || 0,
      sub: 'awaiting confirmation', icon: Clock,
      iconBg: '#fefce8', iconColor: '#ca8a04',
      link: '/seller/orders',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* Header */}
      <div className="flex items-center justify-between" style={{ paddingBottom: 4 }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>Seller Dashboard</h1>
        </div>
        <Link to="/seller/products/new" className="btn-primary flex items-center gap-2" style={{ fontSize: '0.875rem', padding: '10px 20px' }}>
          <Plus size={15} /> New Product
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map(({ label, value, sub, icon: Icon, iconBg, iconColor, link }) => (
          <div key={label} style={{ ...card, padding: '20px 24px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontWeight: 600 }}>{label}</p>
              <div style={{ width: 46, height: 46, background: iconBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={21} style={{ color: iconColor }} />
              </div>
            </div>
            <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1, marginBottom: 8 }}>{value}</p>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-3)' }}>{sub}</p>
            {link && (
              <Link to={link} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 10, fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                View all <ChevronRight size={12} />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Analytics charts */}
      <div style={{ ...card, padding: '24px 28px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <div className="flex items-center gap-3">
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Analytics — Last 7 days</h2>
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-page)', padding: 4, borderRadius: 8, border: '1.5px solid var(--border-light)' }}>
            {[{ key: 'revenue', label: 'Revenue' }, { key: 'orders', label: 'Orders' }].map(({ key, label }) => (
              <button key={key} onClick={() => setChartTab(key)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: chartTab === key ? 'var(--primary-btn)' : 'transparent', color: chartTab === key ? '#fff' : 'var(--text-3)', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          {chartTab === 'revenue' ? (
            <AreaChart data={data?.chartData || []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 10, fontSize: 12, color: 'var(--text-1)' }}
                formatter={(v) => [`${Number(v).toLocaleString()} MAD`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          ) : (
            <BarChart data={data?.chartData || []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 10, fontSize: 12, color: 'var(--text-1)' }}
                formatter={(v) => [v, 'Orders']}
              />
              <Bar dataKey="count" fill="var(--primary-btn)" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div style={{ ...card, padding: '28px 32px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>Recent Orders</h2>
          <Link to="/seller/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>

        {data?.recentOrders?.length === 0 ? (
          <div style={{ minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.recentOrders.map((order, i) => {
              const s = STATUS_STYLES[order.status] || STATUS_STYLES.refunded
              return (
                <div key={order.id} className="flex items-center gap-4" style={{ padding: '14px 0', borderBottom: i < data.recentOrders.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>{order.order_number}</p>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginTop: 3 }}>{order.user?.name} · {new Date(order.created_at).toLocaleDateString('en-GB')}</p>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, flexShrink: 0 }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)', flexShrink: 0, minWidth: 90, textAlign: 'right' }}>
                    {Number(order.total).toLocaleString()} MAD
                  </p>
                  <Link to={`/orders/${order.id}`} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>View →</Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Low Stock Alerts */}
      {data?.lowStock?.length > 0 && (
        <div style={{ ...card, padding: '28px 32px' }}>
          <h2 className="flex items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 24 }}>
            <AlertTriangle size={18} style={{ color: '#f97316' }} />
            Stock Alerts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-4" style={{ padding: '14px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12 }}>
                <img
                  src={p.primary_image_url || '/placeholder.jpg'}
                  alt=""
                  style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => e.target.src = '/placeholder.jpg'}
                />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a2332' }} className="truncate">{p.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#ea580c', marginTop: 2 }}>Only {p.stock} left in stock</p>
                </div>
                <Link
                  to={`/seller/products/${p.id}/edit`}
                  style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', flexShrink: 0, padding: '6px 14px', border: '1.5px solid var(--primary)', borderRadius: 8 }}
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
