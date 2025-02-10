import { query, DBErrorException } from "./index.js";

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
              'purpose', REPLACE(p.purpose,"_"," "),
              'amount_paid', CONCAT("₱", FORMAT(p.amount_paid, 2)),
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
      SELECT registration_fee, service_charge,balance
      FROM auctions_bidders
      WHERE auction_bidders_id = ?
    `,
      [auction_bidders_id]
    );

    const [{ total_price }] = await query(
      `
        SELECT CONVERT(SUM(price),DECIMAL(10,2)) as total_price
        FROM auctions_inventories
        WHERE auction_inventory_id in (?)
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

    // create payment record
    const payment = await query(
      `
        INSERT INTO payments(auction_bidders_id, purpose, amount_paid, receipt_number, payment_type)
        VALUES (?, ?, ?, ? ,?);
      `,
      [auction_bidders_id, "PULL_OUT", total_amount_to_be_paid, 1, "CASH"]
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

    const payment_result = await query(
      `
        SELECT
          p.payment_id,
          p.purpose,
          p.receipt_number,
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
