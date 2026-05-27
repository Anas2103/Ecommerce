import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Home, Grid3X3, ShoppingCart, Heart, User } from 'lucide-react'

const LINKS = [
  { to: '/',          icon: Home,        label: 'Home'     },
  { to: '/products',  icon: Grid3X3,     label: 'Shop'     },
  { to: '/cart',      icon: ShoppingCart,label: 'Cart'     },
  { to: '/wishlist',  icon: Heart,       label: 'Wishlist' },
  { to: '/profile',   icon: User,        label: 'Account'  },
]

export default function MobileBottomNav() {
  const cartCount = useSelector((s) => s.cart.items?.reduce((n, i) => n + i.quantity, 0) || 0)

  return (
    <>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-card)',
        borderTop: '1.5px solid var(--border-light)',
        display: 'flex',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      }}
        className="md:hidden"
      >
        {LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '10px 4px 8px', gap: 3,
              textDecoration: 'none', position: 'relative',
              color: isActive ? 'var(--primary)' : 'var(--text-3)',
              transition: 'color 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ position: 'relative' }}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {label === 'Cart' && cartCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, right: -8,
                      background: 'var(--primary-btn)', color: '#fff',
                      fontSize: '0.6rem', fontWeight: 800,
                      minWidth: 16, height: 16, borderRadius: 99,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 4px',
                    }}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500 }}>{label}</span>
                {isActive && (
                  <span style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 24, height: 2.5, background: 'var(--primary)', borderRadius: '0 0 3px 3px',
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
