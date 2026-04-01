import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const token = process.env.GITHUB_TOKEN
  const owner = 'EEVirgiliaRodrigues'
  const repo = 'AloVirgilia'

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/content/posts`, {
    headers: { Authorization: `token ${token}` },
  })

  if (!res.ok) return NextResponse.json({ posts: [] })

  const files = await res.json()
  const posts = files
    .filter((f: any) => f.name.endsWith('.mdx') || f.name.endsWith('.md'))
    .map((f: any) => ({
      slug: f.name.replace(/\.(mdx|md)$/, ''),
      name: f.name,
      sha: f.sha,
    }))

  return NextResponse.json({ posts })
}
