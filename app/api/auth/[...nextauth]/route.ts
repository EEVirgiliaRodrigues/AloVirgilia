import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { usuarios } from '@/lib/usuarios'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: '/admin/entrar' },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  callbacks: {
    async signIn({ user }) {
      // Só permite entrar se o email estiver na lista de usuários aprovados
      const aprovado = usuarios.some(
        u => u.email.toLowerCase() === user.email?.toLowerCase()
      )
      return aprovado
    },
    async session({ session }) {
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
