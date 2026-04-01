import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PostsClient from './PostsClient'

export default async function AdminPage() {
  const session = await getServerSession()
  if (!session) redirect('/admin/entrar')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      fontFamily: "'Space Grotesk', sans-serif",
      color: '#f0ede6',
    }}>
      <header style={{
        borderBottom: '1px solid #1e1e1e',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', fontWeight: 700 }}>
          Alô Virgília <span style={{ color: '#888', fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.8rem', fontWeight: 400 }}>/ redação</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#888', fontSize: '0.875rem' }}>{session.user?.name}</span>
          <Link href="/api/auth/signout" style={{
            border: '1px solid #1e1e1e',
            borderRadius: '6px',
            padding: '0.4rem 0.85rem',
            color: '#888',
            fontSize: '0.8rem',
          }}>
            Sair
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif' }}>Matérias</h1>
          <Link href="/admin/nova" style={{
            background: '#c8392b',
            color: '#fff',
            borderRadius: '6px',
            padding: '0.6rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}>
            + Nova matéria
          </Link>
        </div>
        <PostsClient />
      </main>
    </div>
  )
}
