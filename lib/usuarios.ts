export interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
}

export const usuarios: Usuario[] = [
  {
    id: "1",
    nome: "Gabriel",
    email: "gabriel@escola.com",
    senha: "$2a$10$.Y0ktdYaHvbP3cLEAV/q1uFZl3mwO0jtfCBMLpugj2dolS7Efg212",
  },
]
