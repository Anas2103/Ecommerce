import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Plus, Trash2, User, Lock, MapPin, Gift, Star } from 'lucide-react'
import { setUser } from '../store/authSlice'
import api from '../services/api'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import i18n from '../i18n'

const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { user } = useSelector((s) => s.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', preferred_language: user?.preferred_language || 'fr' })
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [saving, setSaving] = useState(false)
  const [addresses, setAddresses] = useState(null)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [newAddrForm, setNewAddrForm] = useState(null)
  const [points, setPoints] = useState(null)

  useEffect(() => {
    api.get('/orders', { params: { per_page: 100 } }).then(({ data }) => {
      const orders = data.data || []
      const earned = orders
        .filter((o) => ['delivered', 'processing', 'shipped'].includes(o.status))
        .reduce((sum, o) => sum + Math.floor(Number(o.total || 0) / 10), 0)
      setPoints(earned)
    }).catch(() => {})
  }, [])

  const loadAddresses = async () => {
    if (addresses !== null) return
    setLoadingAddresses(true)
    try { const { data } = await api.get('/addresses'); setAddresses(data.data) }
    finally { setLoadingAddresses(false) }
  }

  const handleProfile = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      const { data } = await api.post('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      dispatch(setUser(data.user))
      if (form.preferred_language) { i18n.changeLanguage(form.preferred_language); localStorage.setItem('language', form.preferred_language) }
      toast.success(t('auth.profileUpdated'))
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')) }
    finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.put('/change-password', pwForm)
      setPwForm({ current_password: '', password: '', password_confirmation: '' })
      toast.success(t('auth.passwordChanged'))
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')) }
    finally { setSaving(false) }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const fd = new FormData(); fd.append('avatar', file)
    try {
      const { data } = await api.post('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      dispatch(setUser(data.user)); toast.success('Avatar updated')
    } catch {}
  }

  const saveAddress = async (data) => {
    try {
      const res = await api.post('/addresses', data)
      setAddresses([...(addresses || []), res.data.data]); setNewAddrForm(null)
      toast.success('Address added')
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')) }
  }

  const deleteAddress = async (id) => {
    try { await api.delete(`/addresses/${id}`); setAddresses(addresses.filter((a) => a.id !== id)); toast.success('Address removed') }
    catch {}
  }

  const setDefaultAddress = async (id) => {
    try { await api.post(`/addresses/${id}/set-default`); setAddresses(addresses.map((a) => ({ ...a, is_default: a.id === id }))) }
    catch {}
  }

  const TABS = [
    { key: 'profile',   icon: User,   label: t('profile.editProfile') },
    { key: 'password',  icon: Lock,   label: t('profile.changePassword') },
    { key: 'addresses', icon: MapPin, label: t('profile.addresses') },
  ]

  const inputStyle = {
    width: '100%', height: 44, padding: '0 14px', borderRadius: 10,
    border: '1.5px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-1)',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }
  const onFocus = (e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)'; e.target.style.background = 'var(--bg-card)' }
  const onBlur  = (e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--bg-input)' }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 4, height: 28, background: 'var(--primary)', borderRadius: 3 }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)' }}>{t('profile.title')}</h1>
        </div>

        {/* Avatar card */}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={user?.avatar_url}
              alt={user?.name}
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-accent)' }}
              onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0D6EFD&color=fff`}
            />
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--primary-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '2px solid var(--bg-card)',
            }}>
              <Camera size={13} color="#fff" />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: '1.1rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', margin: '4px 0 8px' }}>{user?.email}</p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
              background: 'var(--bg-accent)', border: '1px solid var(--border-accent)',
              borderRadius: 6, color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize',
            }}>{user?.role}</span>
          </div>
        </div>

        {/* Loyalty points card */}
        {points !== null && (
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-btn) 0%, var(--primary-btn-hover) 100%)',
            borderRadius: 14, padding: '20px 24px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            boxShadow: '0 4px 20px var(--brand-md)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', right: 40, bottom: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Gift size={24} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', margin: '0 0 4px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Loyalty Points</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{points.toLocaleString()}</span>
                <span style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)' }}>pts</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
              {[
                { label: 'Silver', min: 0, max: 500, color: '#94a3b8' },
                { label: 'Gold', min: 500, max: 2000, color: '#f59e0b' },
                { label: 'Platinum', min: 2000, max: Infinity, color: '#818cf8' },
              ].map(({ label, min, max, color }) => {
                const active = points >= min && points < max
                return (
                  <span key={label} style={{ fontSize: '0.72rem', fontWeight: 700, color: active ? color : 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={10} fill={active ? color : 'none'} stroke={active ? color : 'rgba(255,255,255,0.35)'} /> {label}
                  </span>
                )
              })}
            </div>
            <div style={{ width: '100%', marginTop: 4 }}>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 6px' }}>Earn 1 point for every 10 MAD spent on delivered orders</p>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99 }}>
                <div style={{ height: 6, borderRadius: 99, background: '#fff', width: `${Math.min(100, (points % 500) / 5)}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', borderRadius: 12, padding: 6, border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-card)' }}>
          {TABS.map(({ key, icon: Icon, label }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); if (key === 'addresses') loadAddresses() }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                  background: active ? 'var(--primary-btn)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-3)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg-accent)'; e.currentTarget.style.color = 'var(--text-2)' } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)' } }}
              >
                <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: 28, boxShadow: 'var(--shadow-card)' }}>
            <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>{t('auth.name')}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>{t('auth.phone')}</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>{t('profile.language')}</label>
                <select value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })} style={{ ...inputStyle, cursor: 'pointer', height: 44 }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="fr">{t('profile.french')}</option>
                  <option value="en">{t('profile.english')}</option>
                  <option value="ar">{t('profile.arabic')}</option>
                </select>
              </div>
              <div>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? t('common.loading') : t('common.save')}</button>
              </div>
            </form>
          </div>
        )}

        {/* Password tab */}
        {activeTab === 'password' && (
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: 28, boxShadow: 'var(--shadow-card)' }}>
            <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>{t('auth.currentPassword')}</label>
                <input type="password" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>{t('auth.newPassword')}</label>
                <input type="password" value={pwForm.password} onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })} required minLength={8} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>{t('auth.confirmPassword')}</label>
                <input type="password" value={pwForm.password_confirmation} onChange={(e) => setPwForm({ ...pwForm, password_confirmation: e.target.value })} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? t('common.loading') : t('common.save')}</button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses tab */}
        {activeTab === 'addresses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loadingAddresses ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>Loading...</div>
            ) : (
              <>
                {(addresses || []).map((addr) => (
                  <div key={addr.id} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
                      <p style={{ color: 'var(--text-1)', fontWeight: 700, margin: 0 }}>{addr.full_name}</p>
                      <p style={{ color: 'var(--text-2)', margin: 0 }}>{addr.address_line1}, {addr.city}</p>
                      <p style={{ color: 'var(--text-3)', margin: 0 }}>Tel: {addr.phone}</p>
                      {addr.is_default && (
                        <span style={{ display: 'inline-flex', marginTop: 6, padding: '2px 10px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 6, color: '#16a34a', fontSize: '0.72rem', fontWeight: 700 }}>
                          {t('profile.default')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {!addr.is_default && (
                        <button onClick={() => setDefaultAddress(addr.id)}
                          style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--bg-accent)', border: '1px solid var(--border-accent)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-accent)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
                        >
                          {t('profile.setDefault')}
                        </button>
                      )}
                      <button onClick={() => deleteAddress(addr.id)}
                        style={{ padding: '6px 8px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff1f2'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {newAddrForm ? (
                  <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-accent)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { field: 'full_name',     ph: 'Full name' },
                      { field: 'phone',         ph: 'Phone' },
                      { field: 'address_line1', ph: 'Address' },
                      { field: 'city',          ph: 'City' },
                    ].map(({ field, ph }) => (
                      <input
                        key={field}
                        value={newAddrForm[field] || ''}
                        onChange={(e) => setNewAddrForm({ ...newAddrForm, [field]: e.target.value })}
                        placeholder={ph}
                        style={inputStyle}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    ))}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => saveAddress({ ...newAddrForm, country: 'Morocco' })} className="btn-primary">Save</button>
                      <button onClick={() => setNewAddrForm(null)} className="btn-secondary">{t('common.cancel')}</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewAddrForm({ full_name: '', phone: '', address_line1: '', city: '' })}
                    style={{
                      width: '100%', padding: 18,
                      background: 'transparent', border: '2px dashed var(--border)',
                      borderRadius: 14, color: 'var(--text-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-accent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <Plus size={16} /> {t('profile.addAddress')}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
