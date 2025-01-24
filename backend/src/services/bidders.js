import { query } from "./index.js";
import { logger } from "../logger.js";

export default {
  getBidder: async (bidder_id) => {
    try {
      return await query(`SELECT * FROM bidders WHERE bidder_id = ?`, [
        bidder_id,
      ]);
    } catch (error) {
      logger.error({ func: "getBidder", error });
      throw { message: "DB error" };
    }
  },

  getBidderByBidderNumber: async (bidder_number) => {
    try {
      const response = await query(
        `SELECT * from bidders WHERE bidder_number = ?`,
        [bidder_number]
      );
      return response;
    } catch (error) {
      logger.error({ func: "getBidderByBidderNumber", error });
      throw { message: "DB error" };
    }
  },

  getMultipleBiddersByBidderNumber: async (auction_id, bidder_numbers) => {
    try {
      const response = await query(
        `
          SELECT b.bidder_id, b.bidder_number
          FROM bidders b
          LEFT JOIN auctions_bidders ab ON ab.bidder_id = b.bidder_id
          WHERE ab.auction_id = ? AND bidder_number in (?)
        `,
        [auction_id, bidder_numbers]
      );

      return response;
    } catch (error) {
      logger.error({ func: "getMultipleBiddersByBidderNumber", error });
      throw { message: "DB error" };
    }
  },

  getBidders: async () => {
    try {
      return await query("SELECT * FROM bidders WHERE deleted_at IS NULL");
    } catch (error) {
      logger.error({ func: "getBidders", error });
      throw { message: "DB error" };
    }
  },

  createBidder: async (bidder) => {
    try {
      const result = await query(
        `
        INSERT INTO bidders(first_name, middle_name, last_name, service_charge, bidder_number, old_number)
        VALUES (?, ?, ?, ?, ?, ?);`,
        [
          bidder.first_name,
          bidder.middle_name,
          bidder.last_name,
          bidder.service_charge,
          bidder.bidder_number,
          bidder.old_number,
        ]
      );
      if (result.insertId) {
        const response = await query(
          `
            SELECT * FROM bidders WHERE bidder_id = ?
          `,
          [result.insertId]
        );
        return response[0];
      }
    } catch (error) {
      logger.error({ func: "createBidder", error });
      throw { message: "DB error" };
    }
  },

  updateBidder: async (id, bidder) => {
    try {
      await query(
        `
        UPDATE bidders
        SET ?
        WHERE bidder_id = ? AND deleted_at IS NULL;
        `,
        [bidder, id]
      );
      return { bidder_id: id, ...bidder };
    } catch (error) {
      logger.error({ func: "updateBidder", error });
      throw { message: "DB error" };
    }
  },

  deleteBidder: async (id) => {
    try {
      return await query(
        `
          UPDATE bidderes
          SET deleted_at = NOW()
          WHERE bidder_id = ? AND deleted_at IS NULL;
        `,
        [id]
      );
    } catch (error) {
      logger.error({ func: "deleteBidder", error });
      throw { message: "DB error" };
    }
  },

  addRequirement: async ({ bidder_id, name, url, validity_date }) => {
    try {
      const response = await query(
        `
          INSERT INTO bidder_requirements(bidder_id, name, url, validity_date)
          VALUES (?, ?, ? ,?);
        `,
        [bidder_id, name, url, validity_date]
      );

      const requirement = await query(
        `
        SELECT * FROM bidder_requirements WHERE requirement_id = ?
        `,
        [response.insertId]
      );
      return requirement[0];
    } catch (error) {
      logger.error({ func: "addRequirement", error });
      throw { message: "DB error" };
    }
  },

  getRequirements: async (bidder_id) => {
    try {
      return await query(
        `
        SELECT
          br.*
        FROM bidders b
        INNER JOIN bidder_requirements br ON br.bidder_id = b.bidder_id
        WHERE b.bidder_id = ? AND br.deleted_at is null;
      `,
        [bidder_id]
      );
    } catch (error) {
      logger.error({ func: "getRequirements", error });
      throw { message: "DB error" };
    }
  },

  getAuctionsJoined: async (bidder_id) => {
    try {
      return await query(
        `
          SELECT
              ab.auction_bidders_id,
              ab.auction_id,
              ab.bidder_id,
              ab.created_at,
              ab.service_charge,
              COUNT(ai.inventory_id) AS total_items,
              SUM(i.price) AS total_price
          FROM bidders b
          LEFT JOIN auctions_bidders ab ON ab.bidder_id = b.bidder_id
          LEFT JOIN auctions_inventories ai ON ai.bidder_id = b.bidder_id
          LEFT JOIN inventories i ON i.inventory_id = ai.inventory_id
          WHERE b.bidder_id = ?
          GROUP BY ab.auction_bidders_id;

      `,
        [bidder_id]
      );
    } catch (error) {
      logger.error({ func: "getAuctionsJoined", error });
      throw { message: "DB error" };
    }
  },

  getBidderPaymentHistory: async (bidder_id) => {
    try {
      return await query(
        `
        SELECT
          receipt_number,
          payment_type,
          payment,
          created_at,
          REPLACE(purpose, "_", " ") AS purpose
        FROM payments
        WHERE bidder_id = ?`,
        [bidder_id]
      );
    } catch (error) {
      logger.error({ func: "getAuctionsJoined", error });
      throw { message: "DB error" };
    }
  },
};
