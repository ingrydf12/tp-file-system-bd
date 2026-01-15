export interface UserBaseDTO {
  nome: string;
  login: string;
}

export interface CreateUserDTO extends UserBaseDTO {
  senha: string;
}

export interface UpdateUserDTO extends Partial<UserBaseDTO> {
  senha?: string;
}

export interface ResponseUserDTO {
  id: number;
  nome: string;
  login: string;
}