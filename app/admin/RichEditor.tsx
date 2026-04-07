'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

// Converte o HTML do TipTap para markdown simples
function htmlParaMarkdown(html: string): string {
  return html
    .replace(/<h2>(.*?)<\/h2>/g, '\n## $1\n')
    .replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    .replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/g, '\n> $1\n')
    .replace(/<ul>([\s\S]*?)<\/ul>/g, (_, items) =>
      items.replace(/<li><p>(.*?)<\/p><\/li>/g, '- $1\n').replace(/<li>(.*?)<\/li>/g, '- $1\n')
    )
    .replace(/<ol>([\s\S]*?)<\/ol>/g, (_, items) => {
      let i = 1
      return items.replace(/<li><p>(.*?)<\/p><\/li>/g, () => `${i++}. $1\n`).replace(/<li>(.*?)<\/li>/g, () => `${i++}. $1\n`)
    })
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Converte markdown simples para HTML para o TipTap
function markdownParaHtml(md: string): string {
  if (!md) return '<p></p>'
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .split('\n\n')
    .map(p => {
      if (p.startsWith('<h2>') || p.startsWith('<h3>') || p.startsWith('<blockquote>') || p.startsWith('<ul>')) return p
      if (p.trim()) return `<p>${p.replace(/\n/g, '<br>')}</p>`
      return ''
    })
    .filter(Boolean)
    .join('')
}

interface RichEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  minHeight?: string
}

const btnStyle = (active: boolean): React.CSSProperties => ({
  background: active ? '#c8392b' : '#0a0a0a',
  border: `1px solid ${active ? '#c8392b' : '#1e1e1e'}`,
  borderRadius: '4px',
  padding: '0.3rem 0.6rem',
  color: active ? '#fff' : '#888',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontFamily: 'Space Grotesk, sans-serif',
})

export default function RichEditor({ value, onChange, placeholder, minHeight = '120px' }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: placeholder || 'Escreva o texto aqui...' }),
    ],
    content: markdownParaHtml(value),
    onUpdate: ({ editor }) => {
      onChange(htmlParaMarkdown(editor.getHTML()))
    },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight};padding:0.7rem 1rem;outline:none;font-family:Space Grotesk,sans-serif;font-size:0.95rem;line-height:1.7;color:#f0ede6`,
      },
    },
  })

  // Sincroniza se o valor mudar externamente (ex: ao carregar post existente)
  useEffect(() => {
    if (!editor) return
    const atual = htmlParaMarkdown(editor.getHTML())
    if (atual !== value) {
      editor.commands.setContent(markdownParaHtml(value), false)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div style={{ border: '1px solid #1e1e1e', borderRadius: '6px', background: '#111', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.3rem', padding: '0.5rem', borderBottom: '1px solid #1e1e1e', flexWrap: 'wrap' as const, background: '#0a0a0a' }}>
        <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }} style={btnStyle(editor.isActive('bold'))} title="Negrito">
          <b>N</b>
        </button>
        <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }} style={btnStyle(editor.isActive('italic'))} title="Itálico">
          <i>I</i>
        </button>
        <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }} style={btnStyle(editor.isActive('underline'))} title="Sublinhado">
          <u>S</u>
        </button>
        <div style={{ width: '1px', background: '#1e1e1e', margin: '0 0.2rem' }} />
        <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }} style={btnStyle(editor.isActive('heading', { level: 2 }))} title="Título">
          H2
        </button>
        <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run() }} style={btnStyle(editor.isActive('heading', { level: 3 }))} title="Subtítulo">
          H3
        </button>
        <div style={{ width: '1px', background: '#1e1e1e', margin: '0 0.2rem' }} />
        <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run() }} style={btnStyle(editor.isActive('blockquote'))} title="Citação">
          " "
        </button>
        <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }} style={btnStyle(editor.isActive('bulletList'))} title="Lista">
          • Lista
        </button>
        <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }} style={btnStyle(editor.isActive('orderedList'))} title="Lista numerada">
          1. Lista
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style>{`
        .ProseMirror p { margin-bottom: 1rem; }
        .ProseMirror h2 { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #f0ede6; margin: 1.5rem 0 0.5rem; border-top: 1px solid #1e1e1e; padding-top: 1rem; }
        .ProseMirror h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #f0ede6; margin: 1.2rem 0 0.4rem; }
        .ProseMirror blockquote { border-left: 3px solid #c8392b; margin: 1.5rem 0; padding: 0.25rem 0 0.25rem 1rem; font-style: italic; color: #d0cdc6; }
        .ProseMirror ul { padding-left: 1.5rem; margin-bottom: 1rem; }
        .ProseMirror ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        .ProseMirror li { margin-bottom: 0.25rem; }
        .ProseMirror strong { font-weight: 700; color: #f0ede6; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #444; pointer-events: none; float: left; height: 0; }
        .ProseMirror:focus { outline: none; }
      `}</style>
    </div>
  )
}
