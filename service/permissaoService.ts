import { PermissaoDAO } from "../dao/permissionDAO";
import { Permissao, NivelPermissao } from "../model/permissao";

const permissaoDAO = new PermissaoDAO();

export async function concederPermissao(
  usuarioId: number,
  pastaId: number,
  tipo: NivelPermissao
): Promise<Permissao> {
  const permissao = new Permissao(0, usuarioId, pastaId, tipo);
  return await permissaoDAO.upsertPermissao(permissao);
}

export async function removerPermissao(
  usuarioId: number,
  pastaId: number
): Promise<boolean> {
  return await permissaoDAO.deleteByUserAndFolder(usuarioId, pastaId);
}

export async function atualizarPermissao(
  usuarioId: number,
  pastaId: number,
  novoTipo: NivelPermissao
): Promise<Permissao> {
  const permissao = new Permissao(0, usuarioId, pastaId, novoTipo);
  return await permissaoDAO.upsertPermissao(permissao);
}

export async function verificarPermissao(
  usuarioId: number,
  pastaId: number
): Promise<Permissao | null> {
  return await permissaoDAO.findByUserAndFolder(usuarioId, pastaId);
}

export async function listarPermissoesUsuario(
  usuarioId: number
): Promise<Permissao[]> {
  return await permissaoDAO.findByUser(usuarioId);
}

export async function listarPermissoesPasta(
  pastaId: number
): Promise<Permissao[]> {
  return await permissaoDAO.findByFolder(pastaId);
}

export async function usuarioTemAcesso(
  usuarioId: number,
  pastaId: number,
  nivelRequerido: NivelPermissao = NivelPermissao.LEITURA
): Promise<boolean> {
  return await permissaoDAO.checkPermissionLevel(
    usuarioId,
    pastaId,
    nivelRequerido
  );
}
