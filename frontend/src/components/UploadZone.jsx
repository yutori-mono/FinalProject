import { useState, useRef, useCallback } from 'react'

export default function UploadZone({ onFileSelect, isLoading }) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const inputRef = useRef()

  const handleFile = useCallback((file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      alert('Только CSV или Excel файлы')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('Файл слишком большой (макс 50MB)')
      return
    }
    setSelectedFile(file)
    onFileSelect(file)
  }, [onFileSelect])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const fmt = (bytes) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isLoading && inputRef.current.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : selectedFile ? 'var(--accent2)' : 'var(--border)'}`,
          borderRadius: 16,
          padding: '3rem 2rem',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s ease',
          background: dragOver ? 'rgba(124,106,255,0.06)' : 'var(--surface)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
          disabled={isLoading}
        />

        {selectedFile ? (
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}><svg xmlns="http://www.w3.org/2000/svg" width="80" height="44" fill="currentColor" class="bi bi-file-earmark" viewBox="0 0 16 16" style={{ display: 'block', margin: '0 auto' }}>
              <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
                </svg>
            </div>
            <p style={{ color: 'var(--accent2)', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              {selectedFile.name}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'Space Mono' }}>
              {fmt(selectedFile.size)}
            </p>
            {!isLoading && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>
                Click to replace file
              </p>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 52, marginBottom: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="currentColor" className="bi bi-upload" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Drag & drop your file here
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              or click to select
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12, fontFamily: 'Space Mono' }}>
              CSV · XLSX · XLS · up to 50 MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
