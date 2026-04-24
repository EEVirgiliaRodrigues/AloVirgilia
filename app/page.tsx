import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllPosts, formatDate, isNovo } from '@/lib/posts'

const editorias = [
  { slug: 'escola', label: 'Escola', desc: 'Biblioteca, grêmio, cotidiano: a escola por dentro' },
  { slug: 'esportes', label: 'Esportes', desc: 'Jogos, torneios e os atletas que você vê todo dia no corredor' },
  { slug: 'cultura', label: 'Cultura', desc: 'Arte, música, cinema, literatura e o que está acontecendo' },
  { slug: 'opiniao', label: 'Opinião', desc: 'O que os alunos têm a dizer' },
]

export const revalidate = 60

export default function Home() {
  const posts = getAllPosts()
  
  const destaque = posts.find(p => p.destaque) || posts[0]
  const demais = posts.filter(p => p.slug !== destaque?.slug).slice(0, 6)

  return (
    <>
      <Header posts={posts.slice(0, 8)} />
      <main>
        <div className="capa-wrap">
          {destaque ? (
            <section className="capa-main">

              {/* ── Manchete tema ESCURO (imagem de fundo com opacidade) ── */}
              <div className="manchete manchete-dark" style={{ position: 'relative', overflow: 'hidden' }}>
                {destaque.image && (
                  <div className="manchete-bg-img" style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${destaque.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    zIndex: 0,
                  }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className={`manchete-cat cat-${destaque.category}`}>
                    {destaque.category.toUpperCase()}
                  </div>
                  <h1 className="manchete-titulo">
                    <Link href={`/post/${destaque.slug}`}>{destaque.title}</Link>
                  </h1>
                  {destaque.subtitle && (
                    <p className="manchete-sub">{destaque.subtitle}</p>
                  )}
                  <div className="manchete-meta">
                    <span>{destaque.author}</span>
                    <span className="sep">·</span>
                    <span>{formatDate(destaque.date)}</span>
                  </div>
                  <Link href={`/post/${destaque.slug}`} className="manchete-btn">
                    Leia a matéria →
                  </Link>
                </div>
              </div>

              {/* ── Manchete tema CLARO (imagem nítida em cima, texto embaixo) ── */}
              <div className="manchete manchete-light">
                {destaque.image && (
                  <Link href={`/post/${destaque.slug}`} className="manchete-light-img-wrap">
                    <img src={destaque.image} alt={destaque.title} className="manchete-light-img" />
                  </Link>
                )}
                <div className="manchete-light-body">
                  <div className={`manchete-cat cat-${destaque.category}`}>
                    {destaque.category.toUpperCase()}
                  </div>
                  <h1 className="manchete-titulo">
                    <Link href={`/post/${destaque.slug}`}>{destaque.title}</Link>
                  </h1>
                  {destaque.subtitle && (
                    <p className="manchete-sub">{destaque.subtitle}</p>
                  )}
                  <div className="manchete-meta">
                    <span>{destaque.author}</span>
                    <span className="sep">·</span>
                    <span>{formatDate(destaque.date)}</span>
                  </div>
                  <Link href={`/post/${destaque.slug}`} className="manchete-btn">
                    Leia a matéria →
                  </Link>
                </div>
              </div>

              <aside className="editorias-sidebar">
                <div className="sidebar-label">Editorias</div>
                {editorias.map((ed, i) => (
                  <Link key={ed.slug} href={`/categoria/${ed.slug}`} className="ed-card" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="ed-top">
                      <span className={`ed-nome cat-${ed.slug}`}>{ed.label}</span>
                    </div>
                    <div className="ed-desc">{ed.desc}</div>
                    <div className="ed-bar">
                      <div className={`ed-bar-fill cat-${ed.slug}-bg`} style={{ width: '100%', animationDelay: `${0.3 + i * 0.1}s` }} />
                    </div>
                  </Link>
                ))}
              </aside>
            </section>
          ) : (
            <div className="sem-posts">Nenhuma matéria publicada ainda. Em breve!</div>
          )}

          {demais.length > 0 && (
            <section className="grade-section">
              <div className="grade-header">
                <span className="grade-label">Últimas matérias</span>
                <div className="grade-line" />
              </div>
              <div className="grade">
                {demais.map((post, i) => (
                  <article key={post.slug} className="gcard" style={{ '--anim-delay': `${i * 0.1}s`, position: 'relative' } as React.CSSProperties}>
                    <a href={`/post/${post.slug}`} aria-label={post.title} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
                    {post.image ? (
                      <div className="gcard-img">
                        <img src={post.image} alt={post.title} />
                      </div>
                    ) : (
                      <div className={`gcard-img-placeholder cat-${post.category}-bg`} />
                    )}
                    <div className="gcard-num">{String(i + 1).padStart(2, '0')}</div>
                    <span className={`gcard-cat cat-${post.category}`}>
                      {isNovo(post.date) && <span className="badge-novo">novo</span>}
                      {post.category.toUpperCase()}
                    </span>
                    <h2 className="gcard-titulo">
                      <a href={`/post/${post.slug}`} style={{ position: 'relative', zIndex: 2 }}>{post.title}</a>
                    </h2>
                    <div className="gcard-meta">{post.author} · {formatDate(post.date)}</div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
