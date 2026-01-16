import { pool } from "../database/connection";
import { Folder } from "../model/folder";

export class FolderDAO {
  async create(folder: Folder): Promise<Folder> {
    const query = `
      INSERT INTO pasta (nome, data_criacao, is_public, pin, usuario_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const values = [
      folder.nome,
      folder.data_criacao,
      folder.isPublic,
      folder.pin ?? null,
      folder.usuario_id,
    ];

    const result = await pool.query(query, values);

    folder.id = result.rows[0].id;
    return folder;
  }

  async findById(folderId: number): Promise<Folder | null> {
    const query = `
    SELECT id, nome, data_criacao, is_public, usuario_id
    FROM pasta
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

  async findByUser(usuarioId: number): Promise<Folder[]> {
    const result = await pool.query(
      "SELECT id, nome, is_public FROM pasta WHERE usuario_id = $1",
      [usuarioId]
    );

    return result.rows.map(
      (row) =>
        new Folder(
          row.id,
          row.nome,
          row.data_criacao,
          row.is_public,
          row.usuario_id
        )
    );
  }

  async findAll(): Promise<Folder[]> {
    const query = `
    SELECT id, nome, data_criacao, is_public, usuario_id, pin
    FROM pasta
  `;

    const result = await pool.query(query);

    return result.rows.map(
      (row) =>
        new Folder(
          row.id,
          row.nome,
          row.data_criacao,
          row.is_public,
          row.usuario_id,
          row.pin ?? undefined
        )
    );
  }

  async updateFolder(folder: Folder): Promise<Folder> {
    const query = `
      UPDATE pasta
      SET
        nome = $1,
        is_public = $2,
        pin = $3
      WHERE id = $4
      RETURNING id, nome, data_criacao, is_public, usuario_id, pin
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
      row.is_public,
      row.usuario_id,
      row.pin ?? undefined
    );
  }

  async deleteFolder(folderId: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM pasta WHERE id = $1", [
      folderId,
    ]);

    return (result.rowCount ?? 0) > 0;
  }
}
