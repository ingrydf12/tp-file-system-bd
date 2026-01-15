import { pool } from "../database/connection";
import { CreateLogHistoryDTO, ResponseLogHistory } from "../dto/logDTO";

export class LogHistoryDAO {
  async create(dto: CreateLogHistoryDTO): Promise<void> {
    const query = `
      INSERT INTO log_acao (acao, data_hora, usuario_id)
      VALUES ($1, $2, $3)
    `;

    const values = [dto.action, dto.data_hora, dto.usuario_id];

    await pool.query(query, values);
  }

  async findAll(): Promise<ResponseLogHistory[]> {
    const query = `
      SELECT
        l.acao       AS action,
        l.data_hora,
        u.nome       AS usuario_nome
      FROM log_acao l
      LEFT JOIN usuario u ON u.id = l.usuario_id
      ORDER BY l.data_hora DESC
    `;

    const result = await pool.query(query);

    return result.rows;
  }
}