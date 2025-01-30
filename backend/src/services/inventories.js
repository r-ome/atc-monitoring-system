import { query, DBErrorException } from "./index.js";
import { logger } from "../logger.js";

export const getContainerInventories = async (container_id) => {
  try {
    const [inventories] = await query(
      `
        SELECT
          c.container_id,
          c.barcode,
          JSON_OBJECT(
            'supplier_id', s.supplier_id,
            'name', s.name
          ) AS supplier,
          IF(COUNT(i.inventory_id) = 0,
            JSON_ARRAY(),
            JSON_ARRAYAGG(JSON_OBJECT(
              'inventory_id', i.inventory_id,
              'barcode', i.barcode,
              'description', i.description,
              'control_number', i.control_number,
              'url', i.url,
              'status', i.status,
              'created_at', DATE_FORMAT(i.created_at, '%b %d, %Y %h:%i%p'),
              'updated_at', DATE_FORMAT(i.updated_at, '%b %d, %Y %h:%i%p')
            ))
          ) as inventories
        FROM containers c
        LEFT JOIN inventories i ON c.container_id = i.container_id
        LEFT JOIN suppliers s ON s.supplier_id = c.supplier_id
        WHERE c.container_id = ? AND c.deleted_at IS NULL AND i.deleted_at IS NULL
        GROUP BY c.container_id
      `,
      [container_id]
    );

    return inventories;
  } catch (error) {
    throw new DBErrorException("getContainerInventories", error);
  }
};

export const createContainerInventory = async (container_id, inventory) => {
  try {
    const inventoryResult = await query(
      `
        INSERT INTO inventories(container_id, barcode, description, control_number, url)
        VALUES (?, ?, ?, ?, ?);
        `,
      [
        container_id,
        inventory.barcode,
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

      const [inventory] = await query(
        `
          SELECT
            inventory_id,
            container_id,
            barcode,
            description,
            control_number,
            url,
            status,
            DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at,
            DATE_FORMAT(updated_at, '%b %d, %Y %h:%i%p') AS updated_at
          FROM inventories
          WHERE inventory_id = ?
        `,
        [inventoryResult.insertId]
      );

      return inventory;
    }
  } catch (error) {
    throw new DBErrorException("createContainerInventory", error);
  }
};

export const updateContainerInventory = async (
  container_id,
  inventory_id,
  inventory
) => {
  return await query(
    `
      UPDATE inventories
      SET ?
      WHERE container_id = ? AND inventory_id = ? AND deleted_at IS NULL;
      `,
    [inventory, inventory_id, container_id]
  );
};

export const deleteInventory = async (id) => {
  return await query(
    `
        UPDATE inventories
        SET deleted_at = NOW()
        WHERE inventory_id = ? AND deleted_at IS NULL;
      `,
    [id]
  );
};

export const getInventoryByBarcodeAndControl = async (val) => {
  try {
    await query(
      `CREATE TEMPORARY TABLE TEMP_INVENTORIES (barcode VARCHAR(255), control_number VARCHAR(255));`
    );

    await query(
      `INSERT INTO TEMP_INVENTORIES(barcode, control_number) VALUES ?`,
      [val]
    );

    const inventories = await query(
      `
          SELECT
            i.inventory_id,
            i.control_number,
            i.barcode
          FROM inventories i
          JOIN TEMP_INVENTORIES temp
          ON i.barcode = temp.barcode
          AND i.control_number = temp.control_number
        `
    );

    await query(`DROP TEMPORARY TABLE IF EXISTS TEMP_INVENTORIES`);

    return inventories;
  } catch (error) {
    logger.error({ func: "getInventoryByBarcodeAndControl", error });
    throw { message: "DB error" };
  }
};

export const addInventoryFromEncoding = async (inventories) => {
  try {
    await query(
      `
          INSERT INTO inventories(container_id, barcode, control_number, description, price,qty, status)
          VALUES ?
        `,
      [inventories]
    );

    const inventory_barcode_control_number = inventories.map((item) => [
      item[1], // barcode
      item[2], // control_number
    ]);

    const inventory_ids = await query(
      `
        SELECT inventory_id, barcode, control_number
        FROM inventories
        WHERE (barcode, control_number) in (?)
      `,
      [inventory_barcode_control_number]
    );

    return inventory_ids;
  } catch (error) {
    logger.error({ func: "addInventoryFromEncoding", error });
    throw { message: "DB error" };
  }
};

export const addAuctionInventoriesFromEncoding = async (
  auction_inventories
) => {
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
};
