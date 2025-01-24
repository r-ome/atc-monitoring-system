import { query } from "./index.js";
import { logger } from "../logger.js";

export default {
  getContainerInventories: async (container_id) => {
    return await query(
      "SELECT * FROM inventories WHERE deleted_at IS NULL AND container_id = ?",
      [container_id]
    );
  },

  createContainerInventory: async (container_id, inventory) => {
    try {
      // const doesExists = await query(
      //   `
      //   SELECT 1
      //   FROM inventories
      //   WHERE container_id = ? AND barcode_number = ? AND control_number = ?
      // `,
      //   [container_id, inventory.barcode_number, inventory.control_number]
      // );

      const inventoryResult = await query(
        `
        INSERT INTO inventories(container_id, barcode_number, description, control_number, url)
        VALUES (?, ?, ?, ?, ?);
        `,
        [
          container_id,
          inventory.barcode_number,
          inventory.description,
          inventory.control_number,
          inventory.url,
        ]
      );

      // update container num_of_items
      if (inventoryResult.insertId) {
        await query(
          `
            UPDATE containers SET num_of_items = num_of_items + 1
            WHERE container_id = ?
          `,
          [container_id]
        );

        return {
          inventory_id: inventoryResult.insertId,
          ...inventory,
        };
      }
    } catch (error) {
      logger.error({ func: "createContainerInventory", error });
      throw { message: "DB error" };
    }
  },

  updateContainerInventory: async (container_id, inventory_id, inventory) => {
    return await query(
      `
      UPDATE inventories
      SET ?
      WHERE container_id = ? AND inventory_id = ? AND deleted_at IS NULL;
      `,
      [inventory, inventory_id, container_id]
    );
  },

  deleteInventory: async (id) => {
    return await query(
      `
        UPDATE inventories
        SET deleted_at = NOW()
        WHERE inventory_id = ? AND deleted_at IS NULL;
      `,
      [id]
    );
  },

  getInventoryByBarcodeAndControl: async (val) => {
    try {
      await query(
        `CREATE TEMPORARY TABLE TEMP_INVENTORIES (barcode_number VARCHAR(255), control_number VARCHAR(255));`
      );

      await query(
        `INSERT INTO TEMP_INVENTORIES(barcode_number, control_number) VALUES ?`,
        [val]
      );

      const inventories = await query(
        `
          SELECT
            i.inventory_id,
            i.control_number,
            i.barcode_number
          FROM inventories i
          JOIN TEMP_INVENTORIES temp
          ON i.barcode_number = temp.barcode_number
          AND i.control_number = temp.control_number
        `
      );

      await query(`DROP TEMPORARY TABLE IF EXISTS TEMP_INVENTORIES`);

      return inventories;
    } catch (error) {
      logger.error({ func: "getInventoryByBarcodeAndControl", error });
      throw { message: "DB error" };
    }
  },

  addInventoryFromEncoding: async (inventories) => {
    try {
      await query(
        `
          INSERT INTO inventories(container_id, barcode_number, control_number, description, price,qty, status)
          VALUES ?
        `,
        [inventories]
      );

      const inventory_barcode_control_number = inventories.map((item) => [
        item[1], // barcode_number
        item[2], // control_number
      ]);

      const inventory_ids = await query(
        `
        SELECT inventory_id, barcode_number, control_number
        FROM inventories
        WHERE (barcode_number, control_number) in (?)
      `,
        [inventory_barcode_control_number]
      );

      return inventory_ids;
    } catch (error) {
      logger.error({ func: "addInventoryFromEncoding", error });
      throw { message: "DB error" };
    }
  },

  addAuctionInventoriesFromEncoding: async (auction_inventories) => {
    try {
      console.log({ auction_inventories });
      const result = await query(
        `
        INSERT INTO auctions_inventories (auction_id, inventory_id, bidder_id, status, manifest_number)
        VALUES ?
        ON DUPLICATE KEY UPDATE inventory_id = VALUES(inventory_id);
      `,
        [auction_inventories]
      );

      auction_inventories = auction_inventories.map((item) =>
        item.map((el) => {
          item[2] = "AUCTION";
          item[4] = "SOLD";
          return el;
        })
      );

      await query(
        `
          INSERT INTO inventory_histories(auction_id, inventory_id, uploaded_from, item_status, auction_status)
          VALUES ?
        `,
        [auction_inventories]
      );
      return result;
    } catch (error) {
      logger.error({ func: "addAuctionInventoriesFromEncoding", error });
      throw { message: "DB error" };
    }
  },
};
