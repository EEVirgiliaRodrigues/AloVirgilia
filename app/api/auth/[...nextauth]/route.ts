import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { usuarios } from '@/lib/usuarios'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const usuario = usuarios.find(
          u => u.email.toLowerCase() === credentials.email.toLowerCase()
        )
        if (!usuario) return null
        const ok = bcrypt.compareSync(credentials.password, usuario.senha)
        if (!ok) return null
        return { id: usuario.id, name: usuario.nome, email: usuario.email }
      },
    }),
  ],
  pages: { signIn: '/admin/entrar' },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
