import { query, DBErrorException } from "./index.js";
import { logger } from "../logger.js";

export const getContainerInventories = async (container_id) => {
  try {
    const inventories = await query(
      `
        SELECT
          inventory_id,
          barcode,
          description,
          control_number,
          url,
          status,
          DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at,
          DATE_FORMAT(updated_at, '%b %d, %Y %h:%i%p') as updated_at
        FROM inventories
        WHERE container_id = ?;
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

export const getInventoryByBarcode = async (barcodes) => {
  try {
    await query(
      `CREATE TEMPORARY TABLE TEMP_INVENTORIES (barcode VARCHAR(255));`
    );

    const formattedBarcodes = barcodes.map((barcode) => [barcode]);
    await query(`INSERT INTO TEMP_INVENTORIES(barcode) VALUES ?`, [
      formattedBarcodes,
    ]);

    const inventories = await query(
      `
          SELECT
            i.inventory_id,
            i.control_number,
            i.barcode
          FROM inventories i
          JOIN TEMP_INVENTORIES temp
          ON i.barcode = temp.barcode
          WHERE i.status in ("UNSOLD", "REBID")
        `
    );

    await query(`DROP TEMPORARY TABLE IF EXISTS TEMP_INVENTORIES`);
    return inventories;
  } catch (error) {
    throw new DBErrorException("getInventoryByBarcode", error);
  }
};

export const checkDuplicateInventory = async (auction_id) => {
  try {
    const something = await query(
      `
        SELECT
          i.barcode AS BARCODE,
          i.control_number AS CONTROL,
          i.description AS DESCRIPTION,
          b.bidder_number AS BIDDER,
          ai.qty AS QTY,
          CONVERT(ai.price, CHAR) as PRICE
        FROM inventories i
        LEFT JOIN auctions_inventories ai ON ai.inventory_id = i.inventory_id
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = ai.auction_bidders_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE ab.auction_id = ?
      `,
      [auction_id]
    );
    return something;
  } catch (error) {
    throw new DBErrorException("checkDuplicateInventory", error);
  }
};

export const bulkCreateContainerInventory = async (inventories) => {
  try {
    const formattedInventories = inventories.map((item) => [
      item.container_id,
      item.DESCRIPTION,
      item.CONTROL,
      item.BARCODE,
      "SOLD",
      item.v4_identifier,
    ]);

    await query(
      `
        INSERT INTO inventories (container_id, description, control_number, barcode, status, v4_identifier)
        VALUES ?
      `,
      [formattedInventories]
    );

    let container_inventories = inventories
      .map((item) => ({ container_id: item.container_id, num_of_items: 0 }))
      .reduce((acc, { container_id }) => {
        acc[container_id] = (acc[container_id] || 0) + 1;
        return acc;
      }, {});

    container_inventories = Object.entries(container_inventories).map(
      ([container_id, count]) => [Number(container_id), count]
    );

    const update_cases = container_inventories
      .map(
        ([container_id, count]) =>
          `WHEN ${container_id} THEN num_of_items + ${count}`
      )
      .join(" ");

    const container_ids = container_inventories.map(
      ([container_id]) => container_id
    );
    await query(
      `
        UPDATE containers
        SET num_of_items = CASE container_id
        ${update_cases}
        END
        WHERE container_id in (${container_ids.join(", ")})
      `
    );

    const inventory_v4s = inventories.map((item) => item.v4_identifier);
    const inserted_inventories = await query(
      ` SELECT inventory_id, v4_identifier FROM inventories WHERE v4_identifier in (?)`,
      [inventory_v4s]
    );

    const formattedInventoriesFinal = inventories.map((item) => {
      const inventory = inserted_inventories.find(
        (temp) => temp.v4_identifier === item.v4_identifier
      );
      item.inventory_id = inventory.inventory_id;
      return item;
    });

    return formattedInventoriesFinal;
  } catch (error) {
    throw new DBErrorException("bulkCreateContainerInventory", error);
  }
};

export const bulkCreateAuctionInventories = async (auctions_inventories) => {
  try {
    const formatted_auctions_inventories = auctions_inventories.map((item) => [
      item.auction_bidders_id,
      item.inventory_id,
      "UNPAID",
      parseInt(item.PRICE),
      item.QTY,
      item.MANIFEST,
    ]);

    const inventory_ids = auctions_inventories.map((item) => item.inventory_id);
    // for updating balance in auctions_bidders
    let bidder_balance = auctions_inventories
      .map((item) => ({
        auction_bidders_id: item.auction_bidders_id,
        balance: parseInt(item.PRICE, 10),
      }))
      .reduce((acc, item) => {
        acc[item.auction_bidders_id] =
          (acc[item.auction_bidders_id] || 0) + parseInt(item.balance, 10);
        return acc;
      }, {});

    bidder_balance = Object.entries(bidder_balance).map(
      ([auction_bidders_id, price]) => [
        Number(auction_bidders_id),
        parseInt(price, 10),
      ]
    );

    const update_cases = bidder_balance
      .map(([auction_bidders_id, price]) => {
        return `WHEN ${auction_bidders_id} THEN balance + ((${price} * service_charge)/100) + ${price} `;
      })
      .join(" ");

    const auction_bidder_ids = bidder_balance.map(
      ([auction_bidders_id]) => auction_bidders_id
    );

    await query(
      `
        UPDATE auctions_bidders
        SET balance = CASE auction_bidders_id
        ${update_cases}
        END
        WHERE auction_bidders_id in (${auction_bidder_ids.join(", ")})
      `
    );

    await query(
      `UPDATE inventories SET status = "SOLD" WHERE inventory_id in (?)`,
      [inventory_ids]
    );

    await query(
      `
        INSERT INTO auctions_inventories (auction_bidders_id, inventory_id, status, price, qty, manifest_number)
        VALUES ?
      `,
      [formatted_auctions_inventories]
    );

    return;
  } catch (error) {
    throw new DBErrorException("bulkCreateAuctionInventories", error);
  }
};
