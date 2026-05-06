export default function PreviewTable({ data, columns }) {
  if (!data || data.length === 0) return null

  return (
    <div className="card fade-up" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontWeight: 600 }}>Data Preview</span>
        <span className="mono" style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>
          first {data.length} rows
        </span>
      </div>
      <div style={{ overflowX: 'auto', maxHeight: 340, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: 'var(--surface2)', zIndex: 1 }}>
              <th style={thStyle}>#</th>
              {columns.map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...tdStyle, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>{i + 1}</td>
                {columns.map(col => (
                  <td key={col} style={tdStyle}>
                    {row[col] === null || row[col] === undefined
                      ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>null</span>
                      : String(row[col]).length > 40
                        ? String(row[col]).slice(0, 40) + '…'
                        : String(row[col])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  color: 'var(--text-muted)',
  fontWeight: 600,
  fontSize: 12,
  fontFamily: 'Space Mono',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--border)',
}

const tdStyle = {
  padding: '8px 14px',
  color: 'var(--text)',
  whiteSpace: 'nowrap',
  maxWidth: 200,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}
