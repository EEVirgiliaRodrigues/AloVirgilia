import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ShareButton from '@/components/ShareButton'
import { getAllPosts, getPostBySlug, formatDate, readingTime } from '@/lib/posts'
import ReadingProgress from '@/components/ReadingProgress'
import GaleriaCarrossel from '@/components/GaleriaCarrossel'

const BASE_URL = 'https://alo-virgilia.vercel.app'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  // Garante URL absoluta para og:image com otimização do Vercel (comprime sem perder qualidade)
  function getOgImageUrl(image: string): string {
    if (!image) return ''
    // Se já é URL absoluta (ex: raw.github), usa direto
    if (image.startsWith('http')) return image
    // Se é caminho local (/uploads/...), usa o otimizador do Vercel
    const encoded = encodeURIComponent(image)
    return `${BASE_URL}/_next/image?url=${encoded}&w=1200&q=80`
  }
  const imageUrl = post.image ? getOgImageUrl(post.image) : undefined

  return {
    title: `${post.title} | Alô Virgília`,
    description: post.subtitle || post.title,
    openGraph: {
      title: post.title,
      description: post.subtitle || post.title,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
  }
}

function parseConteudo(content: string) {
  const partes: { tipo: 'mdx' | 'galeria'; conteudo: string; slides?: { src: string; legenda: string }[] }[] = []
  const galeriaRegex = /<div class="galeria-wrap"[^>]*>([\s\S]*?)<\/div>\n<script>[\s\S]*?<\/script>/g
  let lastIndex = 0
  let match

  while ((match = galeriaRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const antes = content.slice(lastIndex, match.index).replace(/<script>[\s\S]*?<\/script>/g, '')
      if (antes.trim()) partes.push({ tipo: 'mdx', conteudo: antes })
    }
    const slides: { src: string; legenda: string }[] = []
    const slideRegex = /<img src="([^"]*)"[^>]*\/>(?:[\s\S]*?<p[^>]*>([^<]*)<\/p>)?/g
    let sm
    while ((sm = slideRegex.exec(match[1])) !== null) {
      slides.push({ src: sm[1], legenda: sm[2] || '' })
    }
    partes.push({ tipo: 'galeria', conteudo: '', slides })
    lastIndex = match.index + match[0].length
  }

  const resto = content.slice(lastIndex).replace(/<script>[\s\S]*?<\/script>/g, '')
  if (resto.trim()) partes.push({ tipo: 'mdx', conteudo: resto })
  return partes.length > 0 ? partes : [{ tipo: 'mdx' as const, conteudo: content }]
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  const allPosts = getAllPosts()
  if (!post) notFound()
  const minutos = readingTime(post.content)
  const relacionados = allPosts.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3)
  const partes = parseConteudo(post.content)

  return (
    <>
      <ReadingProgress />
      <Header posts={allPosts.slice(0, 8)} />
      <main>
        <article className="post-full">
          <header className="post-header">
            <div className="post-meta-top">
              <span className={`post-category cat-${post.category}`}>{post.category.toUpperCase()}</span>
              <span className="post-date">{formatDate(post.date)}</span>
              <span className="post-leitura">{minutos} min de leitura</span>
            </div>
            <h1 className="post-title">{post.title}</h1>
            {post.subtitle && <p className="post-subtitle">{post.subtitle}</p>}
            <div className="post-byline">Por <strong>{post.author}</strong></div>
            {post.image && (
              <figure className="post-cover">
                <img src={post.image} alt={post.title} />
                {post.image_caption && <figcaption>{post.image_caption}</figcaption>}
              </figure>
            )}
          </header>

          <div className="post-body">
            {partes.map((parte, i) =>
              parte.tipo === 'galeria' ? (
                <GaleriaCarrossel key={i} slides={parte.slides!} />
              ) : (
                <ReactMarkdown key={i} rehypePlugins={[rehypeRaw]}>
                  {parte.conteudo}
                </ReactMarkdown>
              )
            )}
          </div>

          <footer className="post-footer">
            <Link href="/" className="back-link">← Voltar para a capa</Link>
            <ShareButton title={post.title} />
          </footer>
        </article>

        {relacionados.length > 0 && (
          <section className="relacionados-wrap">
            <div className="relacionados-inner">
              <div className="grade-header">
                <span className="grade-label">Leia também</span>
                <div className="grade-line" />
              </div>
              <div className="grade">
                {relacionados.map((p, i) => (
                  <article key={p.slug} className="gcard" style={{ '--anim-delay': `${i * 0.1}s` } as React.CSSProperties}>
                    {p.image ? (
                      <div className="gcard-img"><img src={p.image} alt={p.title} /></div>
                    ) : (
                      <div className={`gcard-img-placeholder cat-${p.category}-bg`} />
                    )}
                    <div className="gcard-num">{String(i + 1).padStart(2, '0')}</div>
                    <span className={`gcard-cat cat-${p.category}`}>{p.category.toUpperCase()}</span>
                    <h2 className="gcard-titulo"><Link href={`/post/${p.slug}`}>{p.title}</Link></h2>
                    <div className="gcard-meta">{p.author} · {formatDate(p.date)}</div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
