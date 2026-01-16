export interface CreateFolderDTO {
  nome: string;
  isPublic: boolean;
  pin?: string;
}

export interface ResponseFolderDTO {
  nome: string;
  usuario_id: number;
  isPublic: boolean;
}

export interface UpdateFolderDTO extends Partial<CreateFolderDTO> {}
