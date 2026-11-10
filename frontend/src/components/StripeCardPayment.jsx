import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { CreditCard, Lock } from 'lucide-react'
import api from '../services/api'

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Loaded once, and only when a key is configured (Stripe.js is fetched from js.stripe.com).
let stripePromise
const getStripe = () => (stripePromise ??= loadStripe(STRIPE_KEY))

/**
 * Real card payment with Stripe (test or live keys).
 * Flow: server creates a PaymentIntent for the cart total → Stripe confirms the card (incl. 3-D Secure)
 * → onPaid(paymentIntentId) places the order, which the server verifies with Stripe again.
 */
export default function StripeCardPayment(props) {
  return (
    <Elements stripe={getStripe()}>
      <CardForm {...props} />
    </Elements>
  )
}

function CardForm({ shippingMethodId, couponCode, total, disabled, onPaid, payLabel, processingLabel }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const dark = document.documentElement.classList.contains('dark')

  const pay = async () => {
    if (!stripe || !elements) return
    setError('')
    setPaying(true)
    try {
      const { data } = await api.post('/checkout/stripe-intent', { shipping_method_id: shippingMethodId, coupon_code: couponCode })
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: elements.getElement(CardElement) },
      })
      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        await onPaid(paymentIntent.id)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '14px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-input, var(--bg-card))' }}>
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: { fontSize: '15px', color: dark ? '#e6edf5' : '#1a2332', '::placeholder': { color: dark ? '#7d8a9a' : '#94a3b8' } },
              invalid: { color: '#ef4444' },
            },
          }}
          onChange={() => error && setError('')}
        />
      </div>
      {error && <p role="alert" style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>{error}</p>}
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-3)', margin: 0 }}>
        <Lock size={12} /> Payments are processed securely by Stripe. Card details never touch our servers.
      </p>
      <button type="button" onClick={pay} disabled={disabled || paying || !stripe} className="btn-primary w-full justify-center" style={{ padding: '13px', gap: 8 }}>
        <CreditCard size={16} />
        {paying ? processingLabel : `${payLabel} · ${Number(total).toLocaleString('fr-MA')} MAD`}
      </button>
    </div>
  )
}
