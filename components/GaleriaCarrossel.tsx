'use client'
import { useState, useEffect, useRef } from 'react'

interface Slide {
  src: string
  legenda: string
}

interface GaleriaCarrosselProps {
  slides: Slide[]
}

export default function GaleriaCarrossel({ slides }: GaleriaCarrosselProps) {
  const [atual, setAtual] = useState(0)
  const [carregadas, setCarregadas] = useState<Set<number>>(new Set([0]))
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    slides.forEach((slide, i) => {
      const img = new Image()
      img.src = slide.src
      img.onload = () => setCarregadas(prev => new Set([...prev, i]))
    })
  }, [slides])

  if (!slides || slides.length === 0) return null

  const prev = () => setAtual(i => (i - 1 + slides.length) % slides.length)
  const next = () => setAtual(i => (i + 1) % slides.length)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }
    touchStartX.current = null
  }

  return (
    <div
      style={{ position: 'relative', margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden', touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        .galeria-img {
          width: 100%;
          height: auto;
          max-height: 480px;
          object-fit: contain;
          display: block;
          border-radius: 6px;
          background: #111;
          transition: opacity 0.2s ease;
          user-select: none;
          -webkit-user-drag: none;
        }
        @media (max-width: 600px) {
          .galeria-img {
            height: 280px;
            object-fit: cover;
            max-height: none;
          }
        }
      `}</style>

      <div style={{ display: 'none' }}>
        {slides.map((slide, i) => (
          <img key={i} src={slide.src} alt="" />
        ))}
      </div>

      <img
        src={slides[atual].src}
        alt={slides[atual].legenda}
        className="galeria-img"
        style={{ opacity: carregadas.has(atual) ? 1 : 0.5 }}
        draggable={false}
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
