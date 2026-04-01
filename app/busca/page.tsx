import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BuscaClient from '@/components/BuscaClient'
import { getAllPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Busca | Alô Virgília',
  description: 'Pesquise matérias do Alô Virgília',
}

export default function BuscaPage() {
  const posts = getAllPosts()

  return (
    <>
      <Header posts={posts.slice(0, 8)} />
      <main>
        <BuscaClient posts={posts} />
      </main>
      <Footer />
    </>
  )
}
