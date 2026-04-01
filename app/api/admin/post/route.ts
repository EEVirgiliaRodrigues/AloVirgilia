import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Slug obrigatório' }, { status: 400 })

  const token = process.env.GITHUB_TOKEN
  const owner = 'EEVirgiliaRodrigues'
  const repo = 'AloVirgilia'
  const path = `content/posts/${slug}.mdx`

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}` },
  })

  if (!res.ok) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })

  const data = await res.json()
  const content = Buffer.from(data.content, 'base64').toString('utf-8')

  return NextResponse.json({ content, sha: data.sha })
}
