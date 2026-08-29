import React, { useState, useEffect } from 'react'
import { Download, Smartphone, Laptop, Check, X, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react'

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installPlatform, setInstallPlatform] = useState('auto') // 'android' | 'ios' | 'desktop'

  useEffect(() => {
    const handleBeforeInstall = e => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true)
    }

    // Detect user platform
    const ua = navigator.userAgent || ''
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setInstallPlatform('ios')
    } else if (/Android/i.test(ua)) {
      setInstallPlatform('android')
    } else {
      setInstallPlatform('desktop')
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="install-app-modal">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="install-modal-header">
          <div className="app-icon-badge">
            <img src="/app-icon.svg" alt="PlanTrip App" className="app-badge-img" />
          </div>
          <div>
            <h3>Install PlanTrip App</h3>
            <p>Run as a native standalone application on your mobile phone or desktop</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="install-success-banner">
            <Check size={20} className="text-emerald" />
            <div>
              <strong>PlanTrip App is Installed!</strong>
              <p>You are running the standalone native app experience.</p>
            </div>
          </div>
        ) : (
          <div className="install-content-body">
            {/* Direct PWA Install Button if available */}
            {deferredPrompt && (
              <button className="btn-direct-install-primary" onClick={handleInstallClick}>
                <Download size={18} />
                <span>1-Click Install PlanTrip App</span>
              </button>
            )}

            <div className="platform-tabs-row">
              <button
                className={`platform-tab ${installPlatform === 'android' ? 'active' : ''}`}
                onClick={() => setInstallPlatform('android')}
              >
                <Smartphone size={14} />
                <span>Android</span>
              </button>
              <button
                className={`platform-tab ${installPlatform === 'ios' ? 'active' : ''}`}
                onClick={() => setInstallPlatform('ios')}
              >
                <Smartphone size={14} />
                <span>iPhone / iOS</span>
              </button>
              <button
                className={`platform-tab ${installPlatform === 'desktop' ? 'active' : ''}`}
                onClick={() => setInstallPlatform('desktop')}
              >
                <Laptop size={14} />
                <span>Desktop (PC/Mac)</span>
              </button>
            </div>

            {/* Platform instructions */}
            <div className="platform-instructions-box">
              {installPlatform === 'android' && (
                <div className="instruct-step-list">
                  <div className="step-item">
                    <span className="step-num">1</span>
                    <p>Open this page in <strong>Chrome</strong> or <strong>Samsung Internet</strong>.</p>
                  </div>
                  <div className="step-item">
                    <span className="step-num">2</span>
                    <p>Tap the <strong>three dots (⋮)</strong> menu in the top right.</p>
                  </div>
                  <div className="step-item">
                    <span className="step-num">3</span>
                    <p>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                  </div>
                </div>
              )}

              {installPlatform === 'ios' && (
                <div className="instruct-step-list">
                  <div className="step-item">
                    <span className="step-num">1</span>
                    <p>Open this page in <strong>Safari</strong> on your iPhone.</p>
                  </div>
                  <div className="step-item">
                    <span className="step-num">2</span>
                    <p>Tap the <strong>Share button (square with arrow up)</strong> at the bottom.</p>
                  </div>
                  <div className="step-item">
                    <span className="step-num">3</span>
                    <p>Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                  </div>
                </div>
              )}

              {installPlatform === 'desktop' && (
                <div className="instruct-step-list">
                  <div className="step-item">
                    <span className="step-num">1</span>
                    <p>In <strong>Chrome</strong> or <strong>Edge</strong>, click the <strong>Install App icon (⊕)</strong> in the URL address bar.</p>
                  </div>
                  <div className="step-item">
                    <span className="step-num">2</span>
                    <p>Click <strong>"Install"</strong> to add PlanTrip App directly to your Windows/Mac desktop and start menu.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="native-features-highlights">
              <div className="feat-badge">
                <ShieldCheck size={14} className="text-cyan" />
                <span>Offline Support</span>
              </div>
              <div className="feat-badge">
                <Sparkles size={14} className="text-amber" />
                <span>Instant Push Sync</span>
              </div>
              <div className="feat-badge">
                <Smartphone size={14} className="text-emerald" />
                <span>No App Store Download Required</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
