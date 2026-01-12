import { pool } from "../database/connection";
import { Folder } from "../model/folder";

export class FolderDAO {
  async create(folder: Folder): Promise<Folder> {
    const query = `
      INSERT INTO folder (nome, data_criacao, is_public, usuario_id, pinHash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const values = [
      folder.nome,
      folder.data_criacao,
      folder.isPublic,
      folder.usuario_id,
      folder.pin ?? null,
    ];

    const result = await pool.query(query, values);

    folder.id = result.rows[0].id;
    return folder;
  }

  async findById(folderId: number): Promise<Folder | null> {
    const query = `
    SELECT id, nome, data_criacao, is_public, usuario_id
    FROM folder
    WHERE id = $1
  `;

    const result = await pool.query(query, [folderId]);

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];

    return new Folder(
      row.id,
      row.nome,
      row.data_criacao,
      row.is_public,
      row.usuario_id
    );
  }

  async findAll(): Promise<Folder[] | null> {
    const query = `SELECT id, usuario_id, nome, data_criacao, isPublic FROM folder`;
    const result = await pool.query(query);

    return result.rows.map(
      (row) =>
        new Folder(
          row.id,
          row.usuario_id,
          row.nome,
          row.data_criacao,
          row.isPublic
        )
    );
  }

  async updateFolder(folder: Folder): Promise<Folder> {
    const query = `
      UPDATE folder
      SET
        nome = $1,
        isPublic = $2,
        pin = $3
      WHERE id = $4
      RETURNING id, nome, data_criacao, isPublic, usuario_id, pin
    `;

    const values = [
      folder.nome,
      folder.isPublic,
      folder.pin ?? null,
      folder.id,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Pasta não encontrada");
    }

    const row = result.rows[0];

    return new Folder(
      row.id,
      row.nome,
      row.data_criacao,
      row.isPublic,
      row.usuario_id,
      row.pin ?? undefined
    );
  }
}