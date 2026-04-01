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

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} | Alô Virgília`,
    description: post.subtitle || post.title,
    openGraph: {
      title: post.title,
      description: post.subtitle || post.title,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [{ url: post.image }] : [],
    },
  }
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  const allPosts = getAllPosts()

  if (!post) notFound()

  const minutos = readingTime(post.content)
  const relacionados = allPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3)

  return (
    <>
      <ReadingProgress />
      <Header posts={allPosts.slice(0, 8)} />
      <main>
        <article className="post-full">
          <header className="post-header">
            <div className="post-meta-top">
              <span className={`post-category cat-${post.category}`}>
                {post.category.toUpperCase()}
              </span>
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
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {post.content}
            </ReactMarkdown>
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
                      <div className="gcard-img">
                        <img src={p.image} alt={p.title} />
                      </div>
                    ) : (
                      <div className={`gcard-img-placeholder cat-${p.category}-bg`} />
                    )}
                    <div className="gcard-num">{String(i + 1).padStart(2, '0')}</div>
                    <span className={`gcard-cat cat-${p.category}`}>
                      {p.category.toUpperCase()}
                    </span>
                    <h2 className="gcard-titulo">
                      <Link href={`/post/${p.slug}`}>{p.title}</Link>
                    </h2>
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
