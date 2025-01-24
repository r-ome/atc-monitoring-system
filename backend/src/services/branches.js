import { query } from "./index.js";
import { logDBError } from "../logger.js";

export const getBranchByName = async (name) => {
  try {
    return await query(
      `
      SELECT
        branch_id,
        name,
        DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at,
        DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS updated_at
        FROM branches
      WHERE name = ?
    `,
      [name]
    );
  } catch (error) {
    logDBError("getBranchByName", error);
    throw { message: "DB Error" };
  }
};

export const getBranch = async (branch_id) => {
  try {
    return await query(
      `
      SELECT
        branch_id,
        name,
        DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at,
        DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS updated_at
      FROM branches
      WHERE branch_id = ?
    `,
      [branch_id]
    );
  } catch (error) {
    logDBError("getBranch", error);
    throw { message: "DB Error" };
  }
};

export const getBranches = async () => {
  try {
    return await query(`
      SELECT
        branch_id,
        name,
        DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at,
        DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS updated_at
      FROM branches
      WHERE deleted_at IS NULL
    `);
  } catch (error) {
    logDBError("getBranches", error);
    throw { message: "DB Error" };
  }
};

export const createBranch = async ({ name }) => {
  try {
    return await query(`INSERT INTO branches(name) VALUES (?);`, [name]);
  } catch (error) {
    logDBError("createBranch", error);
    throw { message: "DB Error" };
  }
};

export const updateBranch = async (id, branch) => {
  try {
    return await query(
      `UPDATE branches SET name = ? WHERE branch_id = ? AND deleted_at IS NULL; `,
      [branch.name, id]
    );
  } catch (error) {
    logDBError("updateBranch", error);
    throw { message: "DB Error" };
  }
};

export const deleteBranch = async (id) => {
  return await query(
    `
        UPDATE branches
        SET deleted_at = NOW()
        WHERE branch_id = ? AND deleted_at IS NULL;
      `,
    [id]
  );
};
