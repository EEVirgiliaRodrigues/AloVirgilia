import type { Metadata } from 'next'
import './globals.css'
import CardAnimator from '@/components/CardAnimator'

export const metadata: Metadata = {
  title: 'Alô Virgília',
  description: 'Jornalismo feito por quem vive a escola',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}})();` }} />
        <CardAnimator />
        {children}
      </body>
    </html>
  )
}
