import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }

  static getDerivedStateFromError(error) { return { hasError: true, error } }

  componentDidCatch(error, info) { console.error('ErrorBoundary caught:', error, info) }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--bg-page)' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fff1f2', border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <AlertTriangle size={28} style={{ color: '#ef4444' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.6 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ padding: '12px 32px', fontSize: '0.9rem' }}
          >
            Refresh Page
          </button>
          {this.state.error && (
            <details style={{ marginTop: 24, textAlign: 'left' }}>
              <summary style={{ fontSize: '0.75rem', color: 'var(--text-3)', cursor: 'pointer' }}>Technical details</summary>
              <pre style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'var(--bg-card)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}
