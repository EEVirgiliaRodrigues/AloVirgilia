// ============================================================
// ADICIONE AQUI OS EMAILS QUE PODEM ACESSAR O PAINEL
// Apenas contas Google com esses emails conseguem entrar
// ============================================================

export interface Usuario {
  email: string
  nome: string
}

export const usuarios: Usuario[] = [
  { email: 'gabrielpetryla@gmail.com', nome: 'Gabriel' },
  // Adicione mais emails aqui:
  // { email: 'professor@escola.edu.br', nome: 'Professor Silva' },
  // { email: 'aluno@escola.edu.br', nome: 'Aluno João' },
]
