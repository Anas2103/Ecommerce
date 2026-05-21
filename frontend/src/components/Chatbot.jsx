import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Trash2, Minimize2, Sparkles } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleChatbot } from '../store/uiSlice'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif"

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <div style={{
        width: 30, height: 30,
        background: 'var(--bg-accent)',
        border: '1px solid var(--border)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Bot size={14} color="var(--primary)" />
      </div>
      <div style={{
        background: 'var(--bg-accent)',
        border: '1px solid var(--border)',
        padding: '12px 16px',
        borderRadius: '16px 16px 16px 4px',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 7, height: 7,
            background: 'var(--border-accent)',
            borderRadius: '50%',
            animation: 'chatBounce 1s ease infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

function BotMessage({ msg, onChipClick }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <div style={{
        width: 30, height: 30,
        background: 'var(--bg-accent)',
        border: '1px solid var(--border)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Bot size={14} color="var(--primary)" />
      </div>
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: '16px 16px 16px 4px',
          fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
          background: 'var(--bg-accent)',
          color: 'var(--text-1)',
          border: '1px solid var(--border)',
          fontFamily: FONT,
        }}>
          {msg.text}
        </div>

        {msg.products?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {msg.products.map((p) => (
              <ProductChip key={p.id} product={p} />
            ))}
          </div>
        )}

        {msg.chips?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {msg.chips.map((chip) => (
              <button
                key={chip}
                onClick={() => onChipClick(chip)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem', fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'var(--bg-accent)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  transition: 'background 0.13s, border-color 0.13s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-light)'; e.currentTarget.style.borderColor = 'var(--border-accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-accent)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UserMessage({ text }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      <div style={{ maxWidth: '78%' }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: '16px 16px 4px 16px',
          fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
          background: 'var(--primary-btn)',
          color: '#fff',
          fontFamily: FONT,
        }}>
          {text}
        </div>
      </div>
      <div style={{
        width: 30, height: 30,
        background: 'var(--bg-accent)',
        border: '1px solid var(--border)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <User size={14} color="var(--primary)" />
      </div>
    </div>
  )
}

function ProductChip({ product: p }) {
  const dispatch = useDispatch()
  return (
    <Link
      to={`/products/${p.slug}`}
      onClick={() => dispatch(toggleChatbot())}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        borderRadius: 12,
        textDecoration: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-accent)'
        e.currentTarget.style.boxShadow = '0 2px 10px var(--primary-glow)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'none'
      }}
    >
      <img
        src={p.primary_image_url}
        alt={p.name}
        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: 'var(--bg-accent)' }}
        onError={(e) => { e.target.src = '/placeholder.jpg' }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>
          {p.final_price?.toLocaleString()} MAD
          {p.discount_percent > 0 && (
            <span style={{ marginLeft: 6, fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-3)', textDecoration: 'line-through' }}>
              {p.price?.toLocaleString()}
            </span>
          )}
        </p>
      </div>
      {p.discount_percent > 0 && (
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, color: '#fff',
          background: '#ef4444', borderRadius: 6, padding: '2px 6px', flexShrink: 0,
        }}>
          -{p.discount_percent}%
        </span>
      )}
    </Link>
  )
}

export default function Chatbot() {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
  const { chatbotOpen } = useSelector((s) => s.ui)

  const makeWelcome = () => ({
    role: 'bot',
    text: t('chatbot.welcome'),
    chips: t('chatbot.chips', { returnObjects: true }),
  })

  const [messages, setMessages] = useState(() => [makeWelcome()])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (chatbotOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [chatbotOpen])

  useEffect(() => {
    setMessages([makeWelcome()])
  }, [i18n.language])

  const sendMessage = async (text = input) => {
    const userMsg = typeof text === 'string' ? text.trim() : input.trim()
    if (!userMsg || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const { data } = await api.post('/chatbot', { message: userMsg })
      setMessages((m) => [...m, { role: 'bot', text: data.message, chips: data.chips, products: data.products }])
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: t('chatbot.error') }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => setMessages([makeWelcome()])

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => dispatch(toggleChatbot())}
        aria-label="Assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          width: 54, height: 54,
          background: 'var(--primary-btn)',
          border: 'none', borderRadius: 16,
          boxShadow: '0 4px 20px var(--primary-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.boxShadow = '0 8px 28px var(--primary-glow-h)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--primary-glow)' }}
      >
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s, transform 0.2s', opacity: chatbotOpen ? 1 : 0, transform: chatbotOpen ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(90deg)' }}>
          <X size={21} />
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s, transform 0.2s', opacity: chatbotOpen ? 0 : 1, transform: chatbotOpen ? 'scale(0) rotate(-90deg)' : 'scale(1) rotate(0deg)' }}>
          <MessageCircle size={21} />
        </div>
      </button>

      {/* Chat panel */}
      <div
        role="dialog"
        aria-label="Assistant EShop"
        style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 50,
          width: 'min(400px, calc(100vw - 32px))',
          height: 'min(560px, calc(100vh - 110px))',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-card)',
          borderRadius: 20,
          boxShadow: '0 16px 56px rgba(0,0,0,0.18), 0 2px 16px rgba(0,0,0,0.08)',
          border: '1.5px solid var(--border-light)',
          fontFamily: FONT,
          transformOrigin: 'bottom right',
          transition: 'opacity 0.28s cubic-bezier(0.32,0.72,0,1), transform 0.28s cubic-bezier(0.32,0.72,0,1)',
          opacity: chatbotOpen ? 1 : 0,
          transform: chatbotOpen ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(12px)',
          pointerEvents: chatbotOpen ? 'auto' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'var(--nav-bg)',
          borderRadius: '18px 18px 0 0',
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0,
        }}>
          <div style={{
            width: 40, height: 40,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9375rem', lineHeight: 1.2, marginBottom: 3 }}>
              Assistant EShop
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 7, height: 7, background: '#4ade80', borderRadius: '50%',
                animation: 'chatPulse 2s ease infinite',
              }} />
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>
                {t('chatbot.alwaysAvailable')}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={clearChat}
              title="Clear chat"
              style={{
                width: 32, height: 32, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => dispatch(toggleChatbot())}
              title="Close"
              style={{
                width: 32, height: 32, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            >
              <Minimize2 size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: 14,
          background: 'var(--bg-page)',
        }}>
          {messages.map((msg, i) =>
            msg.role === 'bot'
              ? <BotMessage key={i} msg={msg} onChipClick={sendMessage} />
              : <UserMessage key={i} text={msg.text} />
          )}
          {loading && <TypingDots />}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '10px 12px 12px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex', gap: 8, flexShrink: 0,
          background: 'var(--bg-card)',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={t('chatbot.placeholder')}
            style={{
              flex: 1, height: 42,
              padding: '0 14px',
              borderRadius: 11,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-1)',
              fontSize: '0.875rem',
              fontFamily: FONT,
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, flexShrink: 0,
              background: 'var(--primary-btn)',
              border: 'none', borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
              transition: 'background 0.15s, transform 0.15s, opacity 0.15s',
              opacity: !input.trim() || loading ? 0.4 : 1,
            }}
            onMouseEnter={(e) => { if (input.trim() && !loading) { e.currentTarget.style.background = 'var(--primary-btn-hover)'; e.currentTarget.style.transform = 'scale(1.06)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary-btn)'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes chatPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </>
  )
}
