import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export const query = (query, params) => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

export const DB_ERROR_EXCEPTION = Symbol("DB_ERROR_SYMBOL");
export class DBErrorException extends Error {
  constructor(func_name, message) {
    super(`${func_name}:${message}`);
    this.name = "DBErrorException";
    this.func_name = func_name;
    this[DB_ERROR_EXCEPTION] = true;
  }
}
