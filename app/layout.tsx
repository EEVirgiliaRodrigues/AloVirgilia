import type { Metadata } from 'next'
import './globals.css'
import CardAnimator from '@/components/CardAnimator'

export const metadata: Metadata = {
  title: 'Alô Virgília',
  description: 'Jornal estudantil da EE Virgília Rodrigues Alves de Carvalho.',
  metadataBase: new URL('https://alo-virgilia.vercel.app'),
  openGraph: {
    title: 'Alô Virgília',
    description: 'Jornal estudantil da EE Virgília Rodrigues Alves de Carvalho.',
    url: 'https://alo-virgilia.vercel.app',
    siteName: 'Alô Virgília',
    type: 'website',
  },
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
