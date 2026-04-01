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
                eletiva de Jornalismo da <strong>EE Virgília Rodrigues Alves</strong>.
              </p>
              <p className="equipe-intro">
                Aqui, estudantes do ensino médio aprendem na prática: pautam, apuram, escrevem,
                editam e publicam matérias sobre o cotidiano da escola e do bairro.
              </p>
              <div className="equipe-placeholder">
                <span>✦</span>
                <p>Os integrantes da equipe atual serão apresentados em breve.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
