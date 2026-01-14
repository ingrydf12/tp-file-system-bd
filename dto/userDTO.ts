export interface UserBaseDTO {
  nome: string;
  login: string;
}

// Vem com nome e login
export interface CreateUserDTO extends UserBaseDTO {
  senha: string;
}

// Herança com o User, mas trazendo todos os atributos como opcionais
export interface UpdateUserDTO extends Partial<UserBaseDTO> {
  senha?: string;
}

export interface ResponseUserDTO {
  id: number,
  nome: string;
  login: string;
}