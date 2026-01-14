import { pool } from "../database/connection";
import { File } from "../model/file";

export class FileDAO {
  async findByFolderId(folderId: number): Promise<File[]> {
    const query = `
      SELECT id, nome, tamanho, pasta_id
      FROM arquivo
      WHERE pasta_id = $1
    `;

    const result = await pool.query(query, [folderId]);

    return result.rows.map(
      row => new File(row.id, row.nome, row.tamanho, row.pasta_id)
    );
  }
}
