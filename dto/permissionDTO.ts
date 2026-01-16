export interface CreatePermissaoDTO {
  usuario_id: number;
  pasta_id: number;
  tipo: string;
}

export interface UpdatePermissaoDTO {
  tipo?: string;
}

export interface VerificarPermissaoDTO {
  usuario_id: number;
  pasta_id: number;
  tipo_requerido: string;
}

export interface ResponsePermissaoDTO {
  id: number;
  usuario_id: number;
  pasta_id: number;
  tipo: string;
}