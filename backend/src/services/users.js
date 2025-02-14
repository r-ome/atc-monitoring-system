import { query, DBErrorException } from "./index.js";

export const getUsers = async () => {
  try {
    return await query(`
          SELECT
            user_id,
            name,
            username,
            DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at
          FROM users
          WHERE deleted_at IS NULL;
      `);
  } catch (error) {
    throw new DBErrorException("getUsers", error);
  }
};

export const getUser = async (user_id) => {
  try {
    const [result] = await query(
      `SELECT user_id, name, username, role FROM users WHERE user_id = ?`,
      [user_id]
    );
    return result;
  } catch (error) {
    throw new DBErrorException("getUser", error);
  }
};

export const getUserByUsername = async (username) => {
  try {
    const [user] = await query(
      `
      SELECT user_id, name, username, role FROM users WHERE username = ?
      `,
      [username]
    );
  } catch (error) {
    throw new DBErrorException("getUserByUsername", error);
  }
};

export const createUser = async (user) => {
  try {
    const [result] = await query(
      `
      INSERT INTO users (name, username, password, role)
      VALUES (?, ?, ?, ?);
    `,
      [user.name, user.username, user.password, user.role]
    );
    return result;
  } catch (error) {
    throw new DBErrorException("createUser", error);
  }
};
