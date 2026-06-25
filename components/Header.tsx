'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

interface Post {
  title: string
  slug: string
}

const navLinks = [
  { href: '/', label: 'Capa' },
  { href: '/categoria/escola', label: 'Escola' },
  { href: '/categoria/esportes', label: 'Esportes' },
  { href: '/categoria/cultura', label: 'Cultura' },
  { href: '/categoria/opiniao', label: 'Opinião' },
  { href: '/equipe', label: 'Equipe' },
  { href: '/busca', label: 'Busca' },
]

export default function Header({ posts = [] }: { posts?: Post[] }) {
  const [dataAtual, setDataAtual] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const tickerRef = useRef<HTMLDivElement>(null)
  const posRef = useRef(0)
  const rafRef = useRef<number>(0)
  const tocadoRef = useRef(false)

  useEffect(() => {
    const d = new Date()
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    setDataAtual(d.toLocaleDateString('pt-BR', opts))
  }, [])

  useEffect(() => {
    setMenuAberto(false)
  }, [pathname])

  useEffect(() => {
    const el = tickerRef.current
    if (!el || posts.length === 0) return
    const half = el.scrollWidth / 2
    const speed = 0.6
    function step() {
      posRef.current += speed
      if (posRef.current >= half) posRef.current = 0
      if (el) el.style.transform = `translateX(-${posRef.current}px)`
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [posts])

  function handleTituloClick(e: React.MouseEvent) {
    e.preventDefault()
    if (!tocadoRef.current) {
      tocadoRef.current = true
      const audio = new Audio('/uploads/alo-virgilia.mp3')
      audio.play().catch(() => {})
      audio.addEventListener('ended', () => router.push('/'))
    } else {
      router.push('/')
    }
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const repeated = [...posts, ...posts, ...posts, ...posts, ...posts, ...posts]

  return (
    <header className="site-header">
      <div className="header-inner">
        {posts.length > 0 && (
          <div className="ticker-wrap" aria-hidden="true">
            <div className="ticker-track" ref={tickerRef}>
              {repeated.map((post, i) => (
                <span key={i}>{post.title}</span>
              ))}
            </div>
          </div>
        )}
        <div className="header-top">
          <span>{dataAtual}</span>
          <div className="header-live">
            <span className="live-dot" />
            <span>Ao vivo da redação</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="header-brand-row">
          <a href="/" className="site-title" onClick={handleTituloClick}>
            <em>Alô</em> Virgília
          </a>
          <div className="header-brand-right">
            <div className="header-edition">
              Jornalismo feito<br />por quem vive a escola
            </div>
            <button
              className={`hamburger-btn${menuAberto ? ' aberto' : ''}`}
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setMenuAberto(v => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
        <nav className="site-nav">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={`nav-link${isActive(href) ? ' nav-ativo' : ''}`}
            >
              {label}
            </a>
          ))}
        </nav>

        {menuAberto && (
          <div className="mobile-menu">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`mobile-menu-link${isActive(href) ? ' nav-ativo' : ''}`}
                onClick={() => setMenuAberto(false)}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
