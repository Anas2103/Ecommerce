import { X, Ruler } from 'lucide-react'

const SIZES = {
  clothing: {
    headers: ['Size', 'Chest (cm)', 'Waist (cm)', 'Hips (cm)', 'Int. Length (cm)'],
    rows: [
      ['XS', '82–86', '63–67', '88–92', '78'],
      ['S',  '87–91', '68–72', '93–97', '79'],
      ['M',  '92–96', '73–77', '98–102','80'],
      ['L',  '97–101','78–83', '103–108','81'],
      ['XL', '102–107','84–89','109–114','82'],
      ['XXL','108–113','90–95','115–120','83'],
    ],
  },
  shoes: {
    headers: ['EU', 'UK', 'US', 'Foot Length (cm)'],
    rows: [
      ['38', '5',   '6',   '24.0'],
      ['39', '5.5', '6.5', '24.7'],
      ['40', '6.5', '7.5', '25.3'],
      ['41', '7',   '8',   '26.0'],
      ['42', '8',   '9',   '26.7'],
      ['43', '9',   '10',  '27.3'],
      ['44', '9.5', '10.5','28.0'],
      ['45', '10.5','11.5','28.7'],
    ],
  },
}

export default function SizeGuideModal({ category = 'clothing', onClose }) {
  const guide = SIZES[category] || SIZES.clothing

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-card)', borderRadius: 18, padding: 32, maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto', border: '1.5px solid var(--border-light)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ruler size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-1)' }}>Size Guide</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 20 }}>
          Measurements are in centimetres. For the best fit, measure yourself and compare to the chart below.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                {guide.headers.map((h) => (
                  <th key={h} style={{ padding: '10px 14px', background: 'var(--bg-accent)', color: 'var(--text-2)', fontWeight: 700, textAlign: 'left', border: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.rows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-page)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '9px 14px', border: '1px solid var(--border-light)', color: j === 0 ? 'var(--primary)' : 'var(--text-1)', fontWeight: j === 0 ? 700 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg-accent)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>
            <strong style={{ color: 'var(--text-1)' }}>Tip:</strong> If you're between sizes, we recommend sizing up for a more comfortable fit.
          </p>
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
          Got it
        </button>
      </div>
    </div>
  )
}
