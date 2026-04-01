'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null
    const resolved = stored ?? 'dark'
    setTheme(resolved)
    document.documentElement.dataset.theme = resolved
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
  }

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Alternar tema">
      {theme === 'dark' ? '○ DIA' : '● NOITE'}
    </button>
  )
}
