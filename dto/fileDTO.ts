export interface CreateFileDTO {
  nome: string;
  tamanho: number;
  tipo: string;
  pasta_id: number;
}

export interface ResponseFileDTO {
  nome: string;
  tamanho: number;
  tipo: string;
}

export interface UpdateFileDTO extends Partial<ResponseFileDTO> {}
