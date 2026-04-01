export default function Footer() {
  const ano = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="footer-brand"><em>Alô</em> Virgília</div>
      <div className="footer-tagline">
        Site desenvolvido para a disciplina eletiva de Jornalismo da EE Virgília Rodrigues Alves
      </div>
      <div className="footer-copy">© {ano} — Todos os direitos reservados</div>
    </footer>
  )
}
