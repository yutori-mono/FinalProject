import { useState } from 'react'
import axios from 'axios'
import UploadZone from './components/UploadZone'
import PreviewTable from './components/PreviewTable'
import StatsSummary from './components/StatsSummary'
import ChartGrid from './components/ChartGrid'
import InsightsPanel from './components/InsightsPanel'

const TABS = ['Review', 'Statistics', 'Charts', 'AI-Insights']

export default function App() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = (f) => {
    setFile(f)
    setResult(null)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(0)

    // Fake progress animation
    const interval = setInterval(() => {
      setProgress(p => p < 85 ? p + Math.random() * 12 : p)
    }, 400)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        setResult(res.data)
        setActiveTab(0)
        setLoading(false)
      }, 400)
    } catch (err) {
      clearInterval(interval)
      const msg = err.response?.data?.detail || err.message || 'Unknown error'
      setError(msg)
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError('')
    setProgress(0)
  }

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 60px' }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 60,
        background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <span style={{ fontSize: 22 }}>🔬</span>
        <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
          DataAnalyzer
        </span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Big Data EDA</span>
        {result && (
          <button onClick={handleReset} style={{
            marginLeft: 'auto', padding: '6px 14px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans',
          }}>
            ← New File
          </button>
        )}
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Hero — upload state */}
        {!result && (
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>
              Upload a dataset —<br />
              <span style={{ color: 'var(--accent)' }}>get a full analysis</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 40 }}>
              EDA, visualizations, correlations and AI insights automatically
            </p>

            <UploadZone onFileSelect={handleFileSelect} isLoading={loading} />

            {file && !loading && (
              <button
                onClick={handleAnalyze}
                className="fade-up"
                style={{
                  marginTop: 24,
                  padding: '14px 48px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent), #9b8bff)',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'DM Sans',
                  boxShadow: '0 4px 24px rgba(124,106,255,0.4)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(124,106,255,0.5)' }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 24px rgba(124,106,255,0.4)' }}
              >
                🚀 Analyze Dataset
              </button>
            )}

            {/* Loading */}
            {loading && (
              <div className="fade-up" style={{ marginTop: 32 }}>
                <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: 'var(--surface2)', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent2))', width: `${progress}%`, transition: 'width 0.4s ease', borderRadius: 8 }} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>
                  {progress < 30 ? '📂 Reading file...' : progress < 60 ? '🧹 Cleaning data...' : progress < 85 ? '📊 Generating charts...' : '✅ Almost ready...'}
                </p>
              </div>
            )}

            {error && (
              <div className="fade-up" style={{ marginTop: 20, maxWidth: 480, margin: '20px auto 0', padding: '1rem', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 8, color: '#ff8080', fontSize: 14 }}>
                ❌ {error}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="fade-up">
            {/* Filename banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <span style={{ fontSize: 20 }}></span>
              <span className="mono" style={{ fontSize: 15, color: 'var(--accent2)' }}>{result.filename}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 'auto' }}>
                {result.summary.clean_shape.rows.toLocaleString()} rows × {result.summary.clean_shape.cols} columns
              </span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
              {TABS.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  style={{
                    padding: '10px 18px',
                    border: 'none',
                    background: 'transparent',
                    color: activeTab === i ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: activeTab === i ? 600 : 400,
                    borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: -1,
                    fontFamily: 'DM Sans',
                    transition: 'color 0.2s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 0 && (
              <PreviewTable data={result.preview} columns={result.summary.columns} />
            )}
            {activeTab === 1 && (
              <StatsSummary
                summary={result.summary}
                descriptiveStats={result.descriptive_stats}
                topCorrelations={result.top_correlations}
              />
            )}
            {activeTab === 2 && (
              <ChartGrid charts={result.charts} />
            )}
            {activeTab === 3 && (
              <InsightsPanel
                summary={result.summary}
                descriptiveStats={result.descriptive_stats}
                topCorrelations={result.top_correlations}
                filename={result.filename}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
