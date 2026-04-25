import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'content/posts')

export interface Post {
  slug: string
  title: string
  subtitle?: string
  author: string
  date: string
  category: string
  image?: string
  image_caption?: string
  destaque?: boolean
  secundaria?: boolean
  publicado?: boolean
  content: string
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDir)) return []

  // Keystatic cria uma pasta por post: content/posts/meu-post/index.mdx
  // Suportamos também o formato antigo: content/posts/meu-post.mdx
  const slugs: string[] = []

  const entries = fs.readdirSync(postsDir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Formato Keystatic: pasta com index.mdx dentro
      const indexPath = path.join(postsDir, entry.name, 'index.mdx')
      if (fs.existsSync(indexPath)) {
        slugs.push(entry.name)
      }
    } else if (entry.isFile() && (entry.name.endsWith('.mdx') || entry.name.endsWith('.md'))) {
      // Formato legado: arquivo solto
      slugs.push(entry.name.replace(/\.(mdx|md)$/, ''))
    }
  }

  const posts = slugs.map(slug => readPost(slug)).filter(Boolean) as Post[]

  return posts
    .filter(p => p.publicado === true)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function readPost(slug: string): Post | null {
  try {
    // Tenta formato Keystatic primeiro (pasta/index.mdx)
    const folderPath = path.join(postsDir, slug, 'index.mdx')
    const legacyPath = path.join(postsDir, `${slug}.mdx`)
    const legacyPathMd = path.join(postsDir, `${slug}.md`)

    let fullPath = ''
    if (fs.existsSync(folderPath)) fullPath = folderPath
    else if (fs.existsSync(legacyPath)) fullPath = legacyPath
    else if (fs.existsSync(legacyPathMd)) fullPath = legacyPathMd
    else return null

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || '',
      subtitle: data.subtitle || '',
      author: data.author || '',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      category: data.category || 'escola',
      image: data.image || '',
      image_caption: data.image_caption || '',
      destaque: data.destaque === true || data.destaque === 'true',
      secundaria: data.secundaria === true || data.secundaria === 'true',
      publicado: data.publicado === true || data.publicado === 'true',
      content,
    }
  } catch {
    return null
  }
}

export function getPostBySlug(slug: string): Post | null {
  return readPost(slug)
}

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function isNovo(dateStr: string): boolean {
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff <= 3 * 24 * 60 * 60 * 1000
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
