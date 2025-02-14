import { query, DBErrorException } from "./index.js";

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
    throw new DBErrorException("getBranchByName", error);
  }
};

export const getBranch = async (branch_id) => {
  try {
    const [branch] = await query(
      `
      SELECT
        b.branch_id,
        b.name,
        DATE_FORMAT(b.created_at, '%b %d, %Y %h:%i%p') AS created_at,
        DATE_FORMAT(b.created_at, '%b %d, %Y %h:%i%p') AS updated_at,
        IF (COUNT(c.container_id) = 0,
          JSON_ARRAY(),
          JSON_ARRAYAGG(JSON_OBJECT(
            'container_id', c.container_id,
            'barcode', c.barcode,
            'container_num', c.container_num,
            'supplier', JSON_OBJECT(
                'id', s.supplier_id,
                'name', s.name,
                'supplier_code', s.supplier_code
            )
        ))) as containers
      FROM branches b
      LEFT JOIN containers c on c.branch_id = b.branch_id
      LEFT JOIN suppliers s on s.supplier_id = c.supplier_id
      WHERE b.branch_id = ?
      group by b.branch_id
    `,
      [branch_id]
    );
    return branch;
  } catch (error) {
    throw new DBErrorException("getBranch", error);
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
    throw new DBErrorException("getBranches", error);
  }
};

export const createBranch = async ({ name }) => {
  try {
    return await query(`INSERT INTO branches(name) VALUES (?);`, [name]);
  } catch (error) {
    throw new DBErrorException("createBranch", error);
  }
};

export const updateBranch = async (id, branch) => {
  try {
    return await query(
      `UPDATE branches SET name = ? WHERE branch_id = ? AND deleted_at IS NULL; `,
      [branch.name, id]
    );
  } catch (error) {
    throw new DBErrorException("updateBranch", error);
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
