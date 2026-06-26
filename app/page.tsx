import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllPosts, formatDate, isNovo } from '@/lib/posts'

export const revalidate = 60

export default function Home() {
  const posts = getAllPosts()

  const destaque = posts.find(p => p.destaque) || posts[0]
  const secundariasMarcadas = posts.filter(p => p.slug !== destaque?.slug && p.secundaria)
  const secundarias = secundariasMarcadas.length >= 2
    ? secundariasMarcadas.slice(0, 2)
    : posts.filter(p => p.slug !== destaque?.slug).slice(0, 2)
  const demais = posts.filter(p => p.slug !== destaque?.slug).slice(2, 8)
  const resto = posts.filter(p => p.slug !== destaque?.slug).slice(8)

  return (
    <>
      <Header posts={posts.slice(0, 8)} />
      <main>
        <div className="capa-wrap">
          {destaque ? (
            <section className="capa-main-nova">

              {/* ── Manchete principal ── */}
              <div className="manchete-principal">

                {/* Tema escuro */}
                <div className="manchete manchete-dark" style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
                  {destaque.image && (
                    <div className="manchete-bg-img" style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: `url(${destaque.image})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      opacity: 0.15, zIndex: 0,
                    }} />
                  )}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className={`manchete-cat cat-${destaque.category}`}>{destaque.category.toUpperCase()}</div>
                    <h1 className="manchete-titulo">
                      <a href={`/post/${destaque.slug}`}>{destaque.title}</a>
                    </h1>
                    {destaque.subtitle && <p className="manchete-sub">{destaque.subtitle}</p>}
                    <div className="manchete-meta">
                      <span>{destaque.author}</span>
                      <span className="sep">·</span>
                      <span>{formatDate(destaque.date)}</span>
                    </div>
                    <a href={`/post/${destaque.slug}`} className="manchete-btn">Leia a matéria →</a>
                  </div>
                </div>

                {/* Tema claro */}
                <div className="manchete manchete-light" style={{ height: '100%' }}>
                  {destaque.image && (
                    <a href={`/post/${destaque.slug}`} className="manchete-light-img-wrap">
                      <img src={destaque.image} alt={destaque.title} className="manchete-light-img" />
                    </a>
                  )}
                  <div className="manchete-light-body">
                    <div className={`manchete-cat cat-${destaque.category}`}>{destaque.category.toUpperCase()}</div>
                    <h1 className="manchete-titulo">
                      <a href={`/post/${destaque.slug}`}>{destaque.title}</a>
                    </h1>
                    {destaque.subtitle && <p className="manchete-sub">{destaque.subtitle}</p>}
                    <div className="manchete-meta">
                      <span>{destaque.author}</span>
                      <span className="sep">·</span>
                      <span>{formatDate(destaque.date)}</span>
                    </div>
                    <a href={`/post/${destaque.slug}`} className="manchete-btn">Leia a matéria →</a>
                  </div>
                </div>
              </div>

              {/* ── Manchetes secundárias ── */}
              <aside className="manchetes-secundarias">
                {secundarias.map((post) => (
                  <a key={post.slug} href={`/post/${post.slug}`} className="manchete-sec">
                    {post.image && (
                      <div className="manchete-sec-img">
                        <img src={post.image} alt={post.title} />
                      </div>
                    )}
                    <div className="manchete-sec-body">
                      <span className={`manchete-sec-cat cat-${post.category}`}>{post.category.toUpperCase()}</span>
                      <h2 className="manchete-sec-titulo">{post.title}</h2>
                      {post.subtitle && <p className="manchete-sec-sub">{post.subtitle}</p>}
                      <span className="manchete-sec-meta">{post.author} · {formatDate(post.date)}</span>
                    </div>
                  </a>
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
                      <div className="gcard-img"><img src={post.image} alt={post.title} /></div>
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

          {resto.length > 0 && (
            <section className="grade-section">
              <div className="grade-header">
                <span className="grade-label">Mais matérias</span>
                <div className="grade-line" />
              </div>
              <div className="lista-compacta">
                {resto.map((post) => (
                  <a key={post.slug} href={`/post/${post.slug}`} className="lista-item">
                    {post.image ? (
                      <div className="lista-item-img">
                        <img src={post.image} alt={post.title} />
                      </div>
                    ) : (
                      <div className={`lista-item-img-placeholder cat-${post.category}-bg`} />
                    )}
                    <div className="lista-item-body">
                      <span className={`lista-item-cat cat-${post.category}`}>{post.category.toUpperCase()}</span>
                      <span className="lista-item-titulo">{post.title}</span>
                      <span className="lista-item-meta">{post.author} · {formatDate(post.date)}</span>
                    </div>
                  </a>
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
