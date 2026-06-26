import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Equipe | Alô Virgília',
  description: 'Conheça os alunos e professores por trás do Alô Virgília.',
}

export default function EquipePage() {
  const posts = getAllPosts()

  return (
    <>
      <Header posts={posts.slice(0, 8)} />
      <main>
        <div className="capa-wrap">
          <section className="grade-section">
            <div className="grade-header">
              <span className="grade-label">A equipe</span>
              <div className="grade-line" />
            </div>
            <div className="equipe-content">
              <p className="equipe-intro">
                O <strong>Alô Virgília</strong> é um jornal escolar produzido pelos alunos da disciplina
                eletiva de Jornalismo da <strong>EE Virgília Rodrigues Alves</strong> organizada pelos professores Gabriel Petryla(Língua Portuguesa) e Marcelo Francisco(Filosofia)
              </p>
              <p className="equipe-intro">
                Aqui, estudantes do ensino médio aprendem na prática: pautam, apuram, escrevem,
                editam e publicam matérias sobre o cotidiano da escola e do bairro.
              </p>
              <figure className="equipe-foto">
                <img src="/uploads/equipe.jpeg" alt="Equipe do jornal Alô Virgília" />
                <figcaption>A equipe do Alô Virgília</figcaption>
              </figure>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
