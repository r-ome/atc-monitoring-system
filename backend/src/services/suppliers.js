import { query, DBErrorException } from "./index.js";

export const getSupplierByNameCode = async (name, code) => {
  try {
    return await query(
      `
          SELECT
            name,
            supplier_code,
            DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at,
            DATE_FORMAT(updated_at, '%b %d, %Y %h:%i%p') AS updated_at
          FROM suppliers
          WHERE name = ? OR supplier_code = ?
        `,
      [name, code]
    );
  } catch (error) {
    throw new DBErrorException("getSupplierByName", error);
  }
};

export const getSupplier = async (id) => {
  try {
    const [supplier] = await query(
      `
        SELECT
          supplier_id,
          name,
          supplier_code,
          num_of_containers,
          japanese_name,
          shipper,
          DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at,
          DATE_FORMAT(updated_at, '%b %d, %Y %h:%i%p') AS updated_at
        FROM suppliers
        WHERE supplier_id = ?`,
      [id]
    );
    return supplier;
  } catch (error) {
    throw new DBErrorException("getSupplier", error);
  }
};

export const getSuppliers = async () => {
  try {
    return await query(`
      SELECT
        s.supplier_id,
        s.name,
        s.supplier_code,
        COUNT(DISTINCT c.container_id) as total_containers,
        DATE_FORMAT(s.created_at, '%b %d, %Y %h:%i%p') AS created_at,
        DATE_FORMAT(s.updated_at, '%b %d, %Y %h:%i%p') AS updated_at
      FROM suppliers s
      LEFT JOIN containers c ON c.supplier_id = s.supplier_id
      WHERE s.deleted_at IS NULL
      GROUP BY s.supplier_id
    `);
  } catch (error) {
    throw new DBErrorException("getSuppliers", error);
  }
};

export const createSupplier = async (supplier) => {
  try {
    return await query(
      `
        INSERT INTO suppliers(name, supplier_code, japanese_name, num_of_containers, shipper)
        VALUES (?, ?, ? ,?, ?);`,
      [
        supplier.name,
        supplier.supplier_code,
        supplier.japanese_name,
        0,
        supplier.shipper,
      ]
    );
  } catch (error) {
    throw new DBErrorException("createSupplier", error);
  }
};

export const updateSupplier = async (id, supplier) => {
  try {
    return await query(
      `
        UPDATE suppliers
        SET ?
        WHERE supplier_id = ? AND deleted_at IS NULL;
        `,
      [supplier, id]
    );
  } catch (error) {
    throw new DBErrorException("updateSupplier", error);
  }
};

export const deleteSupplier = async (id) => {
  return await query(
    `
        UPDATE suppliers
        SET deleted_at = NOW()
        WHERE supplier_id = ? AND deleted_at IS NULL;
      `,
    [id]
  );
};
