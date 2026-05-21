import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { X, ShoppingCart, Star } from 'lucide-react'
import { clearCompare, toggleCompare } from '../store/compareSlice'
import { addToCart } from '../store/cartSlice'
import { setCartOpen } from '../store/uiSlice'
import toast from 'react-hot-toast'

const ROWS = [
  { label: 'Price',    render: (p) => `${Number(p.final_price ?? p.price).toLocaleString()} MAD` },
  { label: 'Category', render: (p) => p.category?.name || '—' },
  { label: 'Rating',   render: (p) => p.average_rating > 0 ? `${p.average_rating} / 5` : 'No reviews' },
  { label: 'Stock',    render: (p) => p.stock > 0 ? `${p.stock} in stock` : 'Out of stock' },
  { label: 'Discount', render: (p) => p.discount_percent > 0 ? `-${p.discount_percent}%` : 'None' },
  { label: 'SKU',      render: (p) => p.sku || '—' },
]

export default function ComparePage() {
  const dispatch = useDispatch()
  const items = useSelector((s) => s.compare.items)

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: 1 })).unwrap()
      dispatch(setCartOpen(true))
      toast.success('Added to cart')
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Error') }
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 28, background: 'var(--primary)', borderRadius: 3 }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>Compare Products</h1>
          </div>
          {items.length > 0 && (
            <button onClick={() => dispatch(clearCompare())} style={{ fontSize: '0.84rem', color: '#ef4444', background: 'none', border: '1.5px solid #fecaca', borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}>
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-2)', marginBottom: 20 }}>No products to compare. Add up to 4 products using the compare button on any product card.</p>
            <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 28px' }}>Browse Products</Link>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr>
                    <td style={{ width: 120, padding: '20px 20px', borderBottom: '1.5px solid var(--border-light)', background: 'var(--bg-page)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product</td>
                    {items.map((p) => (
                      <td key={p.id} style={{ padding: '20px 16px', borderBottom: '1.5px solid var(--border-light)', textAlign: 'center', verticalAlign: 'top', position: 'relative' }}>
                        <button onClick={() => dispatch(toggleCompare(p))} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 4 }}>
                          <X size={14} />
                        </button>
                        <img src={p.primary_image_url} alt={p.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} onError={(e) => e.target.src = '/placeholder.jpg'} />
                        <Link to={`/products/${p.slug}`} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)', textDecoration: 'none', marginBottom: 12, lineHeight: 1.4 }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-1)'}
                        >{p.name}</Link>
                        {p.stock > 0 && (
                          <button onClick={() => handleAddToCart(p)} className="btn-primary" style={{ fontSize: '0.78rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <ShoppingCart size={13} /> Add to Cart
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(({ label, render }, ri) => (
                    <tr key={label} style={{ background: ri % 2 === 0 ? 'var(--bg-page)' : 'transparent' }}>
                      <td style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-2)', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>{label}</td>
                      {items.map((p) => (
                        <td key={p.id} style={{ padding: '14px 16px', fontSize: '0.875rem', color: 'var(--text-1)', textAlign: 'center', borderBottom: '1px solid var(--border-light)' }}>
                          {render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
