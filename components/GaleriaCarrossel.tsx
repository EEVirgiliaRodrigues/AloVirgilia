'use client'
import { useState } from 'react'

interface Slide {
  src: string
  legenda: string
}

interface GaleriaCarrosselProps {
  slides: Slide[]
}

export default function GaleriaCarrossel({ slides }: GaleriaCarrosselProps) {
  const [atual, setAtual] = useState(0)

  if (!slides || slides.length === 0) return null

  const prev = () => setAtual(i => (i - 1 + slides.length) % slides.length)
  const next = () => setAtual(i => (i + 1) % slides.length)

  return (
    <div style={{ position: 'relative', margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden' }}>
      <img
        src={slides[atual].src}
        alt={slides[atual].legenda}
        style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block', borderRadius: '6px' }}
      />
      {slides[atual].legenda && (
        <p style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', marginTop: '0.4rem', fontStyle: 'italic' }}>
          {slides[atual].legenda}
        </p>
      )}
      {slides.length > 1 && (
        <>
          <button onClick={prev} style={{
            position: 'absolute', left: '8px', top: '45%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff',
            borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
            fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>‹</button>
          <button onClick={next} style={{
            position: 'absolute', right: '8px', top: '45%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff',
            borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
            fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>›</button>
          <div style={{
            position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '12px',
            padding: '2px 10px', fontSize: '0.75rem',
          }}>
            {atual + 1} / {slides.length}
          </div>
        </>
      )}
    </div>
  )
}
