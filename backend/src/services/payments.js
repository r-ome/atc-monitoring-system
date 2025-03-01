import {
  AUCTION_STATUS,
  INVENTORY_STATUS,
  PAYMENT_PURPOSE,
  PAYMENT_TYPE,
} from "../Routes/constants.js";
import { query, DBErrorException } from "./index.js";

export const getPaymentDetails = async (payment_id) => {
  try {
    const [payment] = await query(
      `
        SELECT
          p.payment_id,
          ab.created_at AS auction_date,
          IF(p.receipt_number = 0,
            b.bidder_number,
            CONCAT(b.bidder_number, IF(p.receipt_number < 0, "", CONCAT("-", p.receipt_number)))
          ) AS receipt_number,
          p.amount_paid,
          p.purpose,
          CONCAT(b.first_name, " ", b.last_name) AS full_name,
          b.bidder_number,
          ab.auction_bidders_id,
          ab.service_charge,
          ab.already_consumed,
          ab.balance,
          ab.registration_fee,
          p.created_at AS payment_date,
          (
            SELECT
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'payment_id', ih.payment_id,
                'remarks', ih.remarks,
                'auction_inventory_id', ai.auction_inventory_id,
                'inventory_id', ai.inventory_id,
                'inventory_status', i.status,
                'auction_status', ai.status,
                'barcode', i.barcode,
                'bidder', b.bidder_number,
                'control', i.control,
                'price', ai.price,
                'qty', ai.qty,
                'description', i.description,
                'manifest_number', ai.manifest_number
              ))
            FROM inventory_histories ih
            LEFT JOIN auctions_inventories ai ON ai.auction_inventory_id = ih.auction_inventory_id
            LEFT JOIN inventories i ON i.inventory_id = ai.inventory_id
            WHERE ih.payment_id = p.payment_id
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
    throw new DBErrorException("getPaymentDetails", error);
  }
};

export const getAuctionPayments = async (auction_id) => {
  try {
    const [auction] = await query(
      `
        SELECT
          a.auction_id,
          a.created_at AS auction_date,
          IF(COUNT(ab.auction_bidders_id) = 0,
            JSON_ARRAY(),
            JSON_ARRAYAGG(JSON_OBJECT(
              'payment_id', p.payment_id,
              'full_name', CONCAT(b.first_name, " ", b.last_name),
              'bidder_number', b.bidder_number,
              'purpose', p.purpose,
              'amount_paid', p.amount_paid,
              'payment_type', p.payment_type,
              'created_at', p.created_at
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
  auction_inventory_ids,
  amount_paid
) => {
  try {
    const [is_already_consumed] = await query(
      `
        SELECT p.payment_id
        FROM payments p
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = p.auction_bidders_id
        WHERE ab.auction_bidders_id = ? AND p.purpose = "${PAYMENT_PURPOSE.PULL_OUT}";
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
        WHERE auction_inventory_id in (?) AND status = "${AUCTION_STATUS.UNPAID}"
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

    let payment_status = PAYMENT_PURPOSE.PULL_OUT;
    let is_partial_payment = !Object.is(amount_paid, undefined);

    if (is_partial_payment) {
      payment_status = PAYMENT_PURPOSE.PARTIAL;
    }

    // create payment record
    const payment = await query(
      `
        INSERT INTO payments(auction_bidders_id, purpose, amount_paid, receipt_number, payment_type)
        VALUES (?, ?, ?, ? ,?);
      `,
      [
        auction_bidders_id,
        payment_status,
        is_partial_payment ? amount_paid : total_amount_to_be_paid,
        receipt_number + 1,
        "CASH",
      ]
    );

    // update auctions_inventories table status = PAID
    await query(
      `
        UPDATE auctions_inventories SET status = "${
          is_partial_payment ? AUCTION_STATUS.PARTIAL : AUCTION_STATUS.PAID
        }", payment_id = ?
        WHERE auction_inventory_id in (?)
      `,
      [payment.insertId, auction_inventory_ids]
    );

    const current_balance =
      balance - (is_partial_payment ? amount_paid : total_amount_to_be_paid);
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

    const bulk_insert_inventory_histories = auction_inventory_ids.map(
      (item) => [
        item,
        payment_result.payment_id,
        is_partial_payment ? AUCTION_STATUS.PARTIAL : AUCTION_STATUS.PAID,
        INVENTORY_STATUS.SOLD,
      ]
    );

    // update inventory_histories
    await query(
      `
        INSERT INTO inventory_histories (auction_inventory_id, payment_id, auction_status, inventory_status)
        VALUES ?
      `,
      [bulk_insert_inventory_histories]
    );

    return payment_result;
  } catch (error) {
    console.log(error);
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
          IF(p.purpose = "${PAYMENT_PURPOSE.REGISTRATION}",
            b.bidder_number,
            CONCAT(b.bidder_number, IF(p.receipt_number < 0, "", CONCAT("-", p.receipt_number)))
          ) AS receipt_number,
          p.payment_type,
          p.created_at,
          COUNT(DISTINCT ih.auction_inventory_id) as total_items
        FROM payments p
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = p.auction_bidders_id
        LEFT JOIN auctions_inventories ai ON ai.payment_id = p.payment_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        LEFT JOIN inventory_histories ih ON ih.payment_id = p.payment_id
        WHERE ab.auction_bidders_id = ?
        GROUP BY p.payment_id
      `,
      [auction_bidders_id]
    );
  } catch (error) {
    throw new DBErrorException("getBidderAuctionTransactions", error);
  }
};

export const refundRegistrationFee = async (auction_bidders_id) => {
  try {
    const [auction_bidder] = await query(
      `
        SELECT
          ab.auction_bidders_id,
          ab.balance,
          ab.registration_fee,
          MIN(p.receipt_number) as receipt_number
        FROM auctions_bidders ab
        LEFT JOIN payments p ON p.auction_bidders_id = ab.auction_bidders_id 
        WHERE ab.auction_bidders_id = ?
        GROUP by ab.auction_bidders_id
      `,
      [auction_bidders_id]
    );

    if (auction_bidder.receipt_number < 0) {
      return false;
    }

    const payment = await query(
      `
        INSERT INTO payments(auction_bidders_id, purpose, amount_paid, receipt_number, payment_type)
        VALUES (?, ?, ?, ?, ?);
     `,
      [
        auction_bidder.auction_bidders_id,
        "REFUNDED",
        auction_bidder.registration_fee * -1,
        -1,
        "CASH",
      ]
    );

    await query(
      `
        UPDATE auctions_bidders
        SET
        balance = balance + registration_fee,
        already_consumed = 1,
        remarks = "WITHDRAWN FROM AUCTION"
        WHERE auction_bidders_id = ?
      `,
      [auction_bidder.auction_bidders_id]
    );

    return await getPaymentDetails(payment.insertId);
  } catch (error) {
    throw new DBErrorException("refundRegistrationFee", error);
  }
};

export const settlePartialPayment = async (payment_id) => {
  try {
    const [auction_bidder] = await query(
      `
        SELECT
          ab.auction_bidders_id,
          ab.balance,
          ab.registration_fee,
          ab.service_charge,
          ab.already_consumed,
          p.purpose,
          p.amount_paid,
          p.receipt_number,
          JSON_ARRAYAGG(JSON_OBJECT(
            'auction_inventory_id', ai.auction_inventory_id,
            'price', ai.price
          )) AS auction_items
        FROM auctions_bidders ab
        LEFT JOIN payments p ON p.auction_bidders_id = ab.auction_bidders_id
        LEFT JOIN auctions_inventories ai ON ai.payment_id = p.payment_id 
        WHERE p.payment_id = ?
        GROUP BY p.payment_id
      `,
      [payment_id]
    );

    let total_item_price = auction_bidder.auction_items.reduce(
      (total, item) => (total = total + item.price),
      0
    );

    total_item_price =
      total_item_price +
      (total_item_price * parseInt(auction_bidder.service_charge, 10)) / 100;

    if (!auction_bidder.is_already_consumed) {
      total_item_price = total_item_price - auction_bidder.registration_fee;
    }

    const remaining_balance = total_item_price - auction_bidder.amount_paid;

    const auction_inventory_ids = auction_bidder.auction_items
      .map((item) => item.auction_inventory_id)
      .join(",");

    const settled_payment = await query(
      `
        INSERT INTO payments(auction_bidders_id, purpose, amount_paid, receipt_number, payment_type)
        VALUES(?,?,?,?,?)
      `,
      [
        auction_bidder.auction_bidders_id,
        PAYMENT_PURPOSE.PULL_OUT,
        remaining_balance,
        auction_bidder.receipt_number,
        PAYMENT_TYPE.CASH,
      ]
    );

    // update payment_id of auctions_inventories
    await query(
      `
        UPDATE auctions_inventories
        SET status = "${AUCTION_STATUS.PAID}", payment_id = ?
        WHERE auction_inventory_id in (${auction_inventory_ids})
      `,
      [settled_payment.insertId]
    );

    const computed_balance = auction_bidder.balance - remaining_balance;
    await query(
      `UPDATE auctions_bidders SET balance = ?  WHERE auction_bidders_id = ?`,
      [computed_balance, auction_bidder.auction_bidders_id]
    );

    const bulk_insert_inventory_histories = auction_inventory_ids
      .split(",")
      .map((item) => [
        item,
        settled_payment.insertId,
        AUCTION_STATUS.PAID,
        INVENTORY_STATUS.SOLD,
      ]);

    // bulk create to inventory_histories
    await query(
      `
        INSERT INTO inventory_histories (auction_inventory_id, payment_id, auction_status, inventory_status)
        VALUES ?
      `,
      [bulk_insert_inventory_histories]
    );

    return await getPaymentDetails(settled_payment.insertId);
  } catch (error) {
    throw new DBErrorException("settlePartialPayment", error);
  }
};
