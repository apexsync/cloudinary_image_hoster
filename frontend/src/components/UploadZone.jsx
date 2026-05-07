import { useState, useRef, useCallback } from 'react'
import '../styles/UploadZone.css'

export default function UploadZone({ onFileSelect, status, isLoading }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  const handleClick = () => {
    if (!isLoading) fileInputRef.current?.click()
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFileSelect(file)
  }

  return (
    <div className="upload-zone-wrapper">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        id="drop-zone"
      >
        <div className="upload-zone-icon">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div className="upload-zone-title">
          {isDragging ? 'Release to upload' : 'Drop an image or click to browse'}
        </div>
        <div className="upload-zone-subtitle">
          Supports all major image formats
        </div>
        <div className="upload-zone-formats">
          {['PNG', 'JPG', 'WEBP', 'SVG', 'GIF'].map(f => (
            <span key={f} className="upload-zone-format-tag">{f}</span>
          ))}
        </div>
        {isLoading && (
          <div className="upload-status">
            <div className="upload-spinner" />
            <span>{status || 'Processing...'}</span>
          </div>
        )}
        {status && !isLoading && (
          <div className={`upload-status ${status.startsWith('Error') ? 'error' : ''}`}>
            {status}
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        hidden
        id="file-input"
      />
    </div>
  )
}
