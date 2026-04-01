'use client'
import { useEffect } from 'react'

export default function CardAnimator() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.gcard, .arquivo-item')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}
