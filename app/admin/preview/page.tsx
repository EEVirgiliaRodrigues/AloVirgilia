import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { formatDate } from '@/lib/posts'

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: { slug?: string }
}) {
  const session = await getServerSession()
  if (!session) redirect('/admin/entrar')

  const slug = searchParams.slug
  if (!slug) redirect('/admin')

  const token = process.env.GITHUB_TOKEN
  const owner = 'EEVirgiliaRodrigues'
  const repo = 'AloVirgilia'
  const path = `content/posts/${slug}.mdx`

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: { Authorization: `token ${token}` },
      cache: 'no-store',
    }
  )

  if (!res.ok) redirect('/admin')

  const data = await res.json()
  const raw = Buffer.from(data.content, 'base64').toString('utf-8')

  // Parse frontmatter
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const fmRaw = match?.[1] || ''
  const content = match?.[2]?.trim() || raw

  const get = (key: string) => {
    const m = fmRaw.match(new RegExp(`^${key}:\\s*'?(.*?)'?$`, 'm'))
    return m ? m[1].replace(/''/g, "'") : ''
  }

  const post = {
    title: get('title'),
    subtitle: get('subtitle'),
    author: get('author'),
    date: get('date'),
    category: get('category'),
    image: get('image'),
    image_caption: get('image_caption'),
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f0ede6; font-family: 'Space Grotesk', sans-serif; font-weight: 300; line-height: 1.65; }
        a { color: inherit; text-decoration: none; }
        img { max-width: 100%; display: block; }
      `}</style>

      {/* Barra de preview */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#c8392b', color: '#fff', padding: '0.6rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.875rem',
      }}>
        <span>👁 Pré-visualização — esta matéria ainda não está publicada</span>
        <a href={`/admin/editar/${slug}`} style={{
          background: 'rgba(255,255,255,0.2)', borderRadius: '4px',
          padding: '0.3rem 0.75rem', fontSize: '0.8rem',
        }}>← Voltar ao editor</a>
      </div>

      <main style={{ paddingTop: '3rem' }}>
        <article style={{ maxWidth: '720px', margin: '2.5rem auto 4rem', padding: '0 1.5rem' }}>
          <header style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '14px' }}>
              <span style={{
                fontFamily: 'Space Mono, monospace', fontSize: '9px',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#c8392b', borderLeft: '2px solid #c8392b', paddingLeft: '8px',
              }}>
                {post.category}
              </span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: '#444' }}>
                {post.date ? formatDate(post.date) : ''}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 900, lineHeight: 1.15, marginBottom: '0.75rem',
            }}>
              {post.title}
            </h1>

            {post.subtitle && (
              <p style={{ fontSize: '1.15rem', color: '#888', marginBottom: '1rem', lineHeight: 1.5 }}>
                {post.subtitle}
              </p>
            )}

            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', color: '#888', marginBottom: '1.5rem' }}>
              Por <strong style={{ color: '#f0ede6' }}>{post.author}</strong>
            </div>

            {post.image && (
              <figure style={{ margin: '0 0 2rem' }}>
                <img src={post.image} alt={post.title} style={{ width: '100%', borderRadius: '4px' }} />
                {post.image_caption && (
                  <figcaption style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    {post.image_caption}
                  </figcaption>
                )}
              </figure>
            )}
          </header>

          <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#d0cdc6' }} className="post-body">
            <style>{`
              .post-body p { margin-bottom: 1.5rem; }
              .post-body h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #f0ede6; margin: 2rem 0 0.75rem; border-top: 1px solid #1e1e1e; padding-top: 1.25rem; }
              .post-body h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #f0ede6; margin: 1.5rem 0 0.5rem; }
              .post-body blockquote { border-left: 3px solid #c8392b; margin: 2rem 0; padding: 0.5rem 0 0.5rem 1.5rem; font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.3rem; color: #f0ede6; }
              .post-body strong { font-weight: 500; color: #f0ede6; }
              .post-body > img { margin: 1.5rem 0; width: 100%; }
              .post-body div[style*="float"] { max-width: 45%; }
              .post-body div[style*="float"] img { margin: 0; width: 100%; }
              .post-body::after { content: ""; display: table; clear: both; }
            `}</style>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </>
  )
}
