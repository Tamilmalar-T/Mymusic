const { query } = require("../db");

class User {
  static formatUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      _id: row.id.toString(),
      name: row.name,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async findOne({ email }) {
    if (!email) return null;
    const res = await query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    return this.formatUser(res.rows[0]);
  }

  static async findById(id) {
    if (!id) return null;
    const res = await query(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    return this.formatUser(res.rows[0]);
  }

  static async create({ name, email, password }) {
    const res = await query(
      "INSERT INTO users (name, email, password) VALUES ($1, LOWER($2), $3) RETURNING *",
      [name, email, password]
    );
    return this.formatUser(res.rows[0]);
  }
}

module.exports = User;