import { UserDAO } from "../dao/userDAO";
import { CreateUserDTO, UpdateUserDTO } from "../dto/userDTO";
import { User } from "../model/user";

const userDAO = new UserDAO();

export async function createUser(dto: CreateUserDTO) {
  if (!dto.nome || !dto.email || !dto.senha) {
    throw new Error("Nome, email e senha são obrigatórios");
  }

  if (!dto.email.includes("@")) {
    throw new Error("Email inválido");
  }

  if (dto.senha.length < 6) {
    throw new Error("Senha deve ter pelo menos 6 caracteres");
  }

  const user = new User(0, dto.nome, dto.email, dto.senha);

  const savedUser = await userDAO.create(user);

  return {
    id: savedUser.id_usuario,
    name: savedUser.nome,
    email: savedUser.email,
  };
}

export async function updateUser(dto: UpdateUserDTO) {
  // TODO: Tu procura pelo ID e atualiza conforme os dados passados
}

export async function deleteUser(id: number) {
  // TODO: Só precisa passar o ID e confirmar a operaçao
}
