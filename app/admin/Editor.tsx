'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Frontmatter {
  title: string
  subtitle: string
  author: string
  date: string
  category: string
  image: string
  image_caption: string
}

const categorias = [
  { value: 'escola', label: 'Escola' },
  { value: 'esportes', label: 'Esportes' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'opiniao', label: 'Opinião' },
]

function parseFrontmatter(raw: string): { fm: Frontmatter; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return {
    fm: { title: '', subtitle: '', author: '', date: '', category: 'escola', image: '', image_caption: '' },
    content: raw,
  }
  const fmRaw = match[1]
  const content = match[2].trim()
  const get = (key: string) => {
    const m = fmRaw.match(new RegExp(`^${key}:\\s*'?(.*?)'?$`, 'm'))
    return m ? m[1].replace(/''/g, "'") : ''
  }
  return {
    fm: {
      title: get('title'),
      subtitle: get('subtitle'),
      author: get('author'),
      date: get('date'),
      category: get('category') || 'escola',
      image: get('image'),
      image_caption: get('image_caption'),
    },
    content,
  }
}

export default function Editor({ slug: slugProp }: { slug?: string }) {
  const router = useRouter()
  const isEdit = !!slugProp
  const [slug, setSlug] = useState(slugProp || '')
  const [fm, setFm] = useState<Frontmatter>({
    title: '', subtitle: '', author: '', date: new Date().toISOString().split('T')[0],
    category: 'escola', image: '', image_caption: '',
  })
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [uploadingCapa, setUploadingCapa] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imgLado, setImgLado] = useState<'left' | 'right'>('right')
  const [imgLargura, setImgLargura] = useState('200px')
  const [imgLegenda, setImgLegenda] = useState('')
  const [uploadingModal, setUploadingModal] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cursorRef = useRef<number>(0)

  useEffect(() => {
    if (!isEdit) return
    fetch(`/api/admin/post?slug=${slugProp}`)
      .then(r => r.json())
      .then(d => {
        if (d.content) {
          const { fm: parsedFm, content: parsedContent } = parseFrontmatter(d.content)
          setFm(parsedFm)
          setContent(parsedContent)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isEdit, slugProp])

  const gerarSlug = (title: string) =>
    title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')

  const handleTitle = (val: string) => {
    setFm(f => ({ ...f, title: val }))
    if (!isEdit) setSlug(gerarSlug(val))
  }

  async function uploadImagem(file: File): Promise<string | null> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    if (!res.ok) return null
    const data = await res.json()
    return data.url
  }

  async function handleCapaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCapa(true)
    const url = await uploadImagem(file)
    if (url) setFm(f => ({ ...f, image: url }))
    setUploadingCapa(false)
  }

  function inserirNoTexto(texto: string) {
    const ta = textareaRef.current
    if (!ta) return
    const pos = cursorRef.current
    const antes = content.slice(0, pos)
    const depois = content.slice(pos)
    const novoConteudo = antes + texto + depois
    setContent(novoConteudo)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(pos + texto.length, pos + texto.length)
    }, 50)
  }

  function inserirFormatacao(antes: string, depois: string) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end)
    const novo = content.slice(0, start) + antes + selected + depois + content.slice(end)
    setContent(novo)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + antes.length, start + antes.length + selected.length)
    }, 50)
  }

  async function handleModalUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingModal(true)
    const url = await uploadImagem(file)
    if (url) {
      const html = `\n<div style="float:${imgLado};margin:${imgLado === 'right' ? '0.5rem 0 1rem 1.5rem' : '0.5rem 1.5rem 1rem 0'};width:${imgLargura}">\n  <img src="${url}" alt="${imgLegenda}" style="width:100%;border-radius:4px" />\n  ${imgLegenda ? `<p style="font-size:0.75rem;color:#888;text-align:center;margin-top:0.25rem;font-style:italic">${imgLegenda}</p>` : ''}\n</div>\n`
      inserirNoTexto(html)
      setShowImageModal(false)
      setImgLegenda('')
    }
    setUploadingModal(false)
  }

  async function salvar() {
    if (!slug) return setErro('Título obrigatório.')
    setSaving(true)
    setErro('')
    const res = await fetch('/api/admin/salvar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, frontmatter: fm, content }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      if (!isEdit) router.push(`/admin/editar/${slug}`)
    } else {
      const d = await res.json()
      setErro(d.error || 'Erro ao salvar.')
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'Space Grotesk, sans-serif' }}>
      Carregando matéria...
    </div>
  )

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Space Grotesk, sans-serif', color: '#f0ede6' },
    header: { borderBottom: '1px solid #1e1e1e', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 },
    main: { maxWidth: '860px', margin: '0 auto', padding: '2rem' },
    label: { display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.4rem' },
    input: { width: '100%', background: '#111', border: '1px solid #1e1e1e', borderRadius: '6px', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.95rem', outline: 'none', fontFamily: 'Space Grotesk, sans-serif' },
    select: { width: '100%', background: '#111', border: '1px solid #1e1e1e', borderRadius: '6px', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.95rem', outline: 'none', fontFamily: 'Space Grotesk, sans-serif' },
    toolbar: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' as const, padding: '0.5rem', background: '#111', borderBottom: '1px solid #1e1e1e', borderRadius: '6px 6px 0 0' },
    toolBtn: { background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '4px', padding: '0.3rem 0.6rem', color: '#888', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Space Grotesk, sans-serif' },
    textarea: { width: '100%', minHeight: '400px', background: '#111', border: '1px solid #1e1e1e', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '1rem', color: '#f0ede6', fontSize: '0.95rem', lineHeight: '1.7', outline: 'none', resize: 'vertical' as const, fontFamily: 'Space Grotesk, sans-serif' },
    saveBtn: { background: '#c8392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.6rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' },
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin" style={{ color: '#888', fontSize: '0.875rem' }}>← Matérias</Link>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700 }}>
            {isEdit ? `Editando: ${slugProp}` : 'Nova matéria'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {saved && <span style={{ color: '#3db87a', fontSize: '0.875rem' }}>✓ Salvo!</span>}
          {erro && <span style={{ color: '#c8392b', fontSize: '0.875rem' }}>{erro}</span>}
          {isEdit && (
            <a href={`/admin/preview?slug=${slugProp}`} target="_blank" style={{
              background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px',
              padding: '0.6rem 1rem', color: '#888', fontSize: '0.875rem',
            }}>
              👁 Preview
            </a>
          )}
          <button onClick={salvar} disabled={saving} style={s.saveBtn}>
            {saving ? 'Salvando...' : 'Salvar matéria'}
          </button>
        </div>
      </header>

      <main style={s.main}>
        {/* Campos principais */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <label style={s.label}>Título *</label>
            <input style={{ ...s.input, fontSize: '1.2rem', fontFamily: 'Playfair Display, serif' }}
              value={fm.title} onChange={e => handleTitle(e.target.value)} placeholder="Título da matéria" />
            {slug && <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.3rem' }}>Slug: {slug}</div>}
          </div>

          <div>
            <label style={s.label}>Subtítulo / Olho</label>
            <input style={s.input} value={fm.subtitle} onChange={e => setFm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Frase de abertura da matéria" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={s.label}>Autor(a) *</label>
              <input style={s.input} value={fm.author} onChange={e => setFm(f => ({ ...f, author: e.target.value }))} />
            </div>
            <div>
              <label style={s.label}>Data</label>
              <input type="date" style={s.input} value={fm.date} onChange={e => setFm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label style={s.label}>Editoria</label>
              <select style={s.select} value={fm.category} onChange={e => setFm(f => ({ ...f, category: e.target.value }))}>
                {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Imagem de capa */}
          <div>
            <label style={s.label}>Imagem de capa</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {fm.image && (
                <img src={fm.image} alt="capa" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #1e1e1e' }} />
              )}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'inline-block', background: '#111', border: '1px solid #1e1e1e', borderRadius: '6px', padding: '0.6rem 1rem', cursor: 'pointer', color: '#888', fontSize: '0.875rem' }}>
                  {uploadingCapa ? 'Enviando...' : fm.image ? 'Trocar imagem' : 'Escolher imagem'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCapaUpload} />
                </label>
                {fm.image && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ ...s.label, marginTop: '0.5rem' }}>Legenda da capa</label>
                    <input style={s.input} value={fm.image_caption} onChange={e => setFm(f => ({ ...f, image_caption: e.target.value }))} placeholder="Legenda opcional" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editor de conteúdo */}
        <div>
          <label style={s.label}>Conteúdo</label>
          <div style={s.toolbar}>
            <button style={s.toolBtn} onClick={() => inserirFormatacao('**', '**')} title="Negrito"><b>B</b></button>
            <button style={s.toolBtn} onClick={() => inserirFormatacao('*', '*')} title="Itálico"><i>I</i></button>
            <button style={s.toolBtn} onClick={() => inserirFormatacao('\n\n## ', '')} title="Título">H2</button>
            <button style={s.toolBtn} onClick={() => inserirFormatacao('\n\n### ', '')} title="Subtítulo">H3</button>
            <button style={s.toolBtn} onClick={() => inserirFormatacao('\n> ', '')} title="Citação">" "</button>
            <button style={s.toolBtn} onClick={() => inserirFormatacao('\n- ', '')} title="Lista">• Lista</button>
            <div style={{ width: '1px', background: '#1e1e1e', margin: '0 0.25rem' }} />
            <button style={{ ...s.toolBtn, color: '#f0ede6' }} onClick={() => setShowImageModal(true)} title="Imagem no texto">
              🖼 Imagem no texto
            </button>
          </div>
          <textarea
            ref={textareaRef}
            style={s.textarea}
            value={content}
            onChange={e => setContent(e.target.value)}
            onMouseUp={e => { cursorRef.current = (e.target as HTMLTextAreaElement).selectionStart }}
            onKeyUp={e => { cursorRef.current = (e.target as HTMLTextAreaElement).selectionStart }}
            placeholder="Escreva o conteúdo da matéria aqui..."
          />
        </div>
      </main>

      {/* Modal imagem flutuante */}
      {showImageModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowImageModal(false)}>
          <div style={{
            background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px',
            padding: '2rem', width: '100%', maxWidth: '440px',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '1.5rem' }}>Inserir imagem no texto</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={s.label}>Posição</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['left', 'right'] as const).map(l => (
                    <button key={l} onClick={() => setImgLado(l)} style={{
                      flex: 1, padding: '0.6rem', borderRadius: '6px', cursor: 'pointer',
                      background: imgLado === l ? '#c8392b' : '#0a0a0a',
                      border: `1px solid ${imgLado === l ? '#c8392b' : '#1e1e1e'}`,
                      color: imgLado === l ? '#fff' : '#888', fontSize: '0.875rem',
                    }}>
                      {l === 'left' ? '← Esquerda' : 'Direita →'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={s.label}>Largura</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[['160px', 'Pequena'], ['220px', 'Média'], ['300px', 'Grande']].map(([v, l]) => (
                    <button key={v} onClick={() => setImgLargura(v)} style={{
                      flex: 1, padding: '0.6rem', borderRadius: '6px', cursor: 'pointer',
                      background: imgLargura === v ? '#c8392b' : '#0a0a0a',
                      border: `1px solid ${imgLargura === v ? '#c8392b' : '#1e1e1e'}`,
                      color: imgLargura === v ? '#fff' : '#888', fontSize: '0.8rem',
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={s.label}>Legenda (opcional)</label>
                <input style={s.input} value={imgLegenda} onChange={e => setImgLegenda(e.target.value)} placeholder="Descrição da imagem" />
              </div>

              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#c8392b', color: '#fff', borderRadius: '6px',
                padding: '0.75rem', cursor: uploadingModal ? 'not-allowed' : 'pointer',
                opacity: uploadingModal ? 0.7 : 1, fontWeight: 600,
              }}>
                {uploadingModal ? 'Enviando imagem...' : '📁 Escolher e inserir imagem'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleModalUpload} disabled={uploadingModal} />
              </label>

              <button onClick={() => setShowImageModal(false)} style={{
                background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px',
                padding: '0.6rem', color: '#888', cursor: 'pointer', fontSize: '0.875rem',
              }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
