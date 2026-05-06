import { useState } from 'react'
import axios from 'axios'

export default function InsightsPanel({ summary, descriptiveStats, topCorrelations, filename }) {
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const generateInsights = async () => {
    setLoading(true)
    setError('')
    setInsights('')
    setDone(false)

    try {
      const res = await axios.post('/insights', {
        filename,
        summary,
        descriptive_stats: descriptiveStats,
        top_correlations: topCorrelations,
      })
      setInsights(res.data.insights)
      setDone(true)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Неизвестная ошибка'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-icon lucide-brain">
          <path d="M12 18V5"/><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/>
            <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.464"/><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.464"/>
            <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/></svg>
        </span>
        <div>
          <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>AI-Insights</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Pattern analysis and business recommendations (Llama 3.3 70B)
          </p>
        </div>
        {!done && (
          <button
            onClick={generateInsights}
            disabled={loading}
            style={{
              marginLeft: 'auto',
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              background: loading ? 'var(--surface2)' : 'var(--accent)',
              color: loading ? 'var(--text-muted)' : '#fff',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              transition: 'all 0.2s',
              fontFamily: 'DM Sans',
            }}
          >
            {loading ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hourglass-split" viewBox="0 0 16 16">
                <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z" />
              </svg>
            ) : ' Generate Insights'}
          </button>
        )}
        {done && (
          <button
            onClick={generateInsights}
            style={{
              marginLeft: 'auto', padding: '8px 16px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
            </svg>
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1.5rem', background: 'var(--surface2)', borderRadius: 10 }}>
          <div style={{ width: 20, height: 20, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)' }}>Llama 3.3 analyzing the dataset...</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 8, color: '#ff8080', fontSize: 14 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
          </svg>
        </div>
      )}

      {insights && (
        <div
          className="fade-up"
          style={{
            background: 'var(--surface2)',
            borderRadius: 10,
            padding: '1.5rem',
            lineHeight: 1.8,
            fontSize: 14,
            whiteSpace: 'pre-wrap',
            color: 'var(--text)',
          }}
        >
          {insights}
        </div>
      )}

      {!insights && !loading && !error && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          Click the button above to get AI analysis of the dataset
        </div>
      )}
    </div>
  )
}
