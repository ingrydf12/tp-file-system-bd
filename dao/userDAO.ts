import { pool } from "../database/connection";
import { User } from "../model/user";

export class UserDAO {
  // [DOCS] Salvar o usuário no banco
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

  // [Docs] Trazer todos os usuários cadastrados
  async findAll(): Promise<User[]> {
    const query = `SELECT id, nome, login, senha FROM usuario`;
    const result = await pool.query(query);

    return result.rows.map(
      (row) => new User(row.id, row.nome, row.login, row.senha)
    );
  }
}
