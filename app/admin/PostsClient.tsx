'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post {
  slug: string
  name: string
  sha: string
}

export default function PostsClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/posts')
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>Carregando matérias...</div>
  )

  if (posts.length === 0) return (
    <div style={{
      border: '1px dashed #1e1e1e',
      borderRadius: '8px',
      padding: '3rem',
      textAlign: 'center',
      color: '#888',
    }}>
      Nenhuma matéria ainda. <Link href="/admin/nova" style={{ color: '#c8392b' }}>Criar a primeira →</Link>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {posts.map(post => (
        <Link key={post.slug} href={`/admin/editar/${post.slug}`} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#444')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
        >
          <div>
            <div style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{post.slug}</div>
            <div style={{ color: '#888', fontSize: '0.8rem' }}>{post.name}</div>
          </div>
          <div style={{ color: '#888', fontSize: '0.8rem' }}>Editar →</div>
        </Link>
      ))}
    </div>
  )
}
