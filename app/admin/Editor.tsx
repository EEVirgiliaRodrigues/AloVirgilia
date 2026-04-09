'use client'
import { useState, useEffect, useRef } from 'react'
import RichEditor from './RichEditor'
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

// Bloco de conteúdo — texto puro ou imagem flutuante
type Bloco =
  | { tipo: 'texto'; conteudo: string }
  | { tipo: 'imagem-flutuante'; src: string; lado: 'left' | 'right'; largura: string; legenda: string; textoAoLado: string }
  | { tipo: 'video'; url: string; legenda: string }
  | { tipo: 'imagem-simples'; src: string; legenda: string; alinhamento: 'left' | 'center' | 'right' | 'full' }
  | { tipo: 'galeria'; imagens: { src: string; legenda: string }[] }

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
    const m = fmRaw.match(new RegExp(`^${key}:\\s*['"]?(.*?)['"]?$`, 'm'))
    return m ? m[1] : ''
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

// Extrai ID do YouTube de qualquer formato de URL
function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  return m ? m[1] : null
}

// Converte blocos para MDX final
function blocosParaMDX(blocos: Bloco[]): string {
  return blocos.map(b => {
    if (b.tipo === 'texto') return b.conteudo
    if (b.tipo === 'imagem-simples') {
      if (!b.src) return ''
      const align = b.alinhamento === 'full' ? '100%' : b.alinhamento === 'center' ? '70%' : '45%'
      const margin = b.alinhamento === 'center' ? '1.5rem auto' : b.alinhamento === 'right' ? '1rem 0 1rem auto' : '1rem auto 1rem 0'
      return `<figure style="width:${align};margin:${margin};display:block">
  <img src="${b.src}" alt="${b.legenda}" style="width:100%;border-radius:6px;display:block" />
  ${b.legenda ? `<figcaption style="font-size:0.75rem;color:#888;text-align:center;margin-top:0.4rem;font-style:italic">${b.legenda}</figcaption>` : ''}
</figure>`
    }
    if (b.tipo === 'galeria') {
      if (!b.imagens.length) return ''
      const id = `galeria-${Math.random().toString(36).slice(2,7)}`
      const imgs = b.imagens.map((img, i) => 
        `<div class="galeria-slide" style="display:${i===0?'block':'none'}"><img src="${img.src}" alt="${img.legenda}" style="width:100%;height:320px;object-fit:cover;border-radius:6px" />${img.legenda ? `<p style="font-size:0.75rem;color:#888;text-align:center;margin-top:0.4rem;font-style:italic">${img.legenda}</p>` : ''}</div>`
      ).join('
')
      return `<div class="galeria-wrap" id="${id}" style="position:relative;margin:1.5rem 0">
${imgs}
  <button onclick="gPrev('${id}')" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);border:none;color:#fff;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:1.1rem">‹</button>
  <button onclick="gNext('${id}')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);border:none;color:#fff;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:1.1rem">›</button>
  <div style="text-align:center;margin-top:0.5rem;font-size:0.75rem;color:#888" class="galeria-counter" id="${id}-count">1 / ${b.imagens.length}</div>
</div>
<script>
(function(){
  function gSlide(id, dir) {
    var wrap = document.getElementById(id);
    if (!wrap) return;
    var slides = wrap.querySelectorAll('.galeria-slide');
    var counter = document.getElementById(id + '-count');
    var cur = 0;
    slides.forEach(function(s, i) { if (s.style.display !== 'none') cur = i; });
    slides[cur].style.display = 'none';
    cur = (cur + dir + slides.length) % slides.length;
    slides[cur].style.display = 'block';
    if (counter) counter.textContent = (cur + 1) + ' / ' + slides.length;
  }
  window.gPrev = function(id) { gSlide(id, -1); };
  window.gNext = function(id) { gSlide(id, 1); };
})();
</script>`
    }
    if (b.tipo === 'video') {
      const id = getYoutubeId(b.url)
      if (!id) return b.legenda ? `*${b.legenda}*` : ''
      return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5rem 0;border-radius:8px">
  <iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe>
</div>${b.legenda ? `
*${b.legenda}*` : ''}`
    }
    const margin = b.lado === 'right' ? '0.5rem 0 1rem 1.5rem' : '0.5rem 1.5rem 1rem 0'
    return `<div style="float:${b.lado};margin:${margin};width:${b.largura}">
  <img src="${b.src}" alt="${b.legenda}" style="width:100%;border-radius:4px" />
  ${b.legenda ? `<p style="font-size:0.75rem;color:#888;text-align:center;margin-top:0.25rem;font-style:italic">${b.legenda}</p>` : ''}
</div>
${b.textoAoLado}
<div style="clear:both"></div>`
  }).join('\n\n')
}

// Converte MDX existente em blocos
function mdxParaBlocos(content: string): Bloco[] {
  if (!content.trim()) return [{ tipo: 'texto', conteudo: '' }]
  // Tenta detectar blocos de imagem flutuante existentes
  const regex = /<div style="float:(left|right);[^"]*width:([^"]+)">\s*<img src="([^"]*)"[^>]*\/>\s*(?:<p[^>]*>([^<]*)<\/p>)?\s*<\/div>\n?([\s\S]*?)<div style="clear:both"><\/div>/g
  let resultado: Bloco[] = []
  let lastIndex = 0
  let match
  while ((match = regex.exec(content)) !== null) {
    // Texto antes
    const antes = content.slice(lastIndex, match.index).trim()
    if (antes) resultado.push({ tipo: 'texto', conteudo: antes })
    resultado.push({
      tipo: 'imagem-flutuante',
      lado: match[1] as 'left' | 'right',
      largura: match[2],
      src: match[3],
      legenda: match[4] || '',
      textoAoLado: match[5].trim(),
    })
    lastIndex = match.index + match[0].length
  }
  const resto = content.slice(lastIndex).trim()
  if (resto) resultado.push({ tipo: 'texto', conteudo: resto })
  // Detectar blocos de video
  const videoRegex = /<div style="position:relative;padding-bottom:56\.25%[^>]*>[\s\S]*?<\/div>(?:\n\*([^*]*)\*)?/g
  let resultado2: Bloco[] = []
  let lastIndex2 = 0
  let match2
  const contentToProcess = resultado.length === 1 && resultado[0].tipo === 'texto' ? (resultado[0] as any).conteudo : null
  if (contentToProcess) {
    while ((match2 = videoRegex.exec(contentToProcess)) !== null) {
      const antes = contentToProcess.slice(lastIndex2, match2.index).trim()
      if (antes) resultado2.push({ tipo: 'texto', conteudo: antes })
      const iframeM = match2[0].match(/embed\/([\w-]{11})/)
      if (iframeM) {
        resultado2.push({ tipo: 'video', url: `https://www.youtube.com/watch?v=${iframeM[1]}`, legenda: match2[1] || '' })
      }
      lastIndex2 = match2.index + match2[0].length
    }
    if (resultado2.length > 0) {
      const resto2 = contentToProcess.slice(lastIndex2).trim()
      if (resto2) resultado2.push({ tipo: 'texto', conteudo: resto2 })
      resultado = resultado2
    }
  }
  if (resultado.length === 0) resultado.push({ tipo: 'texto', conteudo: content })
  return resultado
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Space Grotesk, sans-serif', color: '#f0ede6' },
  header: { borderBottom: '1px solid #1e1e1e', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 },
  main: { maxWidth: '860px', margin: '0 auto', padding: '2rem' },
  label: { display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.4rem' },
  input: { width: '100%', background: '#111', border: '1px solid #1e1e1e', borderRadius: '6px', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.95rem', outline: 'none', fontFamily: 'Space Grotesk, sans-serif' },
  select: { width: '100%', background: '#111', border: '1px solid #1e1e1e', borderRadius: '6px', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.95rem', outline: 'none', fontFamily: 'Space Grotesk, sans-serif' },
  saveBtn: { background: '#c8392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.6rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' },
  toolBtn: { background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '4px', padding: '0.3rem 0.6rem', color: '#888', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Space Grotesk, sans-serif' },
  blocoTexto: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem' },
  blocoImagem: { background: '#111', border: '2px solid #c8392b', borderRadius: '8px', padding: '1.25rem', marginBottom: '0.5rem' },
  addBtn: { background: 'transparent', border: '1px dashed #444', borderRadius: '6px', padding: '0.6rem 1rem', color: '#888', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Space Grotesk, sans-serif' },
  removeBtn: { background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Space Grotesk, sans-serif', padding: '0' },
}

export default function Editor({ slug: slugProp }: { slug?: string }) {
  const router = useRouter()
  const isEdit = !!slugProp
  const [slug, setSlug] = useState(slugProp || '')
  const [fm, setFm] = useState<Frontmatter>({
    title: '', subtitle: '', author: '', date: new Date().toISOString().split('T')[0],
    category: 'escola', image: '', image_caption: '',
  })
  const [blocos, setBlocos] = useState<Bloco[]>([{ tipo: 'texto', conteudo: '' }])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [uploadingCapa, setUploadingCapa] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!isEdit) return
    fetch(`/api/admin/post?slug=${slugProp}`)
      .then(r => r.json())
      .then(d => {
        if (d.content) {
          const { fm: parsedFm, content } = parseFrontmatter(d.content)
          setFm(parsedFm)
          setBlocos(mdxParaBlocos(content))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isEdit, slugProp])

  const gerarSlug = (title: string) =>
    title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')

  async function uploadImagem(file: File): Promise<string | null> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    if (!res.ok) return null
    return (await res.json()).url
  }

  async function handleCapaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingCapa(true)
    const url = await uploadImagem(file)
    if (url) setFm(f => ({ ...f, image: url }))
    setUploadingCapa(false)
  }

  async function handleImagemFlutuante(idx: number, file: File) {
    setUploadingIdx(idx)
    const url = await uploadImagem(file)
    if (url) {
      setBlocos(prev => prev.map((b, i) =>
        i === idx && b.tipo === 'imagem-flutuante' ? { ...b, src: url } : b
      ))
    }
    setUploadingIdx(null)
  }

  function addBloco(tipo: 'texto' | 'imagem-flutuante' | 'video' | 'imagem-simples' | 'galeria', aposIdx: number) {
    const novo: Bloco = tipo === 'texto'
      ? { tipo: 'texto', conteudo: '' }
      : tipo === 'video'
      ? { tipo: 'video', url: '', legenda: '' }
      : tipo === 'imagem-simples'
      ? { tipo: 'imagem-simples', src: '', legenda: '', alinhamento: 'full' as const }
      : tipo === 'galeria'
      ? { tipo: 'galeria', imagens: [] }
      : { tipo: 'imagem-flutuante', src: '', lado: 'right', largura: '220px', legenda: '', textoAoLado: '' }
    setBlocos(prev => {
      const next = [...prev]
      next.splice(aposIdx + 1, 0, novo)
      return next
    })
  }

  function removeBloco(idx: number) {
    setBlocos(prev => prev.filter((_, i) => i !== idx))
  }

  function updateBloco(idx: number, partial: Partial<Bloco>) {
    setBlocos(prev => prev.map((b, i) => i === idx ? { ...b, ...partial } as Bloco : b))
  }

  async function salvar() {
    if (!slug) return setErro('Título obrigatório.')
    setSaving(true); setErro('')
    const content = blocosParaMDX(blocos)
    const res = await fetch('/api/admin/salvar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, frontmatter: fm, content }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true); setTimeout(() => setSaved(false), 3000)
      if (!isEdit) router.push(`/admin/editar/${slug}`)
    } else {
      setErro((await res.json()).error || 'Erro ao salvar.')
    }
  }

  // Aplica formatação no textarea do bloco de texto
  function aplicarFormatacao(idx: number, tipo: string) {
    const ta = document.querySelector(`[data-bloco="${idx}"]`) as HTMLTextAreaElement
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const bloco = blocos[idx]
    if (bloco.tipo !== 'texto') return
    const texto = bloco.conteudo
    const selecionado = texto.slice(start, end)

    let novo = texto
    let cursorStart = start
    let cursorEnd = end

    if (tipo === 'negrito') {
      novo = texto.slice(0, start) + `**${selecionado}**` + texto.slice(end)
      cursorStart = start + 2; cursorEnd = end + 2
    } else if (tipo === 'italico') {
      novo = texto.slice(0, start) + `*${selecionado}*` + texto.slice(end)
      cursorStart = start + 1; cursorEnd = end + 1
    } else if (tipo === 'h2') {
      const lineStart = texto.lastIndexOf('\n', start - 1) + 1
      novo = texto.slice(0, lineStart) + '## ' + texto.slice(lineStart)
      cursorStart = start + 3; cursorEnd = end + 3
    } else if (tipo === 'h3') {
      const lineStart = texto.lastIndexOf('\n', start - 1) + 1
      novo = texto.slice(0, lineStart) + '### ' + texto.slice(lineStart)
      cursorStart = start + 4; cursorEnd = end + 4
    } else if (tipo === 'citacao') {
      const lineStart = texto.lastIndexOf('\n', start - 1) + 1
      novo = texto.slice(0, lineStart) + '> ' + texto.slice(lineStart)
      cursorStart = start + 2; cursorEnd = end + 2
    } else if (tipo === 'lista') {
      const lineStart = texto.lastIndexOf('\n', start - 1) + 1
      novo = texto.slice(0, lineStart) + '- ' + texto.slice(lineStart)
      cursorStart = start + 2; cursorEnd = end + 2
    }

    updateBloco(idx, { conteudo: novo })
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(cursorStart, cursorEnd)
    }, 10)
  }

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
      Carregando matéria...
    </div>
  )

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
            }}>👁 Preview</a>
          )}
          <button onClick={salvar} disabled={saving} style={s.saveBtn}>
            {saving ? 'Salvando...' : 'Salvar matéria'}
          </button>
        </div>
      </header>

      <main style={s.main}>
        {/* Metadados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <label style={s.label}>Título *</label>
            <input style={{ ...s.input, fontSize: '1.2rem', fontFamily: 'Playfair Display, serif' }}
              value={fm.title} onChange={e => { setFm(f => ({ ...f, title: e.target.value })); if (!isEdit) setSlug(gerarSlug(e.target.value)) }}
              placeholder="Título da matéria" />
            {slug && <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.3rem' }}>Slug: {slug}</div>}
          </div>
          <div>
            <label style={s.label}>Subtítulo / Olho</label>
            <input style={s.input} value={fm.subtitle} onChange={e => setFm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Frase de abertura" />
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
          <div>
            <label style={s.label}>Imagem de capa</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {fm.image && <img src={fm.image} alt="capa" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #1e1e1e' }} />}
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

        {/* Editor por blocos */}
        <div>
          <label style={s.label}>Conteúdo</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {blocos.map((bloco, idx) => (
              <div key={idx}>
                {bloco.tipo === 'texto' ? (
                  <div style={s.blocoTexto}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Texto</span>
                      {blocos.length > 1 && (
                        <button onClick={() => removeBloco(idx)} style={s.removeBtn}>✕ remover</button>
                      )}
                    </div>
                    <RichEditor
                      value={bloco.conteudo}
                      onChange={val => updateBloco(idx, { conteudo: val })}
                      placeholder="Escreva o texto aqui..."
                    />
                  </div>
                ) : bloco.tipo === 'imagem-flutuante' ? (
                  <div style={s.blocoImagem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#c8392b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>🖼 Imagem com texto ao lado</span>
                      <button onClick={() => removeBloco(idx)} style={s.removeBtn}>✕ remover</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      {/* Coluna esquerda: imagem */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <label style={s.label}>Imagem</label>
                          {bloco.src ? (
                            <div style={{ position: 'relative' }}>
                              <img src={bloco.src} alt="" style={{ width: '100%', borderRadius: '4px', maxHeight: '150px', objectFit: 'cover' }} />
                              <label style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: '#fff', fontSize: '0.75rem' }}>
                                Trocar
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImagemFlutuante(idx, e.target.files[0])} />
                              </label>
                            </div>
                          ) : (
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', background: '#0a0a0a', border: '1px dashed #444', borderRadius: '6px', cursor: 'pointer', color: '#888', fontSize: '0.875rem', flexDirection: 'column', gap: '0.5rem' }}>
                              {uploadingIdx === idx ? 'Enviando...' : <>📁<span>Escolher imagem</span></>}
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImagemFlutuante(idx, e.target.files[0])} disabled={uploadingIdx === idx} />
                            </label>
                          )}
                        </div>
                        <div>
                          <label style={s.label}>Legenda</label>
                          <input style={s.input} value={bloco.legenda} onChange={e => updateBloco(idx, { legenda: e.target.value })} placeholder="Opcional" />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <div style={{ flex: 1 }}>
                            <label style={s.label}>Posição</label>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              {(['left', 'right'] as const).map(l => (
                                <button key={l} onClick={() => updateBloco(idx, { lado: l })} style={{
                                  flex: 1, padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
                                  background: bloco.lado === l ? '#c8392b' : '#0a0a0a',
                                  border: `1px solid ${bloco.lado === l ? '#c8392b' : '#1e1e1e'}`,
                                  color: bloco.lado === l ? '#fff' : '#888',
                                  fontFamily: 'Space Grotesk, sans-serif',
                                }}>
                                  {l === 'left' ? '← Esq' : 'Dir →'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={s.label}>Tamanho</label>
                            <select style={s.select} value={bloco.largura} onChange={e => updateBloco(idx, { largura: e.target.value })}>
                              <option value="160px">Pequena</option>
                              <option value="220px">Média</option>
                              <option value="300px">Grande</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Coluna direita: texto ao lado */}
                      <div>
                        <label style={s.label}>Texto que fica ao lado da imagem</label>
                        <textarea
                          style={{ ...s.input, minHeight: '200px', resize: 'vertical' as const, lineHeight: '1.7' }}
                          value={bloco.textoAoLado}
                          onChange={e => updateBloco(idx, { textoAoLado: e.target.value })}
                          placeholder="Este texto vai aparecer ao lado da imagem..."
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Bloco video */}
                {bloco.tipo === 'video' && (
                  <div style={{ ...s.blocoTexto, borderColor: '#4a9fd4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#4a9fd4', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600 }}>📹 Vídeo do YouTube</span>
                      <button onClick={() => removeBloco(idx)} style={s.removeBtn}>✕ remover</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
                      <div>
                        <label style={s.label}>Link do YouTube</label>
                        <input style={s.input} value={bloco.url}
                          onChange={e => updateBloco(idx, { url: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..." />
                      </div>
                      {bloco.url && getYoutubeId(bloco.url) && (
                        <div style={{ position: 'relative', paddingBottom: '30%', height: 0, overflow: 'hidden', borderRadius: '6px', maxWidth: '400px' }}>
                          <iframe src={`https://www.youtube.com/embed/${getYoutubeId(bloco.url)}`}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                            allowFullScreen />
                        </div>
                      )}
                      <div>
                        <label style={s.label}>Legenda (opcional)</label>
                        <input style={s.input} value={bloco.legenda}
                          onChange={e => updateBloco(idx, { legenda: e.target.value })}
                          placeholder="Descrição do vídeo" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bloco imagem simples */}
                {bloco.tipo === 'imagem-simples' && (
                  <div style={{ ...s.blocoTexto, borderColor: '#3db87a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#3db87a', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600 }}>🖼 Imagem</span>
                      <button onClick={() => removeBloco(idx)} style={s.removeBtn}>✕ remover</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
                      {bloco.src ? (
                        <div style={{ position: 'relative' }}>
                          <img src={bloco.src} alt="" style={{ width: '100%', borderRadius: '6px', maxHeight: '200px', objectFit: 'cover' }} />
                          <label style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: '#fff', fontSize: '0.75rem' }}>
                            Trocar
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                              const file = e.target.files?.[0]; if (!file) return
                              const url = await uploadImagem(file)
                              if (url) updateBloco(idx, { src: url })
                            }} />
                          </label>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', background: '#0a0a0a', border: '1px dashed #444', borderRadius: '6px', cursor: 'pointer', color: '#888', fontSize: '0.875rem', flexDirection: 'column' as const, gap: '0.5rem' }}>
                          📁 <span>Escolher imagem</span>
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                            const file = e.target.files?.[0]; if (!file) return
                            const url = await uploadImagem(file)
                            if (url) updateBloco(idx, { src: url })
                          }} />
                        </label>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['full', 'center', 'left', 'right'] as const).map(a => (
                          <button key={a} onClick={() => updateBloco(idx, { alinhamento: a })} style={{
                            flex: 1, padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
                            background: bloco.alinhamento === a ? '#3db87a' : '#0a0a0a',
                            border: `1px solid ${bloco.alinhamento === a ? '#3db87a' : '#1e1e1e'}`,
                            color: bloco.alinhamento === a ? '#fff' : '#888',
                            fontFamily: 'Space Grotesk, sans-serif',
                          }}>
                            {a === 'full' ? 'Largura total' : a === 'center' ? 'Centro' : a === 'left' ? 'Esquerda' : 'Direita'}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label style={s.label}>Legenda (opcional)</label>
                        <input style={s.input} value={bloco.legenda} onChange={e => updateBloco(idx, { legenda: e.target.value })} placeholder="Descrição da imagem" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bloco galeria / carrossel */}
                {bloco.tipo === 'galeria' && (
                  <div style={{ ...s.blocoTexto, borderColor: '#a870d4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#a870d4', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600 }}>🖼 Galeria / Carrossel</span>
                      <button onClick={() => removeBloco(idx)} style={s.removeBtn}>✕ remover</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                        {bloco.imagens.map((img, imgIdx) => (
                          <div key={imgIdx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                            <img src={img.src} alt={img.legenda} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                            <button onClick={() => {
                              const novas = bloco.imagens.filter((_, i) => i !== imgIdx)
                              updateBloco(idx, { imagens: novas })
                            }} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(200,57,43,0.9)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                          </div>
                        ))}
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', background: '#0a0a0a', border: '1px dashed #444', borderRadius: '4px', cursor: 'pointer', color: '#888', fontSize: '0.75rem', flexDirection: 'column' as const, gap: '0.25rem' }}>
                          + Foto
                          <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={async e => {
                            const files = Array.from(e.target.files || [])
                            const novas = [...bloco.imagens]
                            for (const file of files) {
                              const url = await uploadImagem(file)
                              if (url) novas.push({ src: url, legenda: '' })
                            }
                            updateBloco(idx, { imagens: novas })
                          }} />
                        </label>
                      </div>
                      {bloco.imagens.length > 0 && (
                        <div style={{ color: '#888', fontSize: '0.8rem' }}>
                          {bloco.imagens.length} foto{bloco.imagens.length > 1 ? 's' : ''} — no site as fotos passam com as setas ← →
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Botões para adicionar bloco após este */}
                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', padding: '0.25rem 0', flexWrap: 'wrap' as const }}>
                  <button style={s.addBtn} onClick={() => addBloco('texto', idx)}>+ Texto</button>
                  <button style={s.addBtn} onClick={() => addBloco('imagem-flutuante', idx)}>+ Img com texto</button>
                  <button style={s.addBtn} onClick={() => addBloco('imagem-simples', idx)}>+ Imagem</button>
                  <button style={s.addBtn} onClick={() => addBloco('galeria', idx)}>+ Galeria</button>
                  <button style={s.addBtn} onClick={() => addBloco('video', idx)}>+ Vídeo</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
