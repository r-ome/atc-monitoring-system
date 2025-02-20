import { query, DBErrorException } from "./index.js";

export const getPaymentDetails = async (payment_id) => {
  try {
    const [payment] = await query(
      `
        SELECT
          p.payment_id,
          IF(p.receipt_number = 0,
            b.bidder_number,
            CONCAT(b.bidder_number, "-", p.receipt_number)
          ) AS receipt_number,
          p.amount_paid,
          p.purpose,
          CONCAT(b.first_name, " ", b.last_name) AS full_name,
          b.bidder_number,
          ab.service_charge,
          ab.already_consumed,
          ab.registration_fee,
          DATE_FORMAT(p.created_at, '%b %d, %Y %h:%i%p') AS created_at,
          (
            SELECT
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'payment_id', p.payment_id,
                'auction_inventory_id', ai.auction_inventory_id,
                'inventory_id', ai.inventory_id,
                'inventory_status', i.status,
                'auction_status', ai.status,
                'barcode_number', i.barcode,
                'control_number', i.control_number,
                'price', CONCAT("₱", FORMAT(ai.price, 2)),
                'qty', ai.qty,
                'description', i.description,
                'manifest_number', ai.manifest_number
              ))
            FROM auctions_inventories ai
            LEFT JOIN inventories i ON i.inventory_id = ai.inventory_id
            WHERE ai.payment_id = p.payment_id
          ) AS auction_inventories
        FROM payments p
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = p.auction_bidders_id 
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE p.payment_id = ?
      `,
      [payment_id]
    );

    return payment;
  } catch (error) {
    console.error(error);
    throw new DBErrorException("getPaymentDetails", error);
  }
};

export const getAuctionPayments = async (auction_id) => {
  try {
    const [auction] = await query(
      `
        SELECT
          a.auction_id,
          DATE_FORMAT(a.created_at, '%M %d, %Y, %W') AS auction_date,
          IF(COUNT(ab.auction_bidders_id) = 0,
            JSON_ARRAY(),
            JSON_ARRAYAGG(JSON_OBJECT(
              'payment_id', p.payment_id,
              'full_name', CONCAT(b.first_name, " ", b.last_name),
              'bidder_number', b.bidder_number,
              'purpose', p.purpose,
              'amount_paid', p.amount_paid,
              'payment_type', p.payment_type,
              'created_at', DATE_FORMAT(p.created_at, '%b %d, %Y %h:%i:%S%p' )
            ))
          ) as payments
        FROM auctions a
        LEFT JOIN auctions_bidders ab ON ab.auction_id = a.auction_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        LEFT JOIN payments p ON p.auction_bidders_id = ab.auction_bidders_id
        WHERE a.auction_id = ?
        AND a.deleted_at IS NULL
        GROUP BY a.auction_id;
      `,
      [auction_id]
    );
    return auction;
  } catch (error) {
    throw new DBErrorException("getAuctionPayments", error);
  }
};

export const handleBidderPullout = async (
  auction_bidders_id,
  auction_inventory_ids
) => {
  try {
    const [is_already_consumed] = await query(
      `
        SELECT p.payment_id
        FROM payments p
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = p.auction_bidders_id
        WHERE ab.auction_bidders_id = ? AND p.purpose = "PULL_OUT";
      `,
      [auction_bidders_id]
    );

    const [{ registration_fee, service_charge, balance }] = await query(
      `
      SELECT registration_fee, service_charge, balance
      FROM auctions_bidders
      WHERE auction_bidders_id = ?
    `,
      [auction_bidders_id]
    );

    const [{ total_price }] = await query(
      `
        SELECT CONVERT(SUM(price),DECIMAL(10,2)) as total_price
        FROM auctions_inventories
        WHERE auction_inventory_id in (?) AND status = "UNPAID"
      `,
      [auction_inventory_ids]
    );

    let total_amount_to_be_paid = 0;
    const service_charge_amount = (total_price * service_charge) / 100;
    total_amount_to_be_paid = parseInt(total_price) + service_charge_amount;
    if (!is_already_consumed) {
      total_amount_to_be_paid = total_amount_to_be_paid - registration_fee;
      await query(
        `UPDATE auctions_bidders SET already_consumed = 1 WHERE auction_bidders_id = ?`,
        [auction_bidders_id]
      );
    }

    const [{ receipt_number }] = await query(
      `SELECT MAX(receipt_number) as receipt_number FROM payments WHERE auction_bidders_id = ?`,
      [auction_bidders_id]
    );

    // create payment record
    const payment = await query(
      `
        INSERT INTO payments(auction_bidders_id, purpose, amount_paid, receipt_number, payment_type)
        VALUES (?, ?, ?, ? ,?);
      `,
      [
        auction_bidders_id,
        "PULL_OUT",
        total_amount_to_be_paid,
        receipt_number + 1,
        "CASH",
      ]
    );

    // update auctions_inventories table status = PAID
    await query(
      `
        UPDATE auctions_inventories SET status = "PAID", payment_id = ?
        WHERE auction_inventory_id in (?)
      `,
      [payment.insertId, auction_inventory_ids]
    );

    const current_balance = balance - total_amount_to_be_paid;
    // update balance
    await query(
      `
        UPDATE auctions_bidders SET balance = ?
        WHERE auction_bidders_id = ?;
      `,
      [current_balance, auction_bidders_id]
    );

    const [payment_result] = await query(
      `
        SELECT
          p.payment_id,
          p.purpose,
          CONCAT(b.bidder_number, "-", p.receipt_number) AS receipt_number,
          p.payment_type,
          ab.auction_id,
          b.bidder_number,
          CONCAT(b.first_name, " ", b.last_name) as full_name
        FROM payments p
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = p.auction_bidders_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE p.payment_id = ?
      `,
      [payment.insertId]
    );

    return payment_result;
  } catch (error) {
    throw new DBErrorException("handleBidderPullout", error);
  }
};

export const getBidderAuctionTransactions = async (auction_bidders_id) => {
  try {
    return await query(
      `
        SELECT
          p.payment_id,
          p.purpose,
          p.amount_paid AS amount_paid,
          IF(p.purpose = "REGISTRATION",
            b.bidder_number,
            CONCAT(b.bidder_number, "-", p.receipt_number)) AS receipt_number,
          p.payment_type,
          DATE_FORMAT(p.created_at, '%b %d, %Y %h:%i%p') as created_at,
          IF(p.purpose = "REGISTRATION", "---", COUNT(ai.auction_inventory_id)) AS total_items
        FROM payments p
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = p.auction_bidders_id
        LEFT JOIN auctions_inventories ai ON ai.payment_id = p.payment_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE ab.auction_bidders_id = ?
        GROUP BY p.payment_id;
      `,
      [auction_bidders_id]
    );
  } catch (error) {
    throw new DBErrorException("getBidderAuctionTransactions", error);
  }
};
