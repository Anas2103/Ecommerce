import { useState, useEffect } from 'react'
import { Settings, Globe, DollarSign, Truck, Bell, Save, Eye, EyeOff } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'general',      label: 'General',      icon: Settings  },
  { key: 'localization', label: 'Localization',  icon: Globe     },
  { key: 'payments',     label: 'Payments',      icon: DollarSign},
  { key: 'shipping',     label: 'Shipping',      icon: Truck     },
  { key: 'notifications',label: 'Notifications', icon: Bell      },
]

const DEFAULT_SETTINGS = {
  store_name: 'Ecommerce.ma',
  store_email: 'support@ecommerce.ma',
  store_phone: '0522 000 000',
  store_address: 'Casablanca, Morocco',
  currency: 'MAD',
  tax_rate: '20',
  maintenance_mode: false,
  free_shipping_threshold: '500',
  default_language: 'fr',
  paypal_enabled: true,
  card_enabled: true,
  cod_enabled: false,
  paypal_client_id: '',
  order_confirmation_email: true,
  shipping_email: true,
  review_email: true,
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [showPaypalKey, setShowPaypalKey] = useState(false)

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => setSettings({ ...DEFAULT_SETTINGS, ...data.data })).catch(() => {
      const saved = localStorage.getItem('admin_settings')
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
    })
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', settings)
      toast.success('Settings saved!')
    } catch {
      localStorage.setItem('admin_settings', JSON.stringify(settings))
      toast.success('Settings saved locally!')
    } finally { setSaving(false) }
  }

  const set = (key, val) => setSettings((s) => ({ ...s, [key]: val }))

  const card = { background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: '28px 32px', boxShadow: 'var(--shadow-card)' }
  const sectionTitle = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ width: 4, height: 32, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)' }}>Site Settings</h1>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary" style={{ gap: 6 }}>
          <Save size={15} /> {saving ? 'Saving…' : 'Save All'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sidebar */}
        <div style={{ ...card, padding: '8px' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 2,
              background: activeTab === key ? 'var(--bg-accent)' : 'transparent',
              color: activeTab === key ? 'var(--primary)' : 'var(--text-2)',
              fontWeight: activeTab === key ? 700 : 500, fontSize: '0.875rem',
              transition: 'all 0.12s',
            }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={card}>
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={sectionTitle}>Store Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'store_name', label: 'Store Name' },
                  { key: 'store_email', label: 'Support Email' },
                  { key: 'store_phone', label: 'Phone Number' },
                  { key: 'store_address', label: 'Address' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{label}</label>
                    <input value={settings[key]} onChange={(e) => set(key, e.target.value)} className="input" />
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 20, borderTop: '1.5px solid var(--border-light)' }}>
                <p style={sectionTitle}>Maintenance Mode</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: settings.maintenance_mode ? 'rgba(239,68,68,0.06)' : 'var(--bg-page)', border: `1.5px solid ${settings.maintenance_mode ? 'rgba(239,68,68,0.25)' : 'var(--border-light)'}`, borderRadius: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: settings.maintenance_mode ? '#ef4444' : 'var(--text-1)' }}>
                      {settings.maintenance_mode ? 'Maintenance mode is ON' : 'Site is live'}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2 }}>When on, visitors see a maintenance page</p>
                  </div>
                  <button
                    onClick={() => set('maintenance_mode', !settings.maintenance_mode)}
                    style={{ width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: settings.maintenance_mode ? '#ef4444' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}
                  >
                    <span style={{ position: 'absolute', top: 3, left: settings.maintenance_mode ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={sectionTitle}>Regional Settings</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Default Currency</label>
                  <select value={settings.currency} onChange={(e) => set('currency', e.target.value)} className="input">
                    {['MAD', 'EUR', 'USD', 'GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Tax Rate (%)</label>
                  <input type="number" min="0" max="100" value={settings.tax_rate} onChange={(e) => set('tax_rate', e.target.value)} className="input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Default Language</label>
                  <select value={settings.default_language} onChange={(e) => set('default_language', e.target.value)} className="input">
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={sectionTitle}>Payment Methods</p>
              {[
                { key: 'card_enabled', label: 'Credit / Debit Card', desc: 'Accept Visa and Mastercard' },
                { key: 'paypal_enabled', label: 'PayPal', desc: 'Accept PayPal payments' },
                { key: 'cod_enabled', label: 'Cash on Delivery', desc: 'Pay when the order arrives' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'var(--bg-page)', border: '1.5px solid var(--border-light)', borderRadius: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>{label}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2 }}>{desc}</p>
                  </div>
                  <button onClick={() => set(key, !settings[key])} style={{ width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: settings[key] ? 'var(--primary-btn)' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
                    <span style={{ position: 'absolute', top: 3, left: settings[key] ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
              ))}
              {settings.paypal_enabled && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>PayPal Client ID</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPaypalKey ? 'text' : 'password'} value={settings.paypal_client_id} onChange={(e) => set('paypal_client_id', e.target.value)} className="input" placeholder="sb-..." style={{ paddingRight: 44 }} />
                    <button onClick={() => setShowPaypalKey(!showPaypalKey)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
                      {showPaypalKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={sectionTitle}>Shipping Settings</p>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Free Shipping Threshold (MAD)</label>
                <input type="number" min="0" value={settings.free_shipping_threshold} onChange={(e) => set('free_shipping_threshold', e.target.value)} className="input" style={{ maxWidth: 200 }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 6 }}>Orders above this amount get free shipping. Set to 0 to disable.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={sectionTitle}>Email Notifications</p>
              {[
                { key: 'order_confirmation_email', label: 'Order Confirmation', desc: 'Send email when order is placed' },
                { key: 'shipping_email', label: 'Shipping Notification', desc: 'Send email when order ships' },
                { key: 'review_email', label: 'Review Request', desc: 'Ask customers for reviews after delivery' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'var(--bg-page)', border: '1.5px solid var(--border-light)', borderRadius: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>{label}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2 }}>{desc}</p>
                  </div>
                  <button onClick={() => set(key, !settings[key])} style={{ width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: settings[key] ? 'var(--primary-btn)' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
                    <span style={{ position: 'absolute', top: 3, left: settings[key] ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
