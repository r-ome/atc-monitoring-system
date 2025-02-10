import { query, DBErrorException } from "./index.js";

export const getBidder = async (bidder_id) => {
  try {
    const [result] = await query(
      `
        SELECT
          b.bidder_id,
          b.bidder_number,
          b.first_name,
          b.middle_name,
          b.last_name,
          CONCAT(b.first_name, " ", b.middle_name, " ", b.last_name) as full_name,
          DATE_FORMAT(b.created_at, '%b %d, %Y %h:%i%p') AS created_at,
          DATE_FORMAT(b.updated_at, '%b %d, %Y %h:%i%p') AS updated_at,
          IF (COUNT(br.requirement_id) = 0,
            JSON_ARRAY(),
            JSON_ARRAYAGG(JSON_OBJECT(
              'requirement_id', br.requirement_id,
              'name', br.name,
              'validity_date', DATE_FORMAT(br.validity_date, '%b %d, %Y')
            ))
          ) AS requirements
        FROM bidders b
        LEFT JOIN bidder_requirements br ON br.bidder_id = b.bidder_id
        WHERE b.bidder_id = ?
        AND b.deleted_at IS NULL
        GROUP BY b.bidder_id
      `,
      [bidder_id]
    );
    return result;
  } catch (error) {
    throw new DBErrorException("getBidder", error);
  }
};

export const getBidderByBidderNumber = async (bidder_number) => {
  try {
    const result = await query(
      `SELECT * from bidders WHERE bidder_number = ?`,
      [bidder_number]
    );
    return result;
  } catch (error) {
    throw new DBErrorException("getBidderByBidderNumber", error);
  }
};

export const getMultipleBiddersByBidderNumber = async (
  auction_id,
  bidder_numbers
) => {
  try {
    const result = await query(
      `
        SELECT
          ab.auction_bidders_id,
          b.bidder_number
        FROM auctions_bidders ab 
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE b.bidder_number = ?
        AND ab.auction_id = ?
      `,
      [bidder_numbers, auction_id]
    );

    return result;
  } catch (error) {
    throw new DBErrorException("getMultipleBiddersByBidderNumber", error);
  }
};

export const getBidders = async () => {
  try {
    return await query(`
      SELECT
        bidder_id,
        bidder_number,
        first_name,
        middle_name,
        last_name,
        CONCAT(first_name, " ", middle_name, " ", last_name) as full_name,
        DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at,
        DATE_FORMAT(updated_at, '%b %d, %Y %h:%i%p') AS updated_at
      FROM bidders
      WHERE deleted_at IS NULL`);
  } catch (error) {
    throw new DBErrorException("getBidders", error);
  }
};

export const createBidder = async (bidder) => {
  try {
    const result = await query(
      `
        INSERT INTO bidders(first_name, middle_name, last_name, bidder_number)
        VALUES (?, ?, ?, ?);`,
      [
        bidder.first_name,
        bidder.middle_name,
        bidder.last_name,
        bidder.bidder_number,
      ]
    );

    return {
      bidder_id: result.insertId,
      ...bidder,
    };
  } catch (error) {
    throw new DBErrorException("createBidder", error);
  }
};

export const updateBidder = async (id, bidder) => {
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
    throw new DBErrorException("updateBidder", error);
  }
};

export const deleteBidder = async (id) => {
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
    throw new DBErrorException("deleteBidder", error);
  }
};

export const addRequirement = async ({
  bidder_id,
  name,
  url,
  validity_date,
}) => {
  try {
    const response = await query(
      `
          INSERT INTO bidder_requirements(bidder_id, name, url, validity_date)
          VALUES (?, ?, ? ,?);
        `,
      [bidder_id, name, url, validity_date]
    );

    const [requirement] = await query(
      `
        SELECT
          requirement_id,
          bidder_id,
          name,
          validity_date,
          url,
          DATE_FORMAT(created_at, '%b %d, %Y %h:%i%p') AS created_at,
          DATE_FORMAT(updated_at, '%b %d, %Y %h:%i%p') AS updated_at
        FROM bidder_requirements WHERE requirement_id = ?
        `,
      [response.insertId]
    );
    return requirement;
  } catch (error) {
    throw new DBErrorException("addRequirement", error);
  }
};

export const getRequirements = async (bidder_id) => {
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
    throw new DBErrorException("getRequirements", error);
  }
};

export const getAuctionsJoined = async (bidder_id) => {
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
    throw new DBErrorException("getAuctionsJoined", error);
  }
};

export const getBidderPaymentHistory = async (bidder_id) => {
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
    throw new DBErrorException("getAuctionsJoined", error);
  }
};
