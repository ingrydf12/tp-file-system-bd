export interface UserBaseDTO {
  nome: string;
  email: string;
}

// Vem com nome e email
export interface CreateUserDTO extends UserBaseDTO {
  senha: string;
}

// Herança com o User, mas trazendo todos os atributos como opcionais
export interface UpdateUserDTO extends Partial<UserBaseDTO> {
  senha?: string;
}
