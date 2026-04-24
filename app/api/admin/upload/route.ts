import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

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

  const arrayBuffer = await file.arrayBuffer()
  const inputBuffer = Buffer.from(new Uint8Array(arrayBuffer))
  let outputBuffer: Buffer = inputBuffer
  let filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '-')}`

  // Imagens de capa: comprime para menos de 300KB para WhatsApp
  if (tipo === 'capa') {
    const compressed = await sharp(inputBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
    outputBuffer = Buffer.from(new Uint8Array(compressed))
    filename = filename.replace(/\.[^.]+$/, '') + '.jpg'
  }

  const base64 = outputBuffer.toString('base64')
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

  const url = tipo === 'capa'
    ? `/uploads/${filename}`
    : `https://raw.githubusercontent.com/${owner}/${repo}/main/public/uploads/${filename}`

  return NextResponse.json({ url })
}
