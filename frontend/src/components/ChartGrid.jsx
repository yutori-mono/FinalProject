import { useEffect, useRef } from 'react'

let PlotlyInstance = null
async function getPlotly() {
  if (!PlotlyInstance) {
    const mod = await import('plotly.js-dist')
    PlotlyInstance = mod.default
  }
  return PlotlyInstance
}

const COLORS = ['#7c6aff','#00e5a0','#ffb900','#ff6b6b','#4ecdc4','#45b7d1']

const LAYOUT_BASE = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { color: '#e8e8f0', family: 'DM Sans, sans-serif', size: 12 },
  xaxis: { gridcolor: '#2a2a3d', linecolor: '#2a2a3d', zerolinecolor: '#2a2a3d' },
  yaxis: { gridcolor: '#2a2a3d', linecolor: '#2a2a3d', zerolinecolor: '#2a2a3d' },
  margin: { t: 40, r: 20, b: 50, l: 60 },
  colorway: COLORS,
  legend: { bgcolor: 'rgba(0,0,0,0)' },
}

function ChartItem({ chart }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current || !chart?.data) return
    let cancelled = false

    getPlotly().then((Plotly) => {
      if (cancelled || !ref.current) return
      const layout = {
        ...LAYOUT_BASE,
        ...(chart.data.layout || {}),
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#e8e8f0', family: 'DM Sans, sans-serif', size: 12 },
        xaxis: { ...LAYOUT_BASE.xaxis, ...(chart.data.layout?.xaxis || {}) },
        yaxis: { ...LAYOUT_BASE.yaxis, ...(chart.data.layout?.yaxis || {}) },
        colorway: COLORS,
      }
      Plotly.newPlot(ref.current, chart.data.data || [], layout, {
        responsive: true, displayModeBar: false,
      })
    })

    return () => {
      cancelled = true
      getPlotly().then((Plotly) => {
        if (ref.current) Plotly.purge(ref.current)
      })
    }
  }, [chart])

  return <div ref={ref} style={{ width: '100%', minHeight: 380 }} />
}

function chartIcon(type) {
  const map = {
    heatmap: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-thermometer-half" viewBox="0 0 16 16">
        <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415"/>
        <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1"/>
      </svg>
    ),
    histogram: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-no-axes-column-icon lucide-chart-no-axes-column">
        <path d="M5 21v-6"/> <path d="M12 21V3"/><path d="M19 21V9"/>
      </svg>
    ),
    bar: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-bar-icon lucide-chart-bar">
        <path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/>
      </svg>
    ),
    pie: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pie-chart-fill" viewBox="0 0 16 16">
        <path d="M15.985 8.5H8.207l-5.5 5.5a8 8 0 0 0 13.277-5.5zM2 13.292A8 8 0 0 1 7.5.015v7.778zM8.5.015V7.5h7.485A8 8 0 0 0 8.5.015" />
      </svg>
    ),
    scatter: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-scatter-icon lucide-chart-scatter">
        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="18.5" cy="5.5" r=".5" fill="currentColor"/>
        <circle cx="11.5" cy="11.5" r=".5" fill="currentColor"/><circle cx="7.5" cy="16.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="14.5" r=".5" fill="currentColor"/>
        <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
      </svg>
    ),
    box: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box2-fill" viewBox="0 0 16 16">
        <path d="M3.75 0a1 1 0 0 0-.8.4L.1 4.2a.5.5 0 0 0-.1.3V15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4.5a.5.5 0 0 0-.1-.3L13.05.4a1 1 0 0 0-.8-.4zM15 4.667V5H1v-.333L1.5 4h6V1h1v3h6z"/>
      </svg>
    ),
    line: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-graph-up" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07"/>
      </svg>
    ),
    default: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-graph-down" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M0 0h1v15h15v1H0zm14.817 11.887a.5.5 0 0 0 .07-.704l-4.5-5.5a.5.5 0 0 0-.74-.037L7.06 8.233 3.404 3.206a.5.5 0 0 0-.808.588l4 5.5a.5.5 0 0 0 .758.06l2.609-2.61 4.15 5.073a.5.5 0 0 0 .704.07"/>
      </svg>
    )
  }
  return map[type] || map.default;
}

export default function ChartGrid({ charts }) {
  if (!charts || charts.length === 0) return null
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bar-chart-line-fill" viewBox="0 0 16 16">
            <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1z" />
          </svg>
        </span> Visualizations
        <span className="mono" style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
          {charts.length} charts
        </span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        {charts.map((chart, i) => (
          <div key={i} className="card fade-up" style={{ animationDelay: `${i * 0.07}s`, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{chartIcon(chart.type)}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{chart.title}</span>
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>{chart.type}</span>
            </div>
            <ChartItem chart={chart} />
          </div>
        ))}
      </div>
    </div>
  )
}
