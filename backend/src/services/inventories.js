import { query, DBErrorException } from "./index.js";
import { AUCTION_STATUS, INVENTORY_STATUS } from "../Routes/constants.js";

export const getInventory = async (inventory_id) => {
  try {
    const [inventory] = await query(
      `
        SELECT
          JSON_OBJECT(
            'inventory_id', i.inventory_id,
            'barcode', i.barcode,
            'control', i.control,
            'description', i.description,
            'status', i.status,
            'created_at', i.created_at,
            'updated_at', i.updated_at
          ) AS inventory,
          JSON_OBJECT(
            'auction_inventory_id', ai.auction_inventory_id,
            'auction_id', ab.auction_id,
            'price', ai.price,
            'qty', ai.qty,
            'status', ai.status,
            'manifest_number', ai.manifest_number,
            'created_at', ai.created_at,
            'updated_at', ai.updated_at,
            'payment_id', ai.payment_id,
            'bidder', JSON_OBJECT(
              'service_charge', ab.service_charge,
              'bidder_id', ab.bidder_id,
              'full_name', CONCAT(b.first_name, " ", b.last_name),
              'bidder_number', b.bidder_number
            )
          ) AS auction_inventory,
          (
            SELECT
              IF (COUNT(ih.inventory_history_id) = 0,
                JSON_ARRAY(),
                JSON_ARRAYAGG(JSON_OBJECT(
                  'inventory_history_id', ih.inventory_history_id,
                  'payment_id', ih.payment_id,
                  'status', ih.auction_status,
                  'remarks', ih.remarks,
                  'created_at', ih.created_at
                )))
            FROM inventory_histories ih
            WHERE ih.auction_inventory_id = ai.auction_inventory_id
          ) as histories
        FROM inventories i
        LEFT JOIN auctions_inventories ai ON ai.inventory_id = i.inventory_id
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = ai.auction_bidders_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE i.inventory_id = ?
        GROUP BY ai.auction_inventory_id
      `,
      [inventory_id]
    );

    return inventory;
  } catch (error) {
    console.log(error);
    throw new DBErrorException("getInventory", error);
  }
};

export const getContainerInventories = async (container_id) => {
  try {
    const inventories = await query(
      `
        SELECT
          i.inventory_id,
          i.barcode,
          i.description,
          i.control,
          ai.price,
          i.status,
          i.created_at,
          i.updated_at
        FROM inventories i
        LEFT JOIN auctions_inventories ai ON ai.inventory_id = i.inventory_id
        WHERE container_id = ?
        ORDER BY barcode;
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
        INSERT INTO inventories(container_id, barcode, description, control, url)
        VALUES (?, ?, ?, ?, ?);
        `,
      [
        container_id,
        inventory.barcode,
        inventory.description,
        inventory.control,
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
            control,
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

export const updateContainerInventory = async (inventory_id, inventory) => {
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
            i.control,
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
    const duplicates = await query(
      `
        SELECT
          i.barcode AS BARCODE,
          i.control AS CONTROL,
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
    return duplicates;
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
        INSERT INTO inventories (container_id, description, control, barcode, status, v4_identifier)
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
      ([container_id, count]) => [parseInt(container_id, 10), count]
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
      AUCTION_STATUS.UNPAID,
      parseInt(item.PRICE, 10),
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
      `UPDATE inventories SET status = "${INVENTORY_STATUS.SOLD}" WHERE inventory_id in (?)`,
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
