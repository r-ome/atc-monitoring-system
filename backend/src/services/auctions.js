import { query } from "./index.js";
import { logger } from "../logger.js";

export default {
  getAuctionDetails: async (auction_id) => {
    try {
      return await query(
        `
        SELECT
          a.auction_id,
          a.created_at,
          sub.total_price,
          sub.total_items,
          sub.sold_items,
          sub.unsold_items,
          sub.paid_items,
          sub.unpaid_items,
          sub.cancelled_items,
          (
            SELECT COUNT(ab.auction_bidders_id) 
            FROM auctions_bidders ab 
            WHERE ab.auction_id = a.auction_id
          ) AS total_bidders
        FROM auctions a
        LEFT JOIN (
          SELECT 
            ai.auction_id,
            SUM(i.price) AS total_price,
            COUNT(i.inventory_id) AS total_items,
            SUM(CASE WHEN i.status = 'sold' THEN 1 ELSE 0 END) AS sold_items,
            SUM(CASE WHEN i.status = 'unsold' THEN 1 ELSE 0 END) AS unsold_items,
            SUM(CASE WHEN ai.status = 'paid' THEN 1 ELSE 0 END) AS paid_items,
            SUM(CASE WHEN ai.status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_items,
            SUM(CASE WHEN ai.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_items
          FROM inventories i
          LEFT JOIN auctions_inventories ai ON ai.inventory_id = i.inventory_id
          GROUP BY ai.auction_id
        ) AS sub ON sub.auction_id = a.auction_id
        WHERE a.auction_id = 1;
      `,
        [auction_id]
      );
    } catch (error) {
      logger.error({ func: "getBidderItems", error });
      throw { message: "DB error" };
    }
  },

  getAuctions: async () => {
    try {
      return await query(`
        SELECT
            a.auction_id,
            a.created_at,
            COUNT(DISTINCT ab.bidder_id) AS bidder_count,
            COUNT(DISTINCT ai.auction_inventory_id) AS item_count,
            (SELECT SUM(payment) FROM payments p WHERE purpose = "REGISTRATION" AND p.auction_id = a.auction_id) AS total_registration,
            SUM(i.price) as total_sales
        FROM auctions a
        LEFT JOIN auctions_bidders ab ON ab.auction_id = a.auction_id
        LEFT JOIN auctions_inventories ai ON ai.auction_id = a.auction_id
        LEFT JOIN inventories i ON i.inventory_id = ai.inventory_id
        WHERE a.deleted_at IS NULL
        GROUP BY a.auction_id;
        `);
    } catch (error) {
      logger.error({ func: "getAuctions", error });
      throw { message: "DB error" };
    }
  },

  createAuction: async (branch) => {
    try {
      const response = await query(
        `INSERT INTO auctions(created_at) VALUES (NOW());`
      );

      const auction = await query(
        `SELECT auction_id, created_at FROM auctions WHERE auction_id = ?`,
        [response.insertId]
      );
      return auction[0];
    } catch (error) {
      logger.error({ func: "createAuction", error });
      throw { message: "DB error" };
    }
  },

  deleteAuction: async (id) => {
    try {
      return await query(
        `
          UPDATE auctions
          SET deleted_at = NOW()
          WHERE auction_id = ? AND deleted_at IS NULL;
        `,
        [id]
      );
    } catch (error) {
      logger.error({ func: "deleteAuction", error });
      throw { message: "DB error" };
    }
  },

  registerBidderAtAuction: async (
    auction_id,
    { bidder_id, service_charge, registration_fee }
  ) => {
    try {
      await query(
        `
          INSERT INTO auctions_bidders(bidder_id, auction_id, service_charge, registration_fee)
          VALUES (?, ?, ?, ?);
        `,
        [bidder_id, auction_id, service_charge, registration_fee]
      );
      const bidders = await query(
        `
        SELECT
          b.bidder_id,
          b.bidder_number,
          b.first_name,
          b.last_name,
          ab.registration_fee,
          ab.service_charge
        FROM auctions_bidders ab
        RIGHT JOIN bidders b ON ab.bidder_id = b.bidder_id
        WHERE ab.bidder_id = ? AND ab.auction_id = ?
      `,
        [bidder_id, auction_id]
      );

      await query(
        `
        INSERT INTO payments(bidder_id, auction_id, purpose, balance, payment, payment_type)
        VALUES (?, ?, ?, ?, ?, ?);
        `,
        [
          bidder_id,
          auction_id,
          "REGISTRATION",
          registration_fee,
          registration_fee,
          "CASH",
        ]
      );
      return bidders.length ? bidders[0] : null;
    } catch (error) {
      logger.error({ func: "registerBidderAtAuction", error });
      throw { message: "DB error" };
    }
  },

  getMonitoring: async (auction_id) => {
    try {
      return await query(
        `
          SELECT
            ai.auction_id,
            i.inventory_id,
            i.barcode_number,
            i.control_number,
            i.description,
            i.qty,
            i.price,
            b.bidder_number,
            i.status AS item_status,
            ai.auction_inventory_id,
            ai.status,
            ai.manifest_number
          FROM inventories i
          LEFT JOIN auctions_inventories ai ON ai.inventory_id = i.inventory_id
          LEFT JOIN bidders b ON b.bidder_id = ai.bidder_id
          WHERE ai.auction_id = ?;
        `,
        [auction_id]
      );
    } catch (error) {
      logger.error({ func: "getMonitoring", error });
      throw { message: "DB error" };
    }
  },

  encodeInventoryOnAuction: async (auction_id, manifest) => {
    try {
      let auction_inventories = manifest
        .filter((item) => item.bidder_id && item.inventory_id)
        .map((item) => [item.bidder_id, item.inventory_id, auction_id]);
      await query(
        `
        INSERT INTO auctions_inventories(bidder_id, inventory_id, auction_id)
        VALUES ?
        `,
        [auction_inventories]
      );

      const inventories = manifest
        .filter((item) => item.bidder_id && item.inventory_id)
        .map((item) => [item.inventory_id, item.price, item.qty]);
      console.log({ inventories, auction_id });

      await query(
        `CREATE TEMPORARY TABLE TEMP_UPDATE_INVENTORIES (inventory_id BIGINT, price VARCHAR(255), qty VARCHAR(255))`
      );
      await query(
        `INSERT INTO TEMP_UPDATE_INVENTORIES(inventory_id, price, qty) VALUES ?`,
        [inventories]
      );

      await query(
        `
        UPDATE inventories i
        JOIN TEMP_UPDATE_INVENTORIES temp
        ON i.inventory_id = temp.inventory_id
        SET i.price = temp.price, i.qty = temp.qty
        `
      );

      await query(`DROP TEMPORARY TABLE TEMP_UPDATE_INVENTORIES;`);
    } catch (error) {
      logger.error({ func: "encodeInventoryOnAuction", error });
      throw { message: "DB error" };
    }
  },

  getRegisteredBidders: async (auction_id) => {
    try {
      return await query(
        `
          SELECT
            ab.bidder_id,
            b.bidder_number,
            b.first_name,
            b.middle_name,
            b.last_name,
            ab.registration_fee,
            ab.service_charge,
            COUNT(ai.inventory_id) AS num_of_items,
            SUM(i.price) AS total_price
          FROM auctions_bidders ab
          LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
          LEFT JOIN auctions_inventories ai ON ai.bidder_id = ab.bidder_id
          LEFT JOIN inventories i ON i.inventory_id = ai.inventory_id
          WHERE ab.auction_id = ?
          GROUP BY ab.bidder_id, b.bidder_number, b.first_name, b.middle_name, b.last_name, ab.registration_fee, ab.service_charge, ab.already_consumed;
        `,
        [auction_id]
      );
    } catch (error) {
      logger.error({ func: "getRegisteredBidders", error });
      throw { message: "DB error" };
    }
  },

  updateBidderPayment: async (auction_id, bidder_id, amount, item_ids) => {
    try {
      const [{ receipt_number }] = await query(
        `
          SELECT receipt_number
          FROM payments
          WHERE bidder_id = ? AND auction_id = ?
          ORDER BY receipt_number DESC
          LIMIT 1
      `,
        [bidder_id, auction_id]
      );

      const payment = await query(
        `
          INSERT INTO payments(bidder_id, auction_id, purpose, receipt_number, payment, payment_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [bidder_id, auction_id, "PULL_OUT", receipt_number + 1, amount, "CASH"]
      );

      await query(
        `
          UPDATE auctions_inventories
          SET status = "PAID", payment_id = ?
          WHERE auction_id = ? AND bidder_id = ? AND inventory_id in (?)
        `,
        [payment.insertId, auction_id, bidder_id, item_ids]
      );

      const [{ auction_bidders_id, already_consumed }] = await query(
        `
        SELECT auction_bidders_id, already_consumed
        FROM auctions_bidders
        WHERE auction_id = ? AND bidder_id = ?;  
      `,
        [auction_id, bidder_id]
      );

      if (!already_consumed) {
        await query(
          `
          UPDATE auctions_bidders
          SET already_consumed = 1
          WHERE auction_bidders_id = ?
        `,
          [auction_bidders_id]
        );
      }

      return { auction_id, bidder_id, amount };
    } catch (error) {
      logger.error({ func: "updateBidderPayment", error });
      throw { message: "DB error" };
    }
  },

  getBidderItems: async (auction_id, bidder_id) => {
    try {
      return await query(
        `
          SELECT 
              COALESCE(data_inventories.data, JSON_ARRAY()) AS data,
              ab.bidder_id,
              ab.service_charge AS auction_service_charge,
              b.service_charge AS bidder_service_charge,
              ab.registration_fee,
              ab.already_consumed,
              a.created_at,
              b.bidder_number,
              CONCAT(b.first_name, " ", b.last_name) as bidder_name
          FROM auctions_bidders ab
          LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
          LEFT JOIN auctions a ON a.auction_id = ab.auction_id
          LEFT JOIN (
              SELECT 
                  ai.auction_id,
                  ab.bidder_id,
                  JSON_ARRAYAGG(
                      JSON_OBJECT(
                          'inventory_id', i.inventory_id,
                          'auction_inventory_id', ai.auction_inventory_id,
                          'barcode_number', i.barcode_number,
                          'control_number', i.control_number,
                          'price', i.price,
                          'description', i.description,
                          'qty', i.qty,
                          'url', i.url,
                          'status', i.status,
                          'auction_status', ai.status
                      )
                  ) AS data
              FROM inventories i
              LEFT JOIN auctions_inventories ai ON ai.inventory_id = i.inventory_id
              LEFT JOIN auctions_bidders ab ON ab.auction_id = ai.auction_id
              WHERE ai.auction_id = 1
              GROUP BY ai.auction_id, ab.bidder_id, ab.already_consumed
          ) AS data_inventories ON data_inventories.auction_id = ab.auction_id AND data_inventories.bidder_id = ab.bidder_id
          WHERE a.auction_id = ?
          AND b.bidder_id = ?;
        `,
        [auction_id, bidder_id]
      );
    } catch (error) {
      logger.error({ func: "getBidderItems", error });
      throw { message: "DB error" };
    }
  },

  removeRegisteredBidder: async (auction_id, bidder_id) => {
    try {
      const response = await query(
        `DELETE FROM auctions_bidders WHERE auction_id = ? AND bidder_id = ?`,
        [auction_id, bidder_id]
      );
    } catch (error) {
      logger.error({ func: "removeRegisteredBidder", error });
      throw { message: "DB error" };
    }
  },

  validateExistingAuctionInventories: async (sheet_items) => {
    try {
      const result = await query(
        `
          SELECT auction_id, bidder_id, inventory_id
          FROM auctions_inventories
          WHERE (auction_id, bidder_id, inventory_id) in (?)
        `,
        [sheet_items]
      );
      return result;
    } catch (error) {
      logger.error({ func: "validateExistingAuctionInventories", error });
      throw { message: "DB error" };
    }
  },

  cancelItem: async (auction_id, inventory_id) => {
    try {
      const [inventory] = await query(
        `SELECT status FROM auctions_inventories WHERE inventory_id = ? ORDER BY auction_inventory_id DESC LIMIT 1`,
        [inventory_id]
      );

      await query(
        `
          UPDATE auctions_inventories
          SET status = "CANCELLED"
          WHERE auction_id = ? AND inventory_id = ?
        `,
        [auction_id, inventory_id]
      );

      await query(
        `
        INSERT INTO inventory_histories (auction_id, inventory_id, item_status, auction_status)
        VALUES (?, ?, ?, ?)
      `,
        [auction_id, inventory_id, inventory.status, "CANCELLED"]
      );

      const result = await query(
        `
          SELECT
            ai.auction_id,
            i.inventory_id,
            i.barcode_number,
            i.control_number,
            i.description,
            i.qty,
            i.price,
            b.bidder_number,
            i.status AS item_status,
            ai.auction_inventory_id,
            ai.status,
            ai.manifest_number
          FROM inventories i
          LEFT JOIN auctions_inventories ai ON ai.inventory_id = i.inventory_id
          LEFT JOIN bidders b ON b.bidder_id = ai.bidder_id
          WHERE ai.auction_id = ? AND i.inventory_id = ?;
        `,
        [auction_id, inventory_id]
      );
      return result;
    } catch (error) {
      logger.error({ func: "cancelItem", error });
      throw { message: "DB error" };
    }
  },
};
