'use client'
import { useState } from 'react'

export default function ShareButton({ title }: { title: string }) {
  const [copiado, setCopiado] = useState(false)

  function shareWhatsApp() {
    const url = window.location.href
    const text = encodeURIComponent(`${title} — leia no Alô Virgília: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  function shareX() {
    const url = window.location.href
    const text = encodeURIComponent(`${title} — ${url}`)
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // fallback para browsers sem clipboard API
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  return (
    <div className="share-buttons">
      <span className="share-label">Compartilhar:</span>
      <button onClick={shareWhatsApp} className="share-btn share-whatsapp">
        WhatsApp
      </button>
      <button onClick={shareX} className="share-btn share-x">
        X / Twitter
      </button>
      <button onClick={copyLink} className={`share-btn share-copy${copiado ? ' copiado' : ''}`}>
        {copiado ? '✓ Copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}
