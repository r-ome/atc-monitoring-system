import { query, DBErrorException } from "./index.js";

export const getAuctionDetails = async (auction_id) => {
  try {
    /**
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
      `
     */
    // IF(COUNT(ab.auction_bidders_id) = 0,
    //   JSON_ARRAY(),
    //   JSON_ARRAYAGG(JSON_OBJECT(
    //     'bidder_id', b.bidder_id,
    //     'bidder_number', b.bidder_number,
    //     'service_charge', CONCAT(ab.service_charge, "%"),
    //     'registration_fee', CONCAT("₱", FORMAT(ab.registration_fee, 2)),
    //     'full_name', CONCAT(b.first_name, " ", b.last_name)
    //   ))
    // ) as bidders

    const [auction] = await query(
      `
        SELECT
          a.auction_id,
          DATE_FORMAT(a.created_at, '%M %d, %Y %W') AS auction_date,
          COUNT(DISTINCT ab.auction_bidders_id) AS number_of_bidders,
          COUNT(ai.auction_inventory_id) AS total_items
        FROM auctions a
        LEFT JOIN auctions_bidders ab ON ab.auction_id = a.auction_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        LEFT JOIN auctions_inventories ai ON ai.auction_bidders_id = ab.auction_bidders_id
        WHERE a.auction_id = ?
        AND a.deleted_at IS NULL
        GROUP BY a.auction_id;
      `,
      [auction_id]
    );
    return auction;
  } catch (error) {
    throw new DBErrorException("getBidderItems", error);
  }
};

export const getAuctions = async () => {
  try {
    /*
    `
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
        `
    **/
    return await query(
      `
        SELECT
          a.auction_id,
          DATE_FORMAT(a.created_at, '%M %d, %Y %h:%i%p, %W') AS created_at,
          COUNT(ab.auction_bidders_id) AS number_of_bidders
        FROM auctions a
        LEFT JOIN auctions_bidders ab ON ab.auction_id = a.auction_id
        GROUP BY a.auction_id
      `
    );
  } catch (error) {
    throw new DBErrorException("getAuctions", error);
  }
};

export const createAuction = async (branch) => {
  try {
    const response = await query(
      `INSERT INTO auctions(created_at) VALUES (NOW());`
    );

    const [auction] = await query(
      `
      SELECT
        auction_id,
        DATE_FORMAT(created_at, '%M %d, %Y %h:%i%p, %W') AS created_at,
        0 as number_of_bidders
      FROM auctions
      WHERE auction_id = ?
      AND deleted_at IS NULL`,
      [response.insertId]
    );
    return auction;
  } catch (error) {
    throw new DBErrorException("createAuction", error);
  }
};

export const deleteAuction = async (id) => {
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
};

export const registerBidderAtAuction = async (
  auction_id,
  { bidder_id, service_charge, registration_fee }
) => {
  try {
    const auction_bidders_response = await query(
      `
          INSERT INTO auctions_bidders(bidder_id, auction_id, service_charge, registration_fee)
          VALUES (?, ?, ?, ?);
        `,
      [bidder_id, auction_id, service_charge, registration_fee]
    );

    await query(
      `
        INSERT INTO payments(auction_bidders_id, balance, amount_paid, payment_type, purpose)
        VALUES (?, ?, ?, ?, "REGISTRATION");
      `,
      [
        auction_bidders_response.insertId,
        registration_fee * -1,
        registration_fee,
        "CASH",
      ]
    );

    const [auction_bidders] = await query(
      `
        SELECT
          ab.auction_bidders_id,
          DATE_FORMAT(a.created_at, '%M %d, %Y %h:%i%p') AS auction_date,
          CONCAT(b.first_name, " ", b.last_name) AS full_name,
          b.bidder_number,
          CONCAT(ab.service_charge, "%") AS service_charge,
          ab.registration_fee,
          DATE_FORMAT(ab.created_at, '%M %d, %Y %h:%i%p') AS registered_date
        FROM auctions_bidders ab
        LEFT JOIN auctions a ON a.auction_id = ab.auction_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE ab.auction_bidders_id = ?
      `,
      [auction_bidders_response.insertId]
    );

    return auction_bidders;
  } catch (error) {
    throw new DBErrorException("registerBidderAtAuction", error);
  }
};

export const getMonitoring = async (auction_id) => {
  try {
    return await query(
      `
        SELECT
          ai.auction_inventory_id,
          i.barcode,
          i.control_number,
          i.description,
          JSON_OBJECT(
            'bidder_id', ab.bidder_id,
            'bidder_number', b.bidder_number
          ) as bidder,
          ai.qty,
          CONCAT("₱", FORMAT(ai.price, 2)) as price,
          ai.manifest_number
        FROM auctions_inventories ai
        LEFT JOIN inventories i ON i.inventory_id = ai.inventory_id
        LEFT JOIN auctions_bidders ab ON ai.auction_bidders_id = ab.auction_bidders_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE ab.auction_id = ?
      `,
      [auction_id]
    );
  } catch (error) {
    throw new DBErrorException("getMonitoring", error);
  }
};

export const createManifestRecords = async (manifest) => {
  try {
    return await query(
      `
        INSERT INTO
          manifest_records(
            auction_id,
            barcode_number,
            control_number,
            description,
            price,
            bidder_number,
            qty,
            manifest_number,
            batch_number,
            remarks,
            error_messages
          )
        VALUES ?;
      `,
      [manifest]
    );
  } catch (error) {
    console.log(error);
    throw new DBErrorException("createManifestRecords", error);
  }
};

export const getManifestRecords = async (auction_id) => {
  try {
    return await query(
      `
        SELECT
          manifest_id,
          remarks,
          barcode_number,
          control_number,
          description,
          price,
          bidder_number,
          qty,
          manifest_number,
          batch_number,
          error_messages,
          DATE_FORMAT(created_at, '%M %d, %Y %h:%i%p') AS created_at,
          DATE_FORMAT(updated_at, '%M %d, %Y %h:%i%p') AS updated_at
        FROM manifest_records
        WHERE auction_id = ?
      `,
      [auction_id]
    );
  } catch (error) {
    throw new DBErrorException("getManifestRecords", error);
  }
};

export const getRegisteredBidders = async (auction_id) => {
  try {
    const [response] = await query(
      `
        SELECT
          a.auction_id,
          DATE_FORMAT(a.created_at, '%M %d, %Y, %W') AS auction_date,
          IF(COUNT(ab.auction_bidders_id) = 0,
            JSON_ARRAY(),
            JSON_ARRAYAGG(JSON_OBJECT(
              'auctions_bidders_id', ab.auction_bidders_id,
              'bidder_id', ab.bidder_id,
              'full_name', CONCAT(b.first_name, " ", b.last_name),
              'bidder_number', b.bidder_number,
              'service_charge', CONCAT(ab.service_charge, "%"),
              'registration_fee', CONCAT("₱", FORMAT(ab.registration_fee, 2))
            ))
          ) AS bidders
        FROM auctions a
        LEFT JOIN auctions_bidders ab ON ab.auction_id = a.auction_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE a.auction_id = ? AND a.deleted_at IS NULL
        GROUP BY a.auction_id
      `,
      [auction_id]
    );
    return response;
  } catch (error) {
    throw new DBErrorException("getRegisteredBidders", error);
  }
};

export const updateBidderPayment = async (
  auction_id,
  bidder_id,
  amount,
  item_ids
) => {
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
};

export const getBidderItems = async (auction_id, bidder_id) => {
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
};

export const removeRegisteredBidder = async (auction_id, bidder_id) => {
  try {
    const response = await query(
      `DELETE FROM auctions_bidders WHERE auction_id = ? AND bidder_id = ?`,
      [auction_id, bidder_id]
    );
  } catch (error) {
    logger.error({ func: "removeRegisteredBidder", error });
    throw { message: "DB error" };
  }
};

export const cancelItem = async (auction_id, inventory_id) => {
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
};
