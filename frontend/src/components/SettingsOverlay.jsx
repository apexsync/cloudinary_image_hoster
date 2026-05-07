import { useState } from 'react'
import '../styles/SettingsOverlay.css'

export default function SettingsOverlay({ config, onSave, onClose }) {
  const [cloudName, setCloudName] = useState(config?.cloudName || '')
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [apiSecret, setApiSecret] = useState(config?.apiSecret || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      cloudName: cloudName.trim(),
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim()
    })
  }

  const handleClear = () => {
    localStorage.removeItem('apexsync_config')
    setCloudName('')
    setApiKey('')
    setApiSecret('')
    onSave(null)
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="setup-card">
        <button className="setup-card-close" onClick={onClose} id="close-settings">×</button>
        <h2>Configure ApexSync</h2>
        <p className="setup-card-subtitle">
          Enter your Cloudinary credentials. They're stored locally in your browser.
        </p>
        <form onSubmit={handleSubmit} id="setup-form">
          <div className="input-group">
            <label>Cloud Name</label>
            <input type="text" value={cloudName} onChange={e => setCloudName(e.target.value)} placeholder="your_cloud_name" autoComplete="off" required id="cloud_name" />
          </div>
          <div className="input-group">
            <label>API Key</label>
            <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="your_api_key" autoComplete="off" required id="api_key" />
          </div>
          <div className="input-group">
            <label>API Secret</label>
            <input type="password" value={apiSecret} onChange={e => setApiSecret(e.target.value)} placeholder="your_api_secret" autoComplete="off" required id="api_secret" />
          </div>
          <button type="submit" className="btn-save" id="save-settings">Save & Continue</button>
          {config && (
            <button type="button" className="btn-clear" onClick={handleClear}>Clear Credentials</button>
          )}
        </form>
      </div>
    </div>
  )
}
