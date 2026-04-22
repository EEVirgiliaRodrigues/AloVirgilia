import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const tipo = formData.get('tipo') as string || 'corpo'
  if (!file) return NextResponse.json({ error: 'Nenhum arquivo' }, { status: 400 })

  const token = process.env.GITHUB_TOKEN
  const owner = 'EEVirgiliaRodrigues'
  const repo = 'AloVirgilia'

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '-')}`
  const path = `public/uploads/${filename}`

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `upload: ${filename}`,
      content: base64,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  // Imagem de capa: usa caminho local (/uploads/) — disponível após deploy
  // Imagens do corpo: usa URL raw do GitHub — disponível imediatamente no editor
  const url = tipo === 'capa'
    ? `/uploads/${filename}`
    : `https://raw.githubusercontent.com/${owner}/${repo}/main/public/uploads/${filename}`

  return NextResponse.json({ url })
}
