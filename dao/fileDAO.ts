import { pool } from "../database/connection";
import { File } from "../model/file";

export class FileDAO {
  async create(file: File): Promise<File> {
    const query = `
      INSERT INTO arquivo (nome, tamanho, tipo, pasta_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const values = [file.nome, file.tamanho, file.tipo, file.pasta_id];

    const result = await pool.query(query, values);

    file.id = result.rows[0].id;
    return file;
  }

  async findByFolderId(folderId: number): Promise<File[]> {
    const query = `
      SELECT id, nome, tamanho, tipo, pasta_id
      FROM arquivo
      WHERE pasta_id = $1
    `;

    const result = await pool.query(query, [folderId]);

    return result.rows.map(
      (row) => new File(row.id, row.nome, row.tamanho, row.tipo, row.pasta_id)
    );
  }

  async findById(fileId: number): Promise<File | null> {
    const query = `
    SELECT id, nome, tamanho, tipo, pasta_id
    FROM arquivo
    WHERE id = $1
  `;

    const result = await pool.query(query, [fileId]);

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    return new File(row.id, row.nome, row.tamanho, row.tipo, row.pasta_id);
  }

  async update(file: File): Promise<File> {
    const query = `
    UPDATE arquivo
    SET
        nome = $1,
        tamanho = $2,
        tipo = $3
    WHERE id = $4
    RETURNING id, nome, tamanho, tipo, pasta_id
  `;

    const values = [file.nome, file.tamanho, file.tipo, file.id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Arquivo nao encontrado");
    }

    const row = result.rows[0];
    return new File(row.id, row.nome, row.tamanho, row.tipo, row.pasta_id);
  }

  async deleteFile(fileId: number): Promise<void> {
    const query = `
    DELETE FROM arquivo
    WHERE id = $1
  `;

    const result = await pool.query(query, [fileId]);

    if (result.rowCount === 0) {
      throw new Error("Arquivo não encontrado");
    }
  }
}
