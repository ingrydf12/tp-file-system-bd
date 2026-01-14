import { UserDAO } from "../dao/userDAO";
import { CreateUserDTO, UpdateUserDTO } from "../dto/userDTO";
import { User } from "../model/user";
import { hashSenha, compararSenha } from "../sal/hash";

const userDAO = new UserDAO();

export async function createUser(dto: CreateUserDTO) {
  if (!dto.nome || !dto.login || !dto.senha) {
    throw new Error("Nome, login e senha são obrigatórios");
  }

  if (dto.senha.length < 6) {
    throw new Error("Senha deve ter pelo menos 6 caracteres");
  }

  const senhaHash = await hashSenha(dto.senha);

  const user = new User(
    0,
    dto.nome,
    dto.login,
    senhaHash
  );

  const savedUser = await userDAO.create(user);

  return {
    id: savedUser.id,
    nome: savedUser.nome,
    login: savedUser.login,
  };
}

export async function simularLogin(login: string, senha: string): Promise<number> {
  const user = await userDAO.findByLogin(login);

  if (!user) {
    throw new Error("Login ou senha inválidos");
  }

  const senhaOk = await compararSenha(senha, user.senha);

  if (!senhaOk) {
    throw new Error("Login ou senha inválidos");
  }

  return user.id;
}

export async function updateUser(dto: UpdateUserDTO) {
  // TODO: Tu procura pelo ID e atualiza conforme os dados passados
}

export async function deleteUser(id: number) {
  // TODO: Só precisa passar o ID e confirmar a operaçao
}
