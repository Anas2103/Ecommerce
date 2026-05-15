import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { MapPin, Truck, CreditCard, CheckCircle, Plus } from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { fetchCart } from '../store/cartSlice'
import api from '../services/api'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const steps = ['address', 'shipping', 'payment']
const MAD_TO_USD = 10 // 1 USD ≈ 10 MAD (approximate conversion for PayPal)

function PayPalButtonsWrapper({ total, onSuccess }) {
  const [{ isPending }] = usePayPalScriptReducer()
  if (isPending) {
    return (
      <div style={{ height: 48, borderRadius: 10, background: 'var(--bg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Loading PayPal…</span>
      </div>
    )
  }
  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 }}
      createOrder={(data, actions) =>
        actions.order.create({
          purchase_units: [{
            amount: { currency_code: 'USD', value: (total / MAD_TO_USD).toFixed(2) },
            description: 'Ecommerce Store Order',
          }],
        })
      }
      onApprove={async (data, actions) => {
        const details = await actions.order.capture()
        await onSuccess(details.id)
      }}
      onError={() => toast.error('PayPal payment failed. Please try again.')}
      onCancel={() => toast.error('PayPal payment cancelled.')}
    />
  )
}

function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { user } = useSelector((s) => s.auth)
  const { items, subtotal } = useSelector((s) => s.cart)
  const [step, setStep] = useState(0)
  const [addresses, setAddresses] = useState([])
  const [shippingMethods, setShippingMethods] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedShipping, setSelectedShipping] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [card, setCard] = useState({ name: '', number: '4111 1111 1111 1111', expiry: '12/27', cvv: '123' })
  const [newAddress, setNewAddress] = useState({ full_name: user?.name || '', phone: user?.phone || '', address_line1: '', city: '', country: 'Morocco' })

  useEffect(() => {
    Promise.all([api.get('/addresses'), api.get('/shipping-methods')]).then(([addrRes, shipRes]) => {
      setAddresses(addrRes.data.data)
      setShippingMethods(shipRes.data.data)
      const def = addrRes.data.data.find((a) => a.is_default) || addrRes.data.data[0]
      if (def) setSelectedAddress(def)
      const defShip = shipRes.data.data[0]
      if (defShip) setSelectedShipping(defShip)
    })
  }, [])

  const addAddress = async () => {
    try {
      const { data } = await api.post('/addresses', newAddress)
      setAddresses([...addresses, data.data])
      setSelectedAddress(data.data)
      setShowAddressForm(false)
      toast.success('Address added')
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')) }
  }

  const placeOrder = async (paypalTransactionId = null) => {
    if (!selectedAddress || !selectedShipping) return
    setPlacingOrder(true)
    try {
      const { data } = await api.post('/orders', {
        address_id: selectedAddress.id,
        shipping_method_id: selectedShipping.id,
        payment_method: paypalTransactionId ? 'paypal' : 'card',
        payment_reference: paypalTransactionId || undefined,
        coupon_code: couponCode || undefined,
        notes: '',
      })
      await dispatch(fetchCart())
      toast.success(t('checkout.orderSuccess'))
      navigate(`/orders/${data.data.id}`)
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')) }
    finally { setPlacingOrder(false) }
  }

  const shippingCost = selectedShipping?.price || 0
  const taxableAmount = (subtotal - discount) + Number(shippingCost)
  const tax = Math.round(taxableAmount * 0.2 * 100) / 100
  const total = Math.round((taxableAmount + tax) * 100) / 100

  const stepIcons = [MapPin, Truck, CreditCard]
  const stepLabels = [t('checkout.address'), t('checkout.shipping'), t('checkout.payment')]

  const labelStyle = { fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6, display: 'block' }
  const sectionCard = { background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '24px' }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <section style={{ padding: '8px 16px 32px', boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ ...sectionCard, marginBottom: 20 }}>
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 4, height: 28, background: '#0066CC', borderRadius: 3, flexShrink: 0 }} />
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>{t('checkout.title')}</h1>
          </div>

          {/* Step indicator */}
          <div className="flex items-center">
            {steps.map((s, i) => {
              const Icon = stepIcons[i]
              const done = i < step
              const active = i === step
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex items-center gap-2.5">
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: done ? '#0066CC' : active ? 'var(--bg-accent)' : 'var(--bg-page)',
                      border: done ? 'none' : active ? '2px solid #0066CC' : '1.5px solid var(--border)',
                      color: done ? '#fff' : active ? '#0066CC' : 'var(--text-3)',
                    }}>
                      {done ? <CheckCircle size={17} /> : <Icon size={15} />}
                    </div>
                    <span className="hidden sm:block" style={{ fontSize: '0.82rem', fontWeight: active || done ? 700 : 400, color: active || done ? 'var(--text-1)' : 'var(--text-3)' }}>
                      {stepLabels[i]}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 mx-3" style={{ height: 2, borderRadius: 9999, background: done ? '#0066CC' : 'var(--border-light)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1: Address */}
            {step === 0 && (
              <div style={sectionCard}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>{t('checkout.address')}</h2>
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className="flex items-start gap-3 cursor-pointer transition-all"
                      style={{
                        padding: '14px 16px', borderRadius: 10,
                        border: selectedAddress?.id === addr.id ? '2px solid #0066CC' : '1.5px solid var(--border-light)',
                        background: selectedAddress?.id === addr.id ? 'var(--bg-accent)' : 'var(--bg-page)',
                      }}
                    >
                      <input type="radio" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} style={{ marginTop: 3, accentColor: '#0066CC' }} />
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>{addr.full_name}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginTop: 2 }}>{addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{addr.city}{addr.postal_code && `, ${addr.postal_code}`} · {addr.country}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>Tel: {addr.phone}</p>
                        {addr.is_default && <span style={{ display: 'inline-block', marginTop: 4, fontSize: '0.68rem', fontWeight: 700, padding: '1px 8px', borderRadius: 9999, background: 'var(--bg-accent)', color: '#0066CC', border: '1px solid var(--border-accent)' }}>{t('profile.default')}</span>}
                      </div>
                    </label>
                  ))}

                  {showAddressForm ? (
                    <div style={{ padding: '16px', borderRadius: 10, border: '1.5px solid var(--border-accent)', background: 'var(--bg-page)' }}>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label style={labelStyle}>Full name</label>
                          <input value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} className="input text-sm" />
                        </div>
                        <div>
                          <label style={labelStyle}>Phone</label>
                          <input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="input text-sm" />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label style={labelStyle}>Address</label>
                        <input value={newAddress.address_line1} onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })} className="input text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label style={labelStyle}>City</label>
                          <input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="input text-sm" />
                        </div>
                        <div>
                          <label style={labelStyle}>Country</label>
                          <input value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="input text-sm" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={addAddress} className="btn-primary text-sm">Save</button>
                        <button onClick={() => setShowAddressForm(false)} className="btn-secondary text-sm">{t('common.cancel')}</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-2 w-full transition-all"
                      style={{ padding: '13px 16px', borderRadius: 10, border: '1.5px dashed var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-3)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0066CC'; e.currentTarget.style.color = '#0066CC' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)' }}
                    >
                      <Plus size={15} /> {t('checkout.addAddress')}
                    </button>
                  )}
                </div>
                <button onClick={() => setStep(1)} disabled={!selectedAddress} className="btn-primary mt-5 w-full justify-center">
                  {t('common.next')} →
                </button>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 1 && (
              <div style={sectionCard}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>{t('checkout.shipping')}</h2>
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center gap-3 cursor-pointer transition-all"
                      style={{
                        padding: '14px 16px', borderRadius: 10,
                        border: selectedShipping?.id === method.id ? '2px solid #0066CC' : '1.5px solid var(--border-light)',
                        background: selectedShipping?.id === method.id ? 'var(--bg-accent)' : 'var(--bg-page)',
                      }}
                    >
                      <input type="radio" checked={selectedShipping?.id === method.id} onChange={() => setSelectedShipping(method)} style={{ accentColor: '#0066CC' }} />
                      <div style={{ width: 36, height: 36, background: 'var(--bg-accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Truck size={17} style={{ color: '#0066CC' }} />
                      </div>
                      <div className="flex-1">
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>{method.name_en || method.name_fr || method.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 1 }}>{method.estimated_days_min}–{method.estimated_days_max} business days</p>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: Number(method.price) === 0 ? '#16a34a' : 'var(--text-1)', flexShrink: 0 }}>
                        {Number(method.price) === 0 ? 'Free' : `${Number(method.price).toLocaleString()} MAD`}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep(0)} className="btn-secondary flex-1 justify-center">{t('common.back')}</button>
                  <button onClick={() => setStep(2)} disabled={!selectedShipping} className="btn-primary flex-1 justify-center">{t('common.next')} →</button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 2 && (
              <div style={sectionCard}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>{t('checkout.payment')}</h2>

                {/* Payment method selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    {
                      id: 'card',
                      label: 'Credit Card',
                      desc: 'Visa, Mastercard',
                      icon: (
                        <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                          <rect width="22" height="16" rx="3" fill="#1a56db"/>
                          <rect y="4" width="22" height="4" fill="#1e429f"/>
                          <rect x="2" y="11" width="6" height="2" rx="1" fill="#93c5fd"/>
                          <rect x="10" y="11" width="3" height="2" rx="1" fill="#93c5fd"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'paypal',
                      label: 'PayPal',
                      desc: 'Pay with PayPal',
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path d="M7.5 3h7c2.8 0 4.5 1.5 4 4.2-.6 3-2.8 4.8-5.6 4.8H11l-1 5H7.2L9 3z" fill="#009cde"/>
                          <path d="M5 21h2.5l.5-2.5H10c3.3 0 5.7-2 6.3-5.3.4-2.3-.8-4.2-3-4.2H9.5L7 21z" fill="#012169"/>
                        </svg>
                      ),
                    },
                  ].map(({ id, label, desc, icon }) => {
                    const active = paymentMethod === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer',
                          border: active ? '2px solid #0066CC' : '1.5px solid var(--border-light)',
                          borderRadius: 10, background: active ? 'var(--bg-accent)' : 'var(--bg-page)',
                          transition: 'all 0.13s', textAlign: 'left',
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: active ? '#0066CC' : 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.13s' }}>
                          {icon}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: active ? '#0066CC' : 'var(--text-1)', lineHeight: 1.2 }}>{label}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>{desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Card form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div style={{ padding: '10px 14px', borderRadius: 9, background: '#fefce8', border: '1px solid #fde68a', color: '#b45309', fontSize: '0.78rem' }}>
                      ⚠️ Simulated payment — no real transaction will be processed
                    </div>
                    {[
                      { label: t('checkout.cardName'), key: 'name', type: 'text' },
                      { label: t('checkout.cardNumber'), key: 'number', type: 'text', maxLength: 19, mono: true },
                    ].map(({ label, key, type, maxLength, mono }) => (
                      <div key={key}>
                        <label style={labelStyle}>{label}</label>
                        <input
                          type={type}
                          value={card[key]}
                          onChange={(e) => setCard({ ...card, [key]: e.target.value })}
                          className={`input${mono ? ' font-mono' : ''}`}
                          maxLength={maxLength}
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label style={labelStyle}>{t('checkout.expiry')}</label>
                        <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} className="input" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label style={labelStyle}>{t('checkout.cvv')}</label>
                        <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} className="input" maxLength={4} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Promo code (optional)</label>
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME10" className="input" />
                    </div>
                  </div>
                )}

                {/* PayPal section */}
                {paymentMethod === 'paypal' && (
                  <div className="space-y-4">
                    <div style={{ padding: '10px 14px', borderRadius: 9, background: 'var(--bg-accent)', border: '1px solid var(--border-accent)', color: 'var(--text-2)', fontSize: '0.78rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0 }}>ℹ️</span>
                      <span>
                        You'll be redirected to PayPal to complete the payment.
                        Amount charged: <strong style={{ color: 'var(--text-1)' }}>${(total / MAD_TO_USD).toFixed(2)} USD</strong>
                        {' '}(≈ {total.toLocaleString()} MAD)
                      </span>
                    </div>
                    <div>
                      <label style={labelStyle}>Promo code (optional)</label>
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME10" className="input" />
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <PayPalButtonsWrapper total={total} onSuccess={(txId) => placeOrder(txId)} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">{t('common.back')}</button>
                  {paymentMethod === 'card' && (
                    <button
                      onClick={() => placeOrder()}
                      disabled={placingOrder}
                      className="btn-primary flex-1 justify-center"
                      style={{ padding: '11px 16px', gap: 8 }}
                    >
                      <CreditCard size={16} />
                      {placingOrder ? t('checkout.processing') : `${t('checkout.placeOrder')} · ${total.toLocaleString()} MAD`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div style={{ ...sectionCard, height: 'fit-content', position: 'sticky', top: 90 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>{t('checkout.summary')}</h3>

            <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 16 }} className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.product?.primary_image_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: 'var(--bg-page)' }} onError={(e) => e.target.src = '/placeholder.jpg'} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-1)', fontWeight: 500 }} className="truncate">{item.product?.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>×{item.quantity}</p>
                  </div>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-1)', flexShrink: 0 }}>{(item.price * item.quantity).toLocaleString()} MAD</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1.5px solid var(--border-light)', paddingTop: 14 }} className="space-y-2">
              {[
                { label: t('cart.subtotal'), value: `${subtotal.toLocaleString()} MAD` },
                discount > 0 ? { label: 'Discount', value: `-${discount.toLocaleString()} MAD`, green: true } : null,
                { label: t('cart.shipping'), value: Number(shippingCost) === 0 ? 'Free' : `${shippingCost} MAD`, green: Number(shippingCost) === 0 },
                { label: t('cart.tax'), value: `${tax.toLocaleString()} MAD` },
              ].filter(Boolean).map((row) => (
                <div key={row.label} className="flex justify-between" style={{ fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>{row.label}</span>
                  <span style={{ color: row.green ? '#16a34a' : 'var(--text-2)', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between" style={{ borderTop: '1.5px solid var(--border-light)', paddingTop: 10, marginTop: 4 }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-1)' }}>{t('cart.total')}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0066CC' }}>{total.toLocaleString()} MAD</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function CheckoutPageWithPayPal() {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
  if (!clientId || clientId === 'YOUR_PAYPAL_SANDBOX_CLIENT_ID') {
    return <CheckoutPage />
  }
  return (
    <PayPalScriptProvider options={{ 'client-id': clientId, currency: 'USD', components: 'buttons' }}>
      <CheckoutPage />
    </PayPalScriptProvider>
  )
}
