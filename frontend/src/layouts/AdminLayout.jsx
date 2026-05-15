import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, LogOut, Home } from 'lucide-react'
import { logoutUser } from '../store/authSlice'

const navItems = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products',   icon: Package,         label: 'Products' },
  { to: '/admin/orders',     icon: ShoppingCart,    label: 'Orders' },
  { to: '/admin/users',      icon: Users,           label: 'Users' },
  { to: '/admin/categories', icon: Tag,             label: 'Categories' },
]

export default function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>

      {/* Sidebar */}
      <aside className="w-56 flex flex-col flex-shrink-0" style={{ background: 'var(--bg-card)', borderRight: '1.5px solid var(--border-light)' }}>

        {/* Brand */}
        <div style={{ padding: '16px', background: '#0066CC' }}>
          <div className="flex items-center gap-2.5">
            <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>A</span>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Admin Panel</p>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.2 }}>Administration</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: '10px 8px' }}>
          <div className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 400,
                  background: isActive ? '#0066CC' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-2)',
                  textDecoration: 'none', transition: 'all 0.15s',
                })}
                onMouseEnter={(e) => {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
                  if (!isActive) { e.currentTarget.style.background = 'var(--bg-accent)'; e.currentTarget.style.color = 'var(--text-1)' }
                }}
                onMouseLeave={(e) => {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
                  if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }
                }}
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-2)', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-accent)'; e.currentTarget.style.color = 'var(--text-1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}
            >
              <Home size={15} /> Store
            </NavLink>
          </div>
        </nav>

        {/* User */}
        <div style={{ padding: '12px', borderTop: '1.5px solid var(--border-light)' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=0066CC&color=fff&size=64`}
              alt=""
              style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-1)' }} className="truncate">{user?.name}</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-3)' }} className="truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full transition-colors"
            style={{ padding: '7px 10px', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-2)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#dc2626' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-page)' }}>
        <div style={{ padding: '20px 24px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
