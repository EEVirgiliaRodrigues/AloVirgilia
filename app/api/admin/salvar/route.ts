import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { slug, frontmatter, content } = await req.json()
  if (!slug || !content) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })

  const token = process.env.GITHUB_TOKEN
  const owner = 'EEVirgiliaRodrigues'
  const repo = 'AloVirgilia'
  const path = `content/posts/${slug}.mdx`

  // Montar o frontmatter (sem publicado e destaque — você controla manualmente)
  const fm = [
    '---',
    `title: '${(frontmatter.title || '').replace(/'/g, "''")}'`,
    frontmatter.subtitle ? `subtitle: '${frontmatter.subtitle.replace(/'/g, "''")}'` : '',
    `author: '${(frontmatter.author || '').replace(/'/g, "''")}'`,
    `date: ${frontmatter.date || new Date().toISOString().split('T')[0]}`,
    `category: ${frontmatter.category || 'escola'}`,
    frontmatter.image ? `image: ${frontmatter.image}` : '',
    frontmatter.image_caption ? `image_caption: '${frontmatter.image_caption.replace(/'/g, "''")}'` : '',
    'publicado: false',
    'destaque: false',
    '---',
  ].filter(Boolean).join('\n')

  const fileContent = `${fm}\n\n${content}`
  const base64 = Buffer.from(fileContent).toString('base64')

  // Verificar se o arquivo já existe (para pegar o SHA)
  let sha: string | undefined
  const existing = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}` },
  })
  if (existing.ok) {
    const data = await existing.json()
    sha = data.sha
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: sha ? `update: ${slug}` : `feat: ${slug}`,
      content: base64,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, slug })
}
