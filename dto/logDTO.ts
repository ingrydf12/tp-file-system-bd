export interface CreateLogHistoryDTO {
  action: string;
  data_hora: Date;
  usuario_id: number | null;
}

export interface ResponseLogHistory {
  action: string;
  data_hora: Date;
  usuario_nome: string;
}
