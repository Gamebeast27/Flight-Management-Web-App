'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true'

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      
      // Don't show if already in standalone mode
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as { standalone?: boolean }).standalone === true

      if (isStandalone) return

      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Only show banner if not previously dismissed
      if (!isDismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    setShowPrompt(false)

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-install-dismissed', 'true')
      }
    } catch (err) {
      console.error('Failed to trigger PWA install prompt:', err)
    } finally {
      setDeferredPrompt(null)
    }
  }

  function handleDismiss() {
    localStorage.setItem('pwa-install-dismissed', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-slide-up">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-2xl flex flex-col gap-4 text-left select-none relative overflow-hidden">
        {/* Decorative background flight trail */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-sky-500/5 blur-2xl -z-10" />

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20 flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Add FlightMgmt to Home Screen</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Install our application as a lightweight mobile app for quick seat bookings and live flight updates offline.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700/60 text-slate-400 hover:text-slate-200 text-xs font-semibold px-3.5 py-2 transition-all cursor-pointer"
          >
            Maybe Later
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 transition-all shadow-md shadow-sky-600/10 cursor-pointer active:scale-95"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  )
}
