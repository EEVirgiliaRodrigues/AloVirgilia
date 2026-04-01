'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Post {
  slug: string
  title: string
  subtitle?: string
  author: string
  date: string
  category: string
}

const labels: Record<string, string> = {
  escola: 'Escola',
  esportes: 'Esportes',
  cultura: 'Cultura',
  opiniao: 'Opinião',
}

function highlight(text: string, termo: string) {
  if (!termo || termo.length < 2) return text
  const escaped = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === termo.toLowerCase()
          ? <mark key={i} className="busca-highlight">{part}</mark>
          : part
      )}
    </>
  )
}

export default function BuscaClient({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.trim().length < 2) {
      setDebouncedQuery(query)
      setLoading(false)
      return
    }
    setLoading(true)
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query)
      setLoading(false)
    }, 280)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  const termo = debouncedQuery.trim().toLowerCase()
  const resultados = termo.length < 2 ? [] : posts.filter(p =>
    p.title.toLowerCase().includes(termo) ||
    (p.subtitle || '').toLowerCase().includes(termo) ||
    p.author.toLowerCase().includes(termo) ||
    (labels[p.category] || p.category).toLowerCase().includes(termo)
  )

  return (
    <div className="busca-wrap">
      <div className="busca-topo">
        <h1 className="busca-titulo">Buscar matérias</h1>
      </div>
      <form className="busca-form" onSubmit={e => e.preventDefault()}>
        <input
          className="busca-input"
          type="search"
          placeholder="Digite um título, autor ou editoria…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </form>

      {query.trim().length >= 2 && !loading && (
        <div className="busca-header">
          {resultados.length === 0
            ? 'Nenhum resultado'
            : `${resultados.length} resultado${resultados.length !== 1 ? 's' : ''}`}
        </div>
      )}

      {loading && (
        <div className="busca-skeleton">
          {[0, 1, 2].map(i => (
            <div key={i} className="busca-skeleton-item">
              <div className="busca-skeleton-num skeleton" />
              <div className="busca-skeleton-body">
                <div className="busca-skeleton-meta skeleton" />
                <div className="busca-skeleton-title skeleton" />
                <div className="busca-skeleton-sub skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && resultados.length > 0 && (
        <div className="arquivo-lista">
          {resultados.map((post, i) => (
            <article key={post.slug} className="arquivo-item anim-visible">
              <div className="arquivo-item-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="arquivo-item-inner">
                <div className="arquivo-item-body">
                  <div className="arquivo-item-meta">
                    <span className={`cat-${post.category}`}>{labels[post.category] || post.category}</span>
                    <span className="sep">·</span>
                    <span className="arquivo-item-author">{post.author}</span>
                  </div>
                  <h2 className="arquivo-item-titulo">
                    <Link href={`/post/${post.slug}`}>{highlight(post.title, termo)}</Link>
                  </h2>
                  {post.subtitle && (
                    <p className="arquivo-item-sub">{highlight(post.subtitle, termo)}</p>
                  )}
                  <Link href={`/post/${post.slug}`} className="arquivo-item-link">
                    Ler matéria →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && query.trim().length >= 2 && resultados.length === 0 && (
        <p className="busca-vazio">
          Nenhuma matéria encontrada para "<em>{query}</em>".
        </p>
      )}

      {query.trim().length < 2 && (
        <p className="busca-vazio">Digite pelo menos 2 caracteres para buscar.</p>
      )}
    </div>
  )
}
