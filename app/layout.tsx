import type { Metadata } from 'next'
import './globals.css'
import CardAnimator from '@/components/CardAnimator'

export const metadata: Metadata = {
  title: 'Alô Virgília',
  description: 'Jornalismo feito por quem vive a escola',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  'name': 'Alô Virgília',
  'alternateName': 'Jornal Alô Virgília',
  'description': 'Jornalismo feito por quem vive a escola — EE Virgília Rodrigues Alves',
  'url': 'https://alo-virgilia.vercel.app',
  'foundingLocation': {
    '@type': 'Place',
    'name': 'São Paulo, Brasil'
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}})();` }} />
        <CardAnimator />
        {children}
      </body>
    </html>
  )
}
