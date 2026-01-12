import { FolderDAO } from "../dao/folderDAO";
import { CreateFolderDTO, UpdateFolderDTO } from "../dto/folderDTO";
import { Folder } from "../model/folder";
import { hashSenha } from "../sal/hash";

const folderDAO = new FolderDAO();

export async function createFolder(usuarioId: number, dto: CreateFolderDTO) {
  if (!usuarioId) {
    throw new Error("Você precisa estar logado pra realizar essa operação.");
  }

  if (!dto.nome || dto.nome.trim() === "") {
    throw new Error("O nome da sua pasta é obrigatório");
  }

  if (!dto.isPublic && !dto.pin) {
    throw new Error("Pasta privada precisa de senha");
  }

  if (dto.pin !== undefined && !/^\d+$/.test(dto.pin.toString())) {
    throw new Error("PIN deve conter apenas números");
  }

  const senhaHash = dto.pin ? await hashSenha(dto.pin) : undefined;

  const folder = new Folder(
    0,
    dto.nome,
    new Date(),
    dto.isPublic,
    usuarioId,
    senhaHash
  );

  const savedFolder = await folderDAO.create(folder);

  return {
    id: savedFolder.id,
    nome: savedFolder.nome,
    isPublic: savedFolder.isPublic,
  };
}

export async function updateFolder(
  folderId: number,
  usuarioId: number,
  dto: UpdateFolderDTO
) {
  const folder = await folderDAO.findById(folderId);

  if (!folder) {
    throw new Error("Pasta não encontrada");
  }

  if (folder.usuario_id !== usuarioId) {
    throw new Error("Sem permissão para editar esta pasta");
  }

  if (dto.nome !== undefined) folder.nome = dto.nome;
  if (dto.isPublic !== undefined) folder.isPublic = dto.isPublic;

  if (!folder.isPublic && !dto.pin) {
    throw new Error("Pasta privada precisa de senha");
  }

  if (dto.pin) {
    folder.pin = await hashSenha(dto.pin);
  }

  return folderDAO.updateFolder(folder);
}
