import { useState, useMemo } from 'react'
import '../styles/AspectRatioPanel.css'

const PRESETS = [
  { id: '1_1', label: '1:1 Square', ratio: '1:1', desc: 'Instagram, Profile' },
  { id: '4_3', label: '4:3 Standard', ratio: '4:3', desc: 'Photos, Slides' },
  { id: '3_2', label: '3:2 Classic', ratio: '3:2', desc: 'Photography' },
  { id: '16_9', label: '16:9 Widescreen', ratio: '16:9', desc: 'YouTube, Video' },
  { id: '9_16', label: '9:16 Portrait', ratio: '9:16', desc: 'Stories, Reels' },
  { id: '21_9', label: '21:9 Ultrawide', ratio: '21:9', desc: 'Banners, Hero' },
  { id: '4_5', label: '4:5 Portrait', ratio: '4:5', desc: 'Instagram Post' },
  { id: '2_1', label: '2:1 Panoramic', ratio: '2:1', desc: 'Headers' },
  { id: 'custom', label: 'Custom', ratio: 'custom', desc: 'Your size' },
]

export default function AspectRatioPanel({ file, onRemoveFile, onTransform, onUploadOnly, isLoading }) {
  const [selectedRatio, setSelectedRatio] = useState('16_9')
  const [customW, setCustomW] = useState('')
  const [customH, setCustomH] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [crop, setCrop] = useState('fill')
  const [quality, setQuality] = useState('auto')
  const [format, setFormat] = useState('auto')

  const preview = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const handleTransform = () => {
    const preset = PRESETS.find(p => p.id === selectedRatio)
    const params = {
      aspect_ratio: preset?.ratio === 'custom' ? null : preset?.ratio,
      width: selectedRatio === 'custom' ? customW : null,
      height: selectedRatio === 'custom' ? customH : null,
      crop,
      quality,
      format,
    }
    onTransform(params)
  }

  if (!file) return null

  return (
    <div className="transform-panel">
      {/* Selected file bar */}
      <div className="selected-file">
        {preview && <img src={preview} alt="Preview" className="selected-file-preview" />}
        <div className="selected-file-info">
          <div className="selected-file-name">{file.name}</div>
          <div className="selected-file-meta">{formatSize(file.size)} · {file.type.split('/')[1]?.toUpperCase()}</div>
        </div>
        <button className="selected-file-remove" onClick={onRemoveFile} title="Remove file" id="remove-file">×</button>
      </div>

      {/* Aspect ratio selection */}
      <div className="section-label">Aspect Ratio</div>
      <div className="aspect-grid">
        {PRESETS.map(p => (
          <button
            key={p.id}
            className={`aspect-card ${selectedRatio === p.id ? 'selected' : ''}`}
            onClick={() => setSelectedRatio(p.id)}
            id={`ratio-${p.id}`}
          >
            <div className="aspect-card-ratio">{p.ratio === 'custom' ? '⚙' : p.ratio}</div>
            <div className="aspect-card-label">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Custom dimensions */}
      {selectedRatio === 'custom' && (
        <div className="custom-dimensions">
          <div className="dimension-input-group">
            <label>Width</label>
            <input type="number" className="dimension-input" value={customW} onChange={e => setCustomW(e.target.value)} placeholder="1920" id="custom-width" />
            <span className="dimension-suffix">px</span>
          </div>
          <div className="dimension-input-group">
            <label>Height</label>
            <input type="number" className="dimension-input" value={customH} onChange={e => setCustomH(e.target.value)} placeholder="1080" id="custom-height" />
            <span className="dimension-suffix">px</span>
          </div>
        </div>
      )}

      {/* Advanced options toggle */}
      <button className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)} id="advanced-toggle">
        <span className={`advanced-toggle-arrow ${showAdvanced ? 'open' : ''}`}>▶</span>
        Advanced Options
      </button>

      {showAdvanced && (
        <div className="advanced-options">
          <div className="select-group">
            <label>Crop Mode</label>
            <select className="select-input" value={crop} onChange={e => setCrop(e.target.value)} id="crop-mode">
              <option value="fill">Fill</option>
              <option value="fit">Fit</option>
              <option value="crop">Crop</option>
              <option value="thumb">Thumbnail</option>
              <option value="scale">Scale</option>
            </select>
          </div>
          <div className="select-group">
            <label>Quality</label>
            <select className="select-input" value={quality} onChange={e => setQuality(e.target.value)} id="quality-level">
              <option value="auto">Auto</option>
              <option value="100">100 — Lossless</option>
              <option value="80">80 — High</option>
              <option value="60">60 — Medium</option>
              <option value="40">40 — Low</option>
            </select>
          </div>
          <div className="select-group">
            <label>Format</label>
            <select className="select-input" value={format} onChange={e => setFormat(e.target.value)} id="output-format">
              <option value="auto">Auto</option>
              <option value="webp">WebP</option>
              <option value="png">PNG</option>
              <option value="jpg">JPEG</option>
              <option value="avif">AVIF</option>
            </select>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="transform-actions">
        <button className="btn-transform" onClick={handleTransform} disabled={isLoading || (selectedRatio === 'custom' && !customW && !customH)} id="btn-transform">
          {isLoading ? 'Converting...' : 'Convert & Upload'}
        </button>
        <button className="btn-transform btn-upload-only" onClick={onUploadOnly} disabled={isLoading} id="btn-upload-only">
          Upload Original
        </button>
      </div>
    </div>
  )
}
