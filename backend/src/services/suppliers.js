const { query } = require("./");
const { logger } = require("../logger");

module.exports = {
  getSupplier: async (supplier_id) => {
    return await query("SELECT * FROM suppliers WHERE supplier_id = ?", [
      supplier_id,
    ]);
  },

  getSuppliers: async () => {
    return await query("SELECT * FROM suppliers WHERE deleted_at IS NULL");
  },

  createSupplier: async (supplier) => {
    try {
      return await query(
        `
        INSERT INTO suppliers(name, supplier_code, japanese_name, num_of_containers, shipper)
        VALUES (?, ?, ? ,?, ?);`,
        [
          supplier.name,
          supplier.supplier_code,
          supplier.japanese_name,
          supplier.num_of_containers,
          supplier.shipper,
        ]
      );
    } catch (error) {
      logger.error({ func: "createSupplier", error });
      throw { message: "DB error" };
    }
  },

  updateSupplier: async (id, supplier) => {
    return await query(
      `
      UPDATE suppliers
      SET ?
      WHERE supplier_id = ? AND deleted_at IS NULL;
      `,
      [supplier, id]
    );
  },

  deleteSupplier: async (id) => {
    return await query(
      `
        UPDATE suppliers
        SET deleted_at = NOW()
        WHERE supplier_id = ? AND deleted_at IS NULL;
      `,
      [id]
    );
  },
};
