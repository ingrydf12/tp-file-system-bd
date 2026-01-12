import * as bcrypt from "bcrypt";

// [Docs] Pra create, update
export async function hashSenha(senha: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(senha, saltRounds);
}

// [Docs] Pra logar e entrar em pastas
export async function compararSenha(
  senha: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}