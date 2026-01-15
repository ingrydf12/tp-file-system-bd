import { pool } from "../database/connection";
import { ResponseUserDTO, UpdateUserDTO } from "../dto/userDTO";
import { User } from "../model/user";

export class UserDAO {
  // INSERT
  async create(user: User): Promise<User> {
    const query = `
      INSERT INTO usuario (nome, login, senha)
      VALUES ($1, $2, $3)
      RETURNING id, nome, login
    `;

    const values = [user.nome, user.login, user.senha];

    const result = await pool.query(query, values);

    return new User(
      result.rows[0].id,
      result.rows[0].nome,
      result.rows[0].login,
      ""
    );
  }

  // SELECT
  async findAll(): Promise<User[]> {
    const query = `SELECT id, nome, login, senha FROM usuario`;
    const result = await pool.query(query);

    return result.rows.map(
      (row) => new User(row.id, row.nome, row.login, row.senha)
    );
  }

  async findById(userId: number): Promise<ResponseUserDTO | null> {
    const query = `
    SELECT id, nome, login
    FROM usuario
    WHERE id = $1
  `;

    const result = await pool.query(query, [userId]);

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      id: row.id,
      nome: row.nome,
      login: row.login,
    };
  }

  async findByLogin(login: string): Promise<User | null> {
    const query = `
    SELECT id, nome, login, senha
    FROM usuario
    WHERE login = $1
  `;

    const result = await pool.query(query, [login]);

    if ((result.rowCount ?? 0) === 0) {
      return null;
    }

    const row = result.rows[0];

    return new User(row.id, row.nome, row.login, row.senha);
  }

  async findUser(userId: number): Promise<User | null> {
    const query = `
    SELECT id, nome, login, senha
    FROM usuario
    WHERE id = $1
  `;
    const result = await pool.query(query, [userId]);
    if (result.rowCount === 0) return null;

    const row = result.rows[0];
    return new User(row.id, row.nome, row.login, row.senha);
  }

  // UPDATE
  async updateUser(user: User): Promise<User> {
    const query = `
      UPDATE usuario
      SET nome = $1,
          login = $2,
          senha = $3
      WHERE id = $4
      RETURNING id, nome, login, senha
    `;
    const values = [user.nome, user.login, user.senha, user.id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Falha ao atualizar usuário");
    }

    const row = result.rows[0];
    return new User(row.id, row.nome, row.login, row.senha);
  }

  // DELETE
  async deleteUser(userId: number): Promise<boolean> {
    const query = `
    DELETE FROM usuario
    WHERE id = $1
  `;

    const result = await pool.query(query, [userId]);

    return (result.rowCount ?? 0) > 0;
  }
}
