import { query, DBErrorException } from "./index.js";

export const createSuperAdmin = async (password) => {
  try {
    const [superadmin] = await query(
      `SELECT username FROM users WHERE username = "SUPERADMIN";`
    );

    if (superadmin) {
      return false;
    } else {
      await query(
        `
          INSERT INTO users(name, username, password, role)
          VALUES ("SUPERADMIN", "SUPERADMIN", ?, "SUPER_ADMIN")
        `,
        [password]
      );
      return true;
    }
  } catch (error) {
    throw new DBErrorException("createSuperAdmin", error);
  }
};

export const getUsers = async () => {
  try {
    return await query(`
          SELECT
            user_id,
            name,
            username,
            role,
            created_at,
            updated_at
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
      SELECT user_id, name, password, username, role FROM users WHERE username = ?
      `,
      [username]
    );

    return user;
  } catch (error) {
    throw new DBErrorException("getUserByUsername", error);
  }
};

export const registerUser = async (name, username, password, role) => {
  try {
    const result = await query(
      `
        INSERT INTO users(name, username, password, role)
        VALUES (?, ?, ?, ?);
      `,
      [name, username, password, role]
    );

    return getUser(result.insertId);
  } catch (error) {
    console.log(error);
    throw new DBErrorException("registerUser", error);
  }
};

export const updateUserPassword = async (user_id, new_password) => {
  try {
    await query(
      `
        UPDATE users
        SET password = ?
        WHERE user_id = ?;
      `,
      [new_password, user_id]
    );

    return await getUser(user_id);
  } catch (error) {
    console.log(error);
    throw new DBErrorException("updateUserPassword", error);
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
