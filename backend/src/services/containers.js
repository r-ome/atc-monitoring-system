const { query } = require("./");
const { logger } = require("../logger");
const { formatNumberPadding } = require("../utils");

module.exports = {
  getContainerIdByBarcode: async (barcode) => {
    try {
      const result = await query(
        `
        SELECT container_id, barcode
        FROM containers
        WHERE barcode = ?
      `,
        [barcode]
      );

      return result;
    } catch (error) {
      logger.error({ func: "getContainers", error });
      throw { message: "DB error" };
    }
  },

  getBarcodesFromContainers: async () => {
    try {
      const result = await query(`SELECT barcode FROM containers;`);
      return result;
    } catch (error) {
      logger.error({ func: "getBarcodesFromContainers", error });
      throw { message: "DB error" };
    }
  },

  getContainer: async (id) => {
    try {
      const result = await query(
        `
          SELECT c.*
          FROM containers c
          WHERE c.container_id = ?;
        `,
        [id]
      );
      return result;
    } catch (error) {
      logger.error({ func: "getContainer", error });
      throw { message: "DB error" };
    }
  },

  getContainers: async () => {
    try {
      return await query(`
        SELECT
          c.*,
          s.name
        FROM containers c
        LEFT JOIN suppliers s on s.supplier_id = c.supplier_id
        WHERE c.deleted_at IS NULL
      `);
    } catch (error) {
      logger.error({ func: "getContainers", error });
      throw { message: "DB error" };
    }
  },

  getContainersBySupplier: async (supplier_id) => {
    try {
      return await query(
        `
        SELECT
          c.*,
          s.name
        FROM containers c
        LEFT JOIN suppliers s ON s.supplier_id = c.supplier_id
        WHERE c.supplier_id = ? AND c.deleted_at IS NULL
      `,
        [supplier_id]
      );
    } catch (error) {
      logger.error({ func: "getContainersBySupplier", error });
      throw { message: "DB error" };
    }
  },

  createContainer: async (supplier_id, container) => {
    try {
      const [{ supplier_code, supplier_name }] = await query(
        `
          SELECT supplier_code, name as supplier_name FROM suppliers WHERE supplier_id = ?
      `,
        [supplier_id]
      );

      const result = await query(
        `
        INSERT INTO containers(
          supplier_id,
          barcode,
          container_num,
          departure_date_from_japan,
          bill_of_lading_number,
          port_of_landing,
          eta_to_ph,
          carrier,
          arrival_date_warehouse_ph,
          sorting_date,
          auction_date,
          payment_date,
          telegraphic_transferred,
          vessel,
          invoice_num,
          gross_weight,
          vanning_date,
          devanning_date,
          auction_or_sell,
          branch_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          supplier_id,
          `${supplier_code}-${formatNumberPadding(container.container_num)}`,
          container.container_num,
          container.departure_date_from_japan,
          container.bill_of_lading_number,
          container.port_of_landing,
          container.eta_to_ph,
          container.carrier,
          container.arrival_date_warehouse_ph,
          container.sorting_date,
          container.auction_date,
          container.payment_date,
          container.telegraphic_transferred,
          container.vessel,
          container.invoice_num,
          container.gross_weight,
          container.vanning_date,
          container.delivery_place,
          container.auction_or_sell,
          container.branch_id,
        ]
      );

      await query(
        `UPDATE suppliers SET num_of_containers = num_of_containers +1 WHERE supplier_id = ?`,
        [supplier_id]
      );

      if (result.insertId) {
        return {
          ...container,
          name: supplier_name,
          supplier_code,
          barcode: `${supplier_code}-${formatNumberPadding(
            container.container_num
          )}`,
          container_id: result.insertId,
        };
      }
    } catch (error) {
      logger.error({ func: "createContainer", error });
      throw { message: "DB error" };
    }
  },

  updateContainer: async (id, container) => {
    try {
      const result = await query(
        `
        UPDATE containers
        SET ?
        WHERE container_id = ? AND deleted_at IS NULL;
        `,
        [container, id]
      );
      const updatedContainer = await query(
        `SELECT * FROM containers c WHERE container_id = ?`,
        [id]
      );

      if (result.affectedRows) {
        return updatedContainer[0];
      }
    } catch (error) {
      logger.error({ func: "updateContainer", error });
      throw { message: "DB error" };
    }
  },

  deleteContainer: async (id) => {
    try {
      const result = await query(
        `
          UPDATE containers
          SET deleted_at = NOW()
          WHERE container_id = ? AND deleted_at IS NULL;
        `,
        [id]
      );

      if (result.affectedRows) {
        return { container_id: id };
      }
    } catch (error) {
      logger.error({ func: "deleteContainer", error });
      throw { message: "DB error" };
    }
  },
};
