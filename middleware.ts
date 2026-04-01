import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/admin/entrar",
  },
})

export const config = {
  matcher: ["/admin/nova", "/admin/editar/:path*", "/admin"],
}
