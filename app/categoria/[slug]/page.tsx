import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllPosts, formatDate, isNovo } from '@/lib/posts'

const labels: Record<string, string> = {
  escola: 'Escola',
  esportes: 'Esportes',
  cultura: 'Cultura',
  opiniao: 'Opinião',
}

const descs: Record<string, string> = {
  escola: 'Biblioteca, grêmio, cotidiano: a escola por dentro.',
  esportes: 'Jogos, torneios e os atletas que você vê todo dia no corredor.',
  cultura: 'Arte, música, cinema, literatura e o que está acontecendo.',
  opiniao: 'O que os alunos têm a dizer.',
}

export const revalidate = 60

export async function generateStaticParams() {
  return Object.keys(labels).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const label = labels[params.slug] || params.slug
  return {
    title: `${label} | Alô Virgília`,
    description: descs[params.slug] || `Matérias da editoria ${label}.`,
  }
}

export default function CategoriaPage({ params }: { params: { slug: string } }) {
  const allPosts = getAllPosts()
  const posts = allPosts.filter(p => p.category === params.slug)
  const label = labels[params.slug] || params.slug

  return (
    <>
      <Header posts={allPosts.slice(0, 8)} />
      <main>
        <div className="capa-wrap">
          <section className="arquivo-section">

            {/* Cabeçalho da editoria */}
            <div className="arquivo-header">
              <div className="arquivo-header-left">
                <span className={`arquivo-editoria cat-${params.slug}`}>{label}</span>
                <p className="arquivo-desc">{descs[params.slug]}</p>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="sem-posts">Nenhuma matéria nessa editoria ainda.</div>
            ) : (
              <div className="arquivo-lista">
                {posts.map((post, i) => (
                  <article key={post.slug} className="arquivo-item" style={{ position: 'relative', cursor: 'pointer' }}>
                    <a href={`/post/${post.slug}`} aria-label={post.title} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
                    <div className="arquivo-item-num">{String(i + 1).padStart(2, '0')}</div>

                    <div className="arquivo-item-inner">
                      <div className="arquivo-item-body">
                        <div className="arquivo-item-meta">
                          {isNovo(post.date) && <span className="badge-novo">novo</span>}
                          <span className="arquivo-item-date">{formatDate(post.date)}</span>
                          <span className="sep">·</span>
                          <span className="arquivo-item-author">{post.author}</span>
                        </div>
                        <h2 className="arquivo-item-titulo">
                          <a href={`/post/${post.slug}`} style={{ position: 'relative', zIndex: 2 }}>{post.title}</a>
                        </h2>
                        {post.subtitle && (
                          <p className="arquivo-item-sub">{post.subtitle}</p>
                        )}
                      </div>

                      {post.image && (
                        <div className="arquivo-item-img">
                          <img src={post.image} alt={post.title} />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
