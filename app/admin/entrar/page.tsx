'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EntrarPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const res = await signIn('credentials', {
      email,
      password: senha,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      router.push('/admin')
    } else {
      setErro('Email ou senha incorretos.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: '12px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0ede6', fontFamily: 'Playfair Display, serif' }}>
            Alô Virgília
          </div>
          <div style={{ color: '#888', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Painel de redação
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #1e1e1e',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                color: '#f0ede6',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #1e1e1e',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                color: '#f0ede6',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>
          {erro && (
            <div style={{ color: '#c8392b', fontSize: '0.875rem', textAlign: 'center' }}>{erro}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#c8392b',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
