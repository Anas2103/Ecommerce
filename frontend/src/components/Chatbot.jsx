import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleChatbot } from '../store/uiSlice'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif"

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

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => dispatch(toggleChatbot())}
        aria-label="Assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          width: 54, height: 54,
          background: '#2196F3',
          border: 'none', borderRadius: 16,
          boxShadow: '0 4px 20px rgba(33,150,243,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(33,150,243,0.45)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(33,150,243,0.35)' }}
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
        style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 50,
          width: 'min(390px, calc(100vw - 32px))',
          height: 520,
          display: 'flex', flexDirection: 'column',
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 12px 48px rgba(33,150,243,0.13), 0 2px 16px rgba(0,0,0,0.08)',
          border: '1.5px solid #d0e8f7',
          fontFamily: FONT,
          transformOrigin: 'bottom right',
          transition: 'opacity 0.28s cubic-bezier(0.32,0.72,0,1), transform 0.28s cubic-bezier(0.32,0.72,0,1)',
          opacity: chatbotOpen ? 1 : 0,
          transform: chatbotOpen ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(12px)',
          pointerEvents: chatbotOpen ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
          borderRadius: '20px 20px 0 0',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 38, height: 38,
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Bot size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9375rem', lineHeight: 1.2, marginBottom: 3 }}>Assistant EShop</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, background: '#4ade80', borderRadius: '50%' }} />
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>{t('chatbot.alwaysAvailable')}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>

              {msg.role === 'bot' && (
                <div style={{ width: 30, height: 30, background: '#e8f4fd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Bot size={14} color="#2196F3" />
                </div>
              )}

              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '0.875rem', lineHeight: 1.55, whiteSpace: 'pre-wrap',
                  fontFamily: FONT,
                  ...(msg.role === 'user'
                    ? { background: '#2196F3', color: '#fff' }
                    : { background: '#f0f7ff', color: '#1a2332', border: '1px solid #d0e8f7' }
                  ),
                }}>
                  {msg.text}
                </div>

                {msg.products?.length > 0 && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {msg.products.map((p) => (
                      <Link
                        key={p.id}
                        to={`/products/${p.slug}`}
                        onClick={() => dispatch(toggleChatbot())}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px',
                          background: '#fff',
                          border: '1.5px solid #d0e8f7',
                          borderRadius: 12,
                          textDecoration: 'none',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2196F3'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(33,150,243,0.12)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d0e8f7'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <img
                          src={p.primary_image_url}
                          alt={p.name}
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: '#f0f7ff' }}
                          onError={(e) => e.target.src = '/placeholder.jpg'}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2196F3', marginTop: 2 }}>{p.final_price?.toLocaleString()} MAD</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {msg.chips?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {msg.chips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        style={{
                          padding: '5px 12px',
                          fontSize: '0.78rem', fontWeight: 600,
                          color: '#2196F3',
                          background: '#e8f4fd',
                          border: '1.5px solid #bde0f7',
                          borderRadius: 999,
                          cursor: 'pointer',
                          fontFamily: FONT,
                          transition: 'background 0.13s, border-color 0.13s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#bde0f7'; e.currentTarget.style.borderColor = '#2196F3' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#e8f4fd'; e.currentTarget.style.borderColor = '#bde0f7' }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div style={{ width: 30, height: 30, background: '#e8f4fd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <User size={14} color="#2196F3" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 30, height: 30, background: '#e8f4fd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={14} color="#2196F3" />
              </div>
              <div style={{ background: '#f0f7ff', border: '1px solid #d0e8f7', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{ width: 6, height: 6, background: '#90c8f0', borderRadius: '50%', animation: 'chatBounce 0.9s ease infinite', animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px 16px',
          borderTop: '1.5px solid #e8f4fd',
          display: 'flex', gap: 10, flexShrink: 0,
          background: '#fafcff',
          borderRadius: '0 0 20px 20px',
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
              borderRadius: 12,
              border: '1.5px solid #d0e8f7',
              background: '#fff',
              color: '#1a2332',
              fontSize: '0.875rem',
              fontFamily: FONT,
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#2196F3'; e.target.style.boxShadow = '0 0 0 3px rgba(33,150,243,0.12)' }}
            onBlur={(e) => { e.target.style.borderColor = '#d0e8f7'; e.target.style.boxShadow = 'none' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, flexShrink: 0,
              background: '#2196F3',
              border: 'none', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
              transition: 'background 0.15s, transform 0.15s, opacity 0.15s',
              opacity: !input.trim() || loading ? 0.4 : 1,
            }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = '#1976D2'; e.currentTarget.style.transform = 'scale(1.06)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2196F3'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes chatBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  )
}

