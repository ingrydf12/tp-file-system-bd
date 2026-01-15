import { FileDAO } from "../dao/fileDAO";
import { CreateFileDTO, UpdateFileDTO } from "../dto/fileDTO";
import { File } from "../model/file";

const fileDAO = new FileDAO();

export async function createFile(usuarioId: number, dto: CreateFileDTO) {
  if (!usuarioId) {
    throw new Error("Você precisa estar logado pra realizar essa operação.");
  }

  if (!dto.nome || dto.nome.trim() === "") {
    throw new Error("O nome do arquivo é obrigatório");
  }

  if (dto.tamanho == null || dto.tipo?.trim() === "") {
    throw new Error(
      "Tamanho e tipo são informações obrigatórias para criar o arquivo"
    );
  }

  const file = new File(0, dto.nome, dto.tamanho, dto.tipo, dto.pasta_id);

  const savedFile = await fileDAO.create(file);

  return {
    id: savedFile.id,
    nome: savedFile.nome,
    tamanho: savedFile.tamanho,
  };
}

export async function updateFile(file: File, dto: UpdateFileDTO) {
  if (!file) {
    throw new Error("Arquivo não encontrado");
  }

  if (dto.nome !== undefined) {
    if (dto.nome.trim() === "") {
      throw new Error("O nome do arquivo não pode ser vazio");
    }
    file.nome = dto.nome;
  }

  if (dto.tamanho !== undefined) {
    if (dto.tamanho < 0) {
      throw new Error("Tamanho inválido");
    }
    file.tamanho = dto.tamanho;
  }

  if (dto.tipo !== undefined) {
    if (dto.tipo.trim() === "") {
      throw new Error("Tipo inválido");
    }
    file.tipo = dto.tipo;
  }

  const updatedFile = await fileDAO.update(file);

  return {
    id: updatedFile.id,
    nome: updatedFile.nome,
    tamanho: updatedFile.tamanho,
    tipo: updatedFile.tipo,
  };
}

export async function deleteFile(fileId: number): Promise<void> {
  if (!fileId) {
    throw new Error("ID do arquivo é obrigatório");
  }

  await fileDAO.deleteFile(fileId);
}

export async function findById(fileId: number): Promise<File | null> {
  if (!fileId || isNaN(fileId)) {
    throw new Error("ID do arquivo inválido");
  }

  const file = await fileDAO.findById(fileId);

  return file;
}