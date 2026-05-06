export default function StatsSummary({ summary, descriptiveStats, topCorrelations }) {
  const { original_shape, clean_shape, column_types, missing_values } = summary

  const colTypeMap = {}
  column_types.numeric.forEach(c => colTypeMap[c] = 'numeric')
  column_types.categorical.forEach(c => colTypeMap[c] = 'category')
  column_types.datetime.forEach(c => colTypeMap[c] = 'datetime')
  column_types.text.forEach(c => colTypeMap[c] = 'text')

  const badgeClass = { numeric: 'badge-numeric', category: 'badge-category', datetime: 'badge-datetime', text: 'badge-text' }
  const badgeIcon  = { numeric: '🔢', category: '🏷️', datetime: '📅', text: '📝' }

  const missingEntries = Object.entries(missing_values || {})

  const ROWS_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="44" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16" style={{ display: 'block', margin: '0 auto' }}>
      <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
    </svg>
  );

  const COLUMNS_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="44" fill="currentColor" className="bi bi-layout-three-columns" viewBox="0 0 16 16" style={{ display: 'block', margin: '0 auto' }}>
      <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5zM1.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5H5V1zM10 15V1H6v14zm1 0h3.5a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5H11z"/>
    </svg>
  );


  const SEARCH_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="44" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16" style={{ display: 'block', margin: '0 auto' }}>
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
    </svg>
  );

  const CLEAN_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="44" fill="currentColor" class="bi bi-stars" viewBox="0 0 16 16" style={{ display: 'block', margin: '0 auto' }}>
      <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
    </svg>
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>

      {/* Shape cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Rows (original)', value: original_shape.rows.toLocaleString(), icon: ROWS_ICON },
          { label: 'Columns', value: original_shape.cols, icon: COLUMNS_ICON },
          { label: 'After Cleaning', value: clean_shape.rows.toLocaleString(), icon: CLEAN_ICON },
          { label: 'Missing Values', value: missingEntries.length > 0 ? missingEntries.length + ' cols' : 'none', icon: SEARCH_ICON },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Columns */}
      <div className="card">
        <p style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span></span> Columns
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {summary.columns.map(col => (
            <span key={col} className={`badge ${badgeClass[colTypeMap[col]] || 'badge-text'}`}>
              {badgeIcon[colTypeMap[col]] || '?'} {col}
            </span>
          ))}
        </div>
      </div>

      {/* Missing values */}
      {missingEntries.length > 0 && (
        <div className="card">
          <p style={{ fontWeight: 600, marginBottom: 12 }}>Missing Values (automatically filled)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {missingEntries.map(([col, info]) => (
              <div key={col} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{col}</span>
                <span className="mono" style={{ fontSize: 12, color: '#ffb900' }}>{info.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descriptive stats */}
      {Object.keys(descriptiveStats).length > 0 && (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
            Descriptive Statistics
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  <th style={thStyle}>Metric</th>
                  {Object.keys(descriptiveStats).map(col => (
                    <th key={col} style={thStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['count','mean','std','min','25%','50%','75%','max'].map(metric => (
                  <tr key={metric} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ ...tdStyle, fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text-muted)' }}>{metric}</td>
                    {Object.keys(descriptiveStats).map(col => (
                      <td key={col} style={{ ...tdStyle, fontFamily: 'Space Mono' }}>
                        {descriptiveStats[col][metric] !== undefined
                          ? Number(descriptiveStats[col][metric]).toLocaleString(undefined, { maximumFractionDigits: 3 })
                          : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top correlations */}
      {topCorrelations && topCorrelations.length > 0 && (
        <div className="card">
          <p style={{ fontWeight: 600, marginBottom: 12 }}> Top Correlations</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {topCorrelations.map((item, i) => {
              const val = item.correlation
              const abs = Math.abs(val)
              const color = abs > 0.7 ? '#00e5a0' : abs > 0.4 ? '#ffb900' : 'var(--text-muted)'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface2)', borderRadius: 8, padding: '8px 14px' }}>
                  <span style={{ flex: 1, fontSize: 13 }}>{item.col1}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>↔</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{item.col2}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${abs * 100}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                  <span className="mono" style={{ fontSize: 13, color, minWidth: 52, textAlign: 'right' }}>
                    {val > 0 ? '+' : ''}{val.toFixed(3)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const thStyle = { padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, fontFamily: 'Space Mono', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }
const tdStyle = { padding: '8px 14px', color: 'var(--text)', fontFamily: 'Space Mono', fontSize: 12 }