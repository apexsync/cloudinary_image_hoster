import { useState, useEffect, useCallback } from 'react'
import UploadZone from './components/UploadZone'
import AspectRatioPanel from './components/AspectRatioPanel'
import ResultView from './components/ResultView'
import SettingsOverlay from './components/SettingsOverlay'
import './App.css'

const VIEWS = {
  UPLOAD: 'upload',
  TRANSFORM: 'transform',
  RESULT: 'result',
}

const TABS = {
  UPLOAD: 'Quick Upload',
  TRANSFORM: 'Convert & Resize',
}

export default function App() {
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('apexsync_config')) } catch { return null }
  })
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('TRANSFORM')
  const [view, setView] = useState(VIEWS.UPLOAD)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)

  // Show settings on first load if no config
  useEffect(() => {
    if (!config) setShowSettings(true)
  }, [])

  const handleSaveConfig = (newConfig) => {
    if (newConfig) {
      localStorage.setItem('apexsync_config', JSON.stringify(newConfig))
    }
    setConfig(newConfig)
    setShowSettings(false)
  }

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file)
    setStatus('')
    setResult(null)

    if (activeTab === 'UPLOAD') {
      // Quick upload mode - upload immediately
      handleQuickUpload(file)
    } else {
      // Transform mode - show the panel
      setView(VIEWS.TRANSFORM)
    }
  }, [activeTab, config])

  const handleQuickUpload = async (file) => {
    if (!config) {
      setShowSettings(true)
      return
    }

    setIsLoading(true)
    setStatus('Uploading to Cloudinary...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('cloud_name', config.cloudName)
    formData.append('api_key', config.apiKey)
    formData.append('api_secret', config.apiSecret)

    try {
      const res = await fetch('/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok && data.secure_url) {
        setResult({
          secure_url: data.secure_url,
          original_url: data.secure_url,
          width: data.width,
          height: data.height,
          format: data.format,
          bytes: data.bytes,
          public_id: data.public_id,
        })
        setView(VIEWS.RESULT)
        setStatus('')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err) {
      setStatus('Error: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransform = async (params) => {
    if (!config) {
      setShowSettings(true)
      return
    }
    if (!selectedFile) return

    setIsLoading(true)
    setStatus('Converting & uploading...')

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('cloud_name', config.cloudName)
    formData.append('api_key', config.apiKey)
    formData.append('api_secret', config.apiSecret)

    if (params.aspect_ratio) formData.append('aspect_ratio', params.aspect_ratio)
    if (params.width) formData.append('width', params.width)
    if (params.height) formData.append('height', params.height)
    if (params.crop) formData.append('crop', params.crop)
    if (params.quality) formData.append('quality', params.quality)
    if (params.format) formData.append('format', params.format)

    try {
      const res = await fetch('/transform', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok && (data.transformed_url || data.original_url)) {
        setResult(data)
        setView(VIEWS.RESULT)
        setStatus('')
      } else {
        throw new Error(data.error || 'Transformation failed')
      }
    } catch (err) {
      setStatus('Error: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadOnly = () => {
    if (selectedFile) handleQuickUpload(selectedFile)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    setStatus('')
    setView(VIEWS.UPLOAD)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setView(VIEWS.UPLOAD)
    setStatus('')
  }

  // Determine hero title & subtitle
  const heroTitle = activeTab === 'UPLOAD'
    ? 'Cloud Image Hoster.'
    : 'Convert & Resize.'

  const heroSubtitle = activeTab === 'UPLOAD'
    ? 'Upload images to Cloudinary and get permanent URLs instantly. Fast, secure, and monochrome.'
    : 'Transform images to any aspect ratio, resize, and convert formats — powered by Cloudinary.'

  return (
    <div className="app">
      <div className="grid-bg" />

      {/* Settings Overlay */}
      {showSettings && (
        <SettingsOverlay
          config={config}
          onSave={handleSaveConfig}
          onClose={() => config && setShowSettings(false)}
        />
      )}

      <div className="app-content">
        {/* Navigation */}
        <nav className="nav">
          <div className="nav-brand">
            <div className="nav-logo">
              <div className="nav-logo-inner" />
            </div>
            <span className="nav-title">ApexSync</span>
          </div>
          <div className="nav-actions">
            {Object.entries(TABS).map(([key, label]) => (
              <button
                key={key}
                className={`nav-tab ${activeTab === key ? 'active' : ''}`}
                onClick={() => { setActiveTab(key); handleReset(); }}
                id={`tab-${key.toLowerCase()}`}
              >
                {label}
              </button>
            ))}
            <button
              className="nav-settings"
              onClick={() => setShowSettings(true)}
              id="open-settings"
            >
              Settings
            </button>
          </div>
        </nav>

        {/* Hero */}
        {view !== VIEWS.RESULT && (
          <header className="hero">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              {activeTab === 'UPLOAD' ? 'Image Hoster' : 'Aspect Ratio Converter'}
            </div>
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
          </header>
        )}

        {/* Main Content */}
        {view === VIEWS.UPLOAD && (
          <UploadZone
            onFileSelect={handleFileSelect}
            status={status}
            isLoading={isLoading}
          />
        )}

        {view === VIEWS.TRANSFORM && activeTab === 'TRANSFORM' && (
          <AspectRatioPanel
            file={selectedFile}
            onRemoveFile={handleRemoveFile}
            onTransform={handleTransform}
            onUploadOnly={handleUploadOnly}
            isLoading={isLoading}
          />
        )}

        {view === VIEWS.RESULT && result && (
          <ResultView
            result={result}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          ApexSync · Cloud Importer · Powered by <a href="https://cloudinary.com" target="_blank" rel="noopener">Cloudinary</a>
        </p>
      </footer>
    </div>
  )
}
