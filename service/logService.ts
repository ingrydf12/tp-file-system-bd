import { LogHistoryDAO } from "../dao/logDAO";
import { CreateLogHistoryDTO, ResponseLogHistory } from "../dto/logDTO";

const logHistoryDAO = new LogHistoryDAO();

export async function createLogHistory(
  usuarioId: number | null,
  action: string
): Promise<void> {
  if (!action || action.trim() === "") {
    throw new Error("A ação do log é obrigatória");
  }

  const dto: CreateLogHistoryDTO = {
    action,
    data_hora: new Date(),
    usuario_id: usuarioId,
  };

  await logHistoryDAO.create(dto);
}

export async function getLogHistory(): Promise<ResponseLogHistory[]> {
  return await logHistoryDAO.findAll();
}