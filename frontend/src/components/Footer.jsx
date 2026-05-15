import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

const SHOP_LINKS = [
  { to: '/products',               label: 'Tous les produits' },
  { to: '/products?featured=true', label: 'Produits vedettes' },
  { to: '/products?in_stock=true', label: 'En stock' },
  { to: '/products?sort=newest',   label: 'Nouveautés' },
  { to: '/products?sort=popular',  label: 'Populaires' },
]

const ACCOUNT_LINKS = [
  { to: '/login',    label: 'Connexion' },
  { to: '/register', label: 'Créer un compte' },
  { to: '/orders',   label: 'Mes commandes' },
  { to: '/profile',  label: 'Mon profil' },
  { to: '/wishlist', label: 'Mes favoris' },
]

const SOCIALS = [
  { text: 'f',  href: '#', label: 'Facebook' },
  { text: 'in', href: '#', label: 'Instagram' },
  { text: 'X',  href: '#', label: 'Twitter/X' },
  { text: '▶',  href: '#', label: 'YouTube' },
]

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderRadius: 8,
        fontSize: '0.875rem', fontWeight: 500,
        color: '#8ab0d0', textDecoration: 'none',
        border: '1px solid transparent',
        transition: 'all 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,102,204,0.25)'
        e.currentTarget.style.color = '#fff'
        e.currentTarget.style.borderColor = 'rgba(0,102,204,0.5)'
        e.currentTarget.style.boxShadow = '0 0 16px rgba(0,102,204,0.35)'
        e.currentTarget.style.transform = 'translateX(5px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = '#8ab0d0'
        e.currentTarget.style.borderColor = 'transparent'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateX(0)'
      }}
    >
      <ArrowRight size={12} style={{ opacity: 0.45, flexShrink: 0 }} />
      {children}
    </Link>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(160deg, #09111f 0%, #0c1a32 55%, #071018 100%)', marginTop: 'auto' }}>
      {/* Glowing top border */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, transparent 0%, #0066CC 30%, #4da6ff 50%, #0066CC 70%, transparent 100%)' }} />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 32px 32px' }}>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.5fr', gap: 48, marginBottom: 56 }}>

          {/* ── Brand ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 42, height: 42, background: '#0066CC', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(0,102,204,0.55)',
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, lineHeight: 1 }}>E</span>
              </div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em' }}>Ecommerce</span>
            </div>
            <p style={{ color: '#6a90b4', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 28, maxWidth: 280 }}>
              Votre boutique en ligne de confiance au Maroc. Des milliers de produits livrés rapidement directement chez vous.
            </p>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {['Livraison 48h', 'Paiement sécurisé', 'Retours gratuits'].map((badge) => (
                <span key={badge} style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(0,102,204,0.15)',
                  border: '1px solid rgba(0,102,204,0.3)',
                  color: '#4da6ff', fontSize: '0.72rem', fontWeight: 600,
                }}>
                  {badge}
                </span>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map(({ text, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#6a90b4',
                    fontWeight: 800, fontSize: '0.8rem',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0066CC'
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.borderColor = '#0066CC'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0,102,204,0.6)'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = '#6a90b4'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {text}
                </a>
              ))}
            </div>
          </div>

          {/* ── Boutique ── */}
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              Boutique
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: -12 }}>
              {SHOP_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to}>{label}</NavLink>
              ))}
            </div>
          </div>

          {/* ── Mon compte ── */}
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              Mon compte
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: -12 }}>
              {ACCOUNT_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to}>{label}</NavLink>
              ))}
            </div>
          </div>

          {/* ── Contact + Newsletter ── */}
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              Contact & Infos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
              {[
                { icon: Phone,  text: '0522 000 000' },
                { icon: Mail,   text: 'support@ecommerce.ma' },
                { icon: MapPin, text: 'Casablanca, Maroc' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: 'rgba(0,102,204,0.2)',
                    border: '1px solid rgba(0,102,204,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={15} style={{ color: '#4da6ff' }} />
                  </div>
                  <span style={{ color: '#8ab0d0', fontSize: '0.875rem' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', marginBottom: 12 }}>
                Newsletter
              </p>
              <p style={{ color: '#6a90b4', fontSize: '0.78rem', marginBottom: 12 }}>
                Offres exclusives et nouveautés directement dans votre boîte mail.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  style={{
                    flex: 1, minWidth: 0, padding: '9px 14px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff', fontSize: '0.82rem', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#0066CC'; e.target.style.boxShadow = '0 0 0 3px rgba(0,102,204,0.2)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  style={{
                    padding: '9px 18px', borderRadius: 9, border: 'none',
                    background: '#0066CC', color: '#fff',
                    fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.18s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0052A3'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,102,204,0.55)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#0066CC'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ color: '#3d5a78', fontSize: '0.82rem' }}>© 2025 Ecommerce.ma — Tous droits réservés.</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['SAV 7j/7', 'Livraison 48h', 'Paiement 100% sécurisé', 'Retours gratuits'].map((item) => (
              <span key={item} style={{ color: '#3d5a78', fontSize: '0.82rem' }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
