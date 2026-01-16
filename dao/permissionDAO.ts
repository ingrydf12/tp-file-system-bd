import { pool } from "../database/connection";
import { Permissao, NivelPermissao } from "../model/permissao";

export class PermissaoDAO {
  async create(permissao: Permissao): Promise<Permissao> {
    const query = `
      INSERT INTO permissao (usuario_id, pasta_id, tipo)
      VALUES ($1, $2, $3)
      RETURNING id, usuario_id, pasta_id, tipo
    `;

    const values = [
      permissao.usuario_id,
      permissao.pasta_id,
      permissao.tipo,
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return new Permissao(
      row.id,
      row.usuario_id,
      row.pasta_id,
      row.tipo,
    );
  }

  async findById(permissaoId: number): Promise<Permissao | null> {
    const query = `
      SELECT id, usuario_id, pasta_id, tipo
      FROM permissao
      WHERE id = $1
    `;

    const result = await pool.query(query, [permissaoId]);

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    return new Permissao(
      row.id,
      row.usuario_id,
      row.pasta_id,
      row.tipo,
    );
  }

  async findByUserAndFolder(usuarioId: number, pastaId: number): Promise<Permissao | null> {
    const query = `
      SELECT id, usuario_id, pasta_id, tipo
      FROM permissao
      WHERE usuario_id = $1 AND pasta_id = $2
    `;

    const result = await pool.query(query, [usuarioId, pastaId]);

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    return new Permissao(
      row.id,
      row.usuario_id,
      row.pasta_id,
      row.tipo,
    );
  }

  async upsertPermissao(permissao: Permissao): Promise<Permissao> {
    const existing = await this.findByUserAndFolder(
      permissao.usuario_id,
      permissao.pasta_id
    );

    if (existing) {
      return await this.update(existing.id, permissao.tipo);
    } else {
      return await this.create(permissao);
    }
  }

  async update(permissaoId: number, novoTipo: NivelPermissao): Promise<Permissao> {
    const query = `
      UPDATE permissao
      SET tipo = $1
      WHERE id = $2
      RETURNING id, usuario_id, pasta_id, tipo
    `;

    const result = await pool.query(query, [novoTipo, permissaoId]);

    if (result.rowCount === 0) {
      throw new Error("Permissão não encontrada");
    }

    const row = result.rows[0];
    return new Permissao(
      row.id,
      row.usuario_id,
      row.pasta_id,
      row.tipo,
    );
  }

  async delete(permissaoId: number): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM permissao WHERE id = $1",
      [permissaoId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  async deleteByUserAndFolder(usuarioId: number, pastaId: number): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM permissao WHERE usuario_id = $1 AND pasta_id = $2",
      [usuarioId, pastaId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  async findByUser(usuarioId: number): Promise<Permissao[]> {
    const query = `
      SELECT id, usuario_id, pasta_id, tipo
      FROM permissao
      WHERE usuario_id = $1
      ORDER BY pasta_id
    `;

    const result = await pool.query(query, [usuarioId]);

    return result.rows.map(row => 
      new Permissao(
        row.id,
        row.usuario_id,
        row.pasta_id,
        row.tipo,
      )
    );
  }

  async findByFolder(pastaId: number): Promise<Permissao[]> {
    const query = `
      SELECT id, usuario_id, pasta_id, tipo
      FROM permissao
      WHERE pasta_id = $1
      ORDER BY usuario_id
    `;

    const result = await pool.query(query, [pastaId]);

    return result.rows.map(row => 
      new Permissao(
        row.id,
        row.usuario_id,
        row.pasta_id,
        row.tipo,
      )
    );
  }

  async hasAccess(usuarioId: number, pastaId: number): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM permissao
      WHERE usuario_id = $1 AND pasta_id = $2
    `;

    const result = await pool.query(query, [usuarioId, pastaId]);
    return parseInt(result.rows[0].count) > 0;
  }

  async checkPermissionLevel(
    usuarioId: number, 
    pastaId: number, 
    nivelRequerido: NivelPermissao
  ): Promise<boolean> {
    const query = `
      SELECT tipo
      FROM permissao
      WHERE usuario_id = $1 AND pasta_id = $2
    `;

    const result = await pool.query(query, [usuarioId, pastaId]);

    if (result.rowCount === 0) {
      return false;
    }

    const tipoAtual = result.rows[0].tipo as NivelPermissao;
    
    const hierarquia = {
      [NivelPermissao.LEITURA]: 1,
      [NivelPermissao.ESCRITA]: 2,
      [NivelPermissao.ADMIN]: 3
    };

    return hierarquia[tipoAtual] >= hierarquia[nivelRequerido];
  }
}