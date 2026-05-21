import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import api from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useTranslation } from 'react-i18next'

const PIE_COLORS = ['var(--primary)', '#16a34a', '#f97316', '#9333ea', '#ef4444', '#ca8a04', '#6b7280']

const STATUS_STYLES = {
  pending:    { bg: '#fefce8', color: '#ca8a04',  border: '#fde047' },
  confirmed:  { bg: 'var(--bg-accent)', color: 'var(--primary)', border: 'var(--border-accent)' },
  processing: { bg: '#f0fdf4', color: '#16a34a',  border: '#bbf7d0' },
  shipped:    { bg: '#faf5ff', color: '#9333ea',  border: '#e9d5ff' },
  delivered:  { bg: '#f0fdf4', color: '#15803d',  border: '#86efac' },
  cancelled:  { bg: '#fff1f2', color: '#ef4444',  border: '#fecaca' },
  refunded:   { bg: 'var(--bg-page)', color: 'var(--text-3)', border: 'var(--border)' },
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner center size="lg" />
  if (!data) return null

  const { stats, revenue_chart, top_products, recent_orders, orders_by_status } = data

  const card = { background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14 }

  const kpis = [
    { label: t('admin.totalRevenue'), value: `${Number(stats.totalRevenue).toLocaleString()} MAD`, sub: `+${Number(stats.revenueMonth).toLocaleString()} MAD this month`, icon: TrendingUp, iconBg: 'var(--bg-accent)', iconColor: 'var(--primary)' },
    { label: t('admin.orders'), value: stats.totalOrders, sub: `${stats.ordersToday} today · ${stats.ordersPending} pending`, icon: ShoppingCart, iconBg: 'var(--bg-accent)', iconColor: 'var(--primary)' },
    { label: t('admin.users'), value: stats.totalUsers, sub: `+${stats.newUsersMonth} this month · ${stats.totalSellers} sellers`, icon: Users, iconBg: '#f0fdf4', iconColor: '#16a34a' },
    { label: t('admin.products'), value: stats.totalProducts, sub: `${stats.outOfStock} out of stock`, icon: Package, iconBg: '#fff7ed', iconColor: '#f97316' },
  ]

  const pieData = Object.entries(orders_by_status || {}).map(([status, count]) => ({ name: status, value: Number(count) }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* Header */}
      <div className="flex items-center gap-3" style={{ paddingBottom: 4 }}>
        <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>{t('admin.dashboard')}</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
          <div key={label} style={{ ...card, padding: '20px 24px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontWeight: 600 }}>{label}</p>
              <div style={{ width: 46, height: 46, background: iconBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={21} style={{ color: iconColor }} />
              </div>
            </div>
            <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1, marginBottom: 8 }}>{value}</p>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-3)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div style={{ ...card, padding: '28px 32px', gridColumn: 'span 2' }} className="lg:col-span-2">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 24 }}>Revenue (last 30 days)</h2>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={revenue_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-3)' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [`${Number(v).toLocaleString()} MAD`, 'Revenue']}
                contentStyle={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...card, padding: '28px 32px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 24 }}>Orders by status</h2>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div style={{ ...card, padding: '28px 32px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 24 }}>{t('admin.topProducts')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {(top_products || []).slice(0, 5).map((p, i) => (
              <div key={p.product_id || i} className="flex items-center gap-4">
                <div style={{ width: 34, height: 34, background: 'var(--primary-btn)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-1)' }} className="truncate">{p.product_name}</p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginTop: 3 }}>{Number(p.total_sold)} sold</p>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{Number(p.revenue).toLocaleString()} MAD</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: '28px 32px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>{t('admin.recentOrders')}</h2>
            <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(recent_orders || []).slice(0, 5).map((order) => {
              const s = STATUS_STYLES[order.status] || STATUS_STYLES.refunded
              return (
                <div key={order.id} className="flex items-center gap-3" style={{ padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>{order.order_number}</p>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-3)', marginTop: 3 }}>{order.user?.name}</p>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, flexShrink: 0 }}>
                    {order.status}
                  </span>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)', flexShrink: 0 }}>{Number(order.total).toLocaleString()} MAD</p>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
