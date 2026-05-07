import { useState } from 'react'
import '../styles/ResultView.css'

export default function ResultView({ result, onReset }) {
  const [viewMode, setViewMode] = useState('transformed')
  const [copiedField, setCopiedField] = useState(null)

  const copyUrl = (url, field) => {
    navigator.clipboard.writeText(url)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const displayUrl = viewMode === 'transformed'
    ? (result.transformed_url || result.secure_url)
    : (result.original_url || result.secure_url)

  const formatBytes = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="result-view">
      <div className="result-card">
        <div className="result-card-header">
          <div className="result-card-title">
            <span>Result</span>
            <span className="result-card-badge">Success</span>
          </div>
          {result.transformed_url && result.original_url && (
            <div className="comparison-tabs">
              <button
                className={`comparison-tab ${viewMode === 'transformed' ? 'active' : ''}`}
                onClick={() => setViewMode('transformed')}
                id="view-transformed"
              >
                Transformed
              </button>
              <button
                className={`comparison-tab ${viewMode === 'original' ? 'active' : ''}`}
                onClick={() => setViewMode('original')}
                id="view-original"
              >
                Original
              </button>
            </div>
          )}
        </div>

        <div className="result-image-container">
          <img src={displayUrl} alt="Result" className="result-image" id="result-img" />
        </div>

        {(result.width || result.height || result.format || result.bytes) && (
          <div className="result-meta">
            {result.width && (
              <div className="result-meta-item">
                <div className="result-meta-label">Width</div>
                <div className="result-meta-value">{result.width}px</div>
              </div>
            )}
            {result.height && (
              <div className="result-meta-item">
                <div className="result-meta-label">Height</div>
                <div className="result-meta-value">{result.height}px</div>
              </div>
            )}
            {result.format && (
              <div className="result-meta-item">
                <div className="result-meta-label">Format</div>
                <div className="result-meta-value">{result.format.toUpperCase()}</div>
              </div>
            )}
            {result.bytes && (
              <div className="result-meta-item">
                <div className="result-meta-label">Size</div>
                <div className="result-meta-value">{formatBytes(result.bytes)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* URL copy bars */}
      <div className="result-urls">
        {result.transformed_url && (
          <div className="url-group">
            <div className="url-label">Transformed URL</div>
            <div className="url-bar">
              <input type="text" value={result.transformed_url} readOnly id="transformed-url" />
              <button
                className={copiedField === 'transformed' ? 'copied' : ''}
                onClick={() => copyUrl(result.transformed_url, 'transformed')}
                id="copy-transformed"
              >
                {copiedField === 'transformed' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
        <div className="url-group">
          <div className="url-label">{result.transformed_url ? 'Original URL' : 'Image URL'}</div>
          <div className="url-bar">
            <input type="text" value={result.original_url || result.secure_url || ''} readOnly id="original-url" />
            <button
              className={copiedField === 'original' ? 'copied' : ''}
              onClick={() => copyUrl(result.original_url || result.secure_url, 'original')}
              id="copy-original"
            >
              {copiedField === 'original' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="result-actions">
        <button className="btn-new" onClick={onReset} id="upload-another">
          ← Upload Another
        </button>
      </div>
    </div>
  )
}
