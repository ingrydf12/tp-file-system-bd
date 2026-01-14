export interface CreateFileDTO {
  nome: string;
  tamanho: number;
  usuario_id: number;
}

export interface ResponseFileDTO {
  nome: string;
  tamanho: string;
}

export interface UpdateFileDTO extends Partial<ResponseFileDTO> {}
