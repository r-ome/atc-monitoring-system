import {
  AUCTION_STATUS,
  PAYMENT_PURPOSE,
  PAYMENT_TYPE,
} from "../Routes/constants.js";
import { query, DBErrorException } from "./index.js";
import { formatNumberToCurrency } from "../utils/index.js";

export const getAuctionDetails = async (auction_id) => {
  try {
    const [auction] = await query(
      `
        SELECT
          a.auction_id,
          DATE_FORMAT(a.created_at, '%M %d, %Y %W') AS auction_date,
          COUNT(DISTINCT ab.auction_bidders_id) AS number_of_bidders,
          COUNT(ai.auction_inventory_id) AS total_items,
          (
            SELECT SUM(registration_fee)
            FROM auctions_bidders
            WHERE auctions_bidders.auction_id = a.auction_id
          ) AS total_registration_fee,
          IF(SUM(ai.price) IS null,
            0,
            SUM(CASE WHEN ai.status != "CANCELLED" THEN ai.price END)
          ) AS total_items_price
        FROM auctions a
        LEFT JOIN auctions_bidders ab ON ab.auction_id = a.auction_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        LEFT JOIN auctions_inventories ai ON ai.auction_bidders_id = ab.auction_bidders_id
        WHERE a.auction_id = ?
        AND a.deleted_at IS NULL

      `,
      [auction_id]
    );
    return auction;
  } catch (error) {
    throw new DBErrorException("getAuctionDetails", error);
  }
};

export const getAuctions = async () => {
  try {
    return await query(
      `
        SELECT
          a.auction_id,
          DATE_FORMAT(a.created_at, '%M %d, %Y, %W') AS auction_date,
          COUNT(DISTINCT ab.auction_bidders_id) AS total_bidders,
          COUNT(ai.auction_inventory_id) AS total_items
        FROM auctions a
        LEFT JOIN auctions_bidders ab ON ab.auction_id = a.auction_id
        LEFT JOIN auctions_inventories ai ON ai.auction_bidders_id = ab.auction_bidders_id
        GROUP BY a.auction_id
      `
    );
  } catch (error) {
    throw new DBErrorException("getAuctions", error);
  }
};

export const createAuction = async () => {
  try {
    const response = await query(
      `INSERT INTO auctions(created_at) VALUES (NOW());`
    );

    return await getAuctionDetails(response.insertId);
  } catch (error) {
    throw new DBErrorException("createAuction", error);
  }
};

export const getAuctionItemDetails = async (auction_inventory_id) => {
  try {
    const [result] = await query(
      `
        SELECT
          ai.auction_inventory_id,
          ab.auction_id,
          ai.price,
          i.status AS inventory_status,
          ai.status AS auction_status,
          ai.qty,
          i.description,
          i.control_number,
          i.barcode AS barcode_number,
          ab.service_charge,
          JSON_OBJECT(
            'bidder_id', b.bidder_id,
            'bidder_number', b.bidder_number,
            'full_name', CONCAT(b.first_name, " ", b.last_name)
          ) AS bidder,
          IF (COUNT(ih.auction_inventory_id) = 0,
            JSON_ARRAY(),
            JSON_ARRAYAGG(JSON_OBJECT(
              'inventory_history_id', ih.inventory_history_id,
              'auction_inventory_id', ih.auction_inventory_id,
              'status', ih.auction_status,
              'remarks', ih.remarks,
              'created_at', DATE_FORMAT(ih.created_at, '%M %d, %Y %h:%i%p')
            ))
          ) AS histories
        FROM auctions_inventories ai
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = ai.auction_bidders_id
        LEFT JOIN inventories i ON i.inventory_id = ai.inventory_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        LEFT JOIN inventory_histories ih ON ih.auction_inventory_id = ai.auction_inventory_id
        WHERE ai.auction_inventory_id = ?
        GROUP BY ai.auction_inventory_id
      `,
      [auction_inventory_id]
    );
    return result;
  } catch (error) {
    throw new DBErrorException("getAuctionItem", error);
  }
};

export const registerBidderAtAuction = async (
  auction_id,
  { bidder_id, service_charge, registration_fee }
) => {
  try {
    const auction_bidders_response = await query(
      `
          INSERT INTO auctions_bidders(bidder_id, auction_id, service_charge, registration_fee, balance)
          VALUES (?, ?, ?, ?, ?);
        `,
      [
        bidder_id,
        auction_id,
        service_charge,
        registration_fee,
        registration_fee * -1,
      ]
    );

    await query(
      `
        INSERT INTO payments(auction_bidders_id, amount_paid, payment_type, purpose)
        VALUES (?, ?, ?, ?);
      `,
      [
        auction_bidders_response.insertId,
        registration_fee,
        PAYMENT_TYPE.CASH,
        PAYMENT_PURPOSE.REGISTRATION,
      ]
    );

    return await getBidderAuctionProfile(auction_id, bidder_id);
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
          i.status AS inventory_status,
          ai.status AS auction_status,
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
          IF(
              COUNT(ab.auction_bidders_id) = 0,
              JSON_ARRAY(),
              JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'auction_bidders_id', ab.auction_bidders_id,
                      'bidder_id', ab.bidder_id,
                      'full_name', CONCAT(b.first_name, " ", b.last_name),
                      'bidder_number', b.bidder_number,
                      'service_charge', ab.service_charge,
                      'registration_fee', ab.registration_fee,
                      'total_items', COALESCE(ai_counts.total_items, 0),
                      'balance',  ab.balance
                  )
              )
          ) AS bidders
        FROM auctions a
        LEFT JOIN auctions_bidders ab ON ab.auction_id = a.auction_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        LEFT JOIN (
            SELECT
              auction_bidders_id,
              COUNT(auction_inventory_id) AS total_items,
              SUM(price) AS total_price
            FROM auctions_inventories
            GROUP BY auction_bidders_id
        ) AS ai_counts ON ai_counts.auction_bidders_id = ab.auction_bidders_id
        WHERE a.auction_id = ? AND a.deleted_at IS NULL
        GROUP BY a.auction_id;
      `,
      [auction_id]
    );
    return response;
  } catch (error) {
    console.error(error);
    throw new DBErrorException("getRegisteredBidders", error);
  }
};

export const getBidderAuctionProfile = async (auction_id, bidder_id) => {
  try {
    const [result] = await query(
      `
        SELECT
          ab.auction_bidders_id,
          b.bidder_id,
          b.bidder_number,
          CONCAT(b.first_name, " ", b.last_name) AS full_name,
          ab.already_consumed,
          COUNT(ai.auction_inventory_id) as total_items,
          CONCAT(ab.service_charge, "%") AS service_charge,
          ab.registration_fee,
          IF(SUM(ai.price) = 0,
            0,
            SUM(CASE WHEN ai.status != "CANCELLED" THEN ai.price END)
          ) AS total_item_price,
          SUM(CASE WHEN ai.status = "UNPAID" THEN 1 ELSE 0 END) AS total_unpaid_items,
          (SUM(CASE WHEN ai.status = "UNPAID" THEN ai.price ELSE 0 END) * ab.service_charge)/100 AS total_unpaid_items_price,
          ab.balance,
          IF(COUNT(ai.auction_inventory_id) = 0,
            JSON_ARRAY(),
            JSON_ARRAYAGG(JSON_OBJECT(
              'auction_inventory_id', ai.auction_inventory_id,
              'inventory_id', i.inventory_id,
              'barcode', i.barcode,
              'control', i.control_number,
              'description', i.description,
              'price', CONCAT("₱", FORMAT(ai.price, 2)),
              'qty', ai.qty,
              'manifest_number', ai.manifest_number,
              'status', ai.status,
              'updated_at', ai.updated_at
            ))
          ) AS items
        FROM bidders b
        LEFT JOIN auctions_bidders ab ON ab.bidder_id = b.bidder_id
        LEFT JOIN auctions_inventories ai ON ai.auction_bidders_id = ab.auction_bidders_id
        LEFT JOIN inventories i ON i.inventory_id = ai.inventory_id
        WHERE b.bidder_id = ? AND ab.auction_id = ?
        GROUP BY ab.auction_bidders_id
      `,
      [bidder_id, auction_id]
    );
    return result;
  } catch (error) {
    throw new DBErrorException("getBidderItems", error);
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

export const getAuctionItemHistories = async (auction_inventory_id) => {
  try {
    return await query(
      `
        SELECT
          inventory_history_id,
          auction_inventory_id,
          auction_status,
          remarks,
          created_at
        FROM inventory_histories WHERE auction_inventory_id = ?
      `,
      [auction_inventory_id]
    );
  } catch (error) {
    throw new DBErrorException("getAuctionItemHistories", error);
  }
};

export const cancelItem = async (auction_id, auction_inventory_id, reason) => {
  try {
    const [auction_inventory] = await query(
      `
          SELECT
            ai.auction_inventory_id,
            ai.inventory_id,
            ai.auction_bidders_id,
            ai.price,
            ai.status,
            ab.service_charge,
            p.receipt_number,
            p.payment_id
          FROM auctions_inventories ai
          LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = ai.auction_bidders_id
          LEFT JOIN payments p ON p.payment_id = ai.payment_id
          WHERE ab.auction_id = ? AND ai.auction_inventory_id = ?
          AND ai.status IN ("PAID", "UNPAID");
        `,
      [auction_id, auction_inventory_id]
    );

    const hasHistory = await getAuctionItemHistories(
      auction_inventory.auction_inventory_id
    );
    if (!hasHistory.length) {
      // record current status
      await query(
        `
        INSERT INTO inventory_histories(auction_inventory_id, auction_status, payment_id)
        VALUES (?,?,?)
      `,
        [
          auction_inventory.auction_inventory_id,
          auction_inventory.status,
          auction_inventory.payment_id,
        ]
      );
    }

    // record proposed status
    await query(
      `
        INSERT INTO inventory_histories(auction_inventory_id, auction_status, remarks)
        VALUES (?,?,?)
      `,
      [
        auction_inventory.auction_inventory_id,
        "CANCELLED",
        reason ? reason : "NO REASON GIVEN",
      ]
    );

    // update inventory status from SOLD to REBID
    await query(
      `UPDATE inventories SET status = "REBID" WHERE inventory_id = ?`,
      [auction_inventory.inventory_id]
    );

    const computed_price =
      auction_inventory.price +
      (auction_inventory.price * auction_inventory.service_charge) / 100;
    if (auction_inventory.status === AUCTION_STATUS.PAID) {
      const payment = await query(
        `INSERT INTO payments (auction_bidders_id, purpose, amount_paid, receipt_number)
        VALUES (?, ?,?,?)`,
        [
          auction_inventory.auction_bidders_id,
          PAYMENT_PURPOSE.REFUNDED,
          computed_price * -1,
          auction_inventory.receipt_number,
        ]
      );

      await query(
        `
          UPDATE auctions_inventories
          SET status = "CANCELLED", payment_id = ?
          WHERE auction_inventory_id = ?
        `,
        [payment.insertId, auction_inventory.auction_inventory_id]
      );
    } else {
      await query(
        `
          UPDATE auctions_inventories
          SET status = "CANCELLED"
          WHERE auction_inventory_id = ?
        `,
        [auction_inventory.auction_inventory_id]
      );

      await query(
        `
          UPDATE auctions_bidders SET balance = balance - ${computed_price}
          WHERE auction_bidders_id = ?
        `,
        [auction_inventory.auction_bidders_id]
      );
    }

    return auction_inventory;
  } catch (error) {
    throw new DBErrorException("cancelItem", error);
  }
};

export const reassignAuctionItem = async (auction_inventory_id, new_bidder) => {
  try {
    const [auction_inventory] = await query(
      `
        SELECT
          ai.auction_inventory_id,
          ab.auction_bidders_id,
          ai.inventory_id,
          ai.status,
          ai.price,
          ab.service_charge,
          b.bidder_number
        FROM auctions_inventories ai
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = ai.auction_bidders_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        WHERE auction_inventory_id = ?
      `,
      [auction_inventory_id]
    );

    const hasHistory = await getAuctionItemHistories(
      auction_inventory.auction_inventory_id
    );
    if (!hasHistory.length) {
      // record current auction_inventory
      await query(
        `
          INSERT INTO inventory_histories(auction_inventory_id, auction_status, remarks)
          VALUES(?,?,?)
        `,
        [auction_inventory.auction_inventory_id, auction_inventory.status, null]
      );
    }

    // record proposed auction_inventory
    await query(
      `
        INSERT INTO inventory_histories(auction_inventory_id, auction_status, remarks)
        VALUES(?,?,?)
      `,
      [
        auction_inventory.auction_inventory_id,
        AUCTION_STATUS.DISCREPANCY,
        `TRANSFER FROM BIDDER ${auction_inventory.bidder_number} TO BIDDER ${new_bidder.bidder_number}`,
      ]
    );

    // update bidder_id and status in auctions_inventories
    await query(
      `
        UPDATE auctions_inventories
        SET auction_bidders_id = ?, status = "UNPAID"
        WHERE auction_inventory_id = ?
      `,
      [new_bidder.auction_bidders_id, auction_inventory.auction_inventory_id]
    );

    // update inventory status to "SOLD"
    await query(
      `
        UPDATE inventories
        SET status = "SOLD"
        WHERE inventory_id = ?
      `,
      [auction_inventory.inventory_id]
    );

    const new_bidder_computed_price =
      auction_inventory.price +
      (auction_inventory.price * new_bidder.service_charge) / 100;

    // update new bidder balance
    await query(
      `
        UPDATE auctions_bidders
        SET balance = balance + ${new_bidder_computed_price}
        WHERE auction_bidders_id = ?
      `,
      [new_bidder.auction_bidders_id]
    );

    return auction_inventory;
  } catch (error) {
    console.error(error);
    throw new DBErrorException("reassignAuctionItem", error);
  }
};

export const discountItem = async (auction_inventory_id, new_price) => {
  try {
    const [auction_inventory] = await query(
      `
        SELECT
          ai.auction_inventory_id,
          ai.auction_bidders_id,
          ai.status,
          ai.price,
          ab.service_charge,
          ab.balance,
          b.bidder_number,
          p.receipt_number
        FROM auctions_inventories ai
        LEFT JOIN auctions_bidders ab ON ab.auction_bidders_id = ai.auction_bidders_id
        LEFT JOIN bidders b ON b.bidder_id = ab.bidder_id
        LEFT JOIN payments p ON p.payment_id = ai.payment_id
        WHERE auction_inventory_id = ?
      `,
      [auction_inventory_id]
    );

    const hasHistory = await getAuctionItemHistories(
      auction_inventory.auction_inventory_id
    );
    if (!hasHistory.length) {
      // record current auction_inventory
      await query(
        `
          INSERT INTO inventory_histories(auction_inventory_id, auction_status, remarks)
          VALUES(?,?,?);
        `,
        [
          auction_inventory.auction_inventory_id,
          auction_inventory.status,
          `CURRENT MONITORING PRICE: ${formatNumberToCurrency(
            auction_inventory.price
          )}`,
        ]
      );
    }

    const computed_price =
      auction_inventory.price +
      (auction_inventory.price * auction_inventory.service_charge) / 100;

    let payment = null;
    const remarks_price = `${formatNumberToCurrency(
      auction_inventory.status === AUCTION_STATUS.PAID
        ? computed_price
        : auction_inventory.price
    )} ${
      auction_inventory.status === AUCTION_STATUS.PAID
        ? "(service charge included)"
        : ""
    }`;

    const inventory_history = [
      auction_inventory.auction_inventory_id,
      auction_inventory.status === AUCTION_STATUS.PAID
        ? AUCTION_STATUS.REFUNDED
        : AUCTION_STATUS.LESS,
      `UPDATED PRICE FROM ${remarks_price} to ${formatNumberToCurrency(
        new_price
      )}`,
    ];
    await query(
      `
        INSERT INTO inventory_histories(auction_inventory_id, auction_status, remarks)
        VALUES (?,?,?);
      `,
      inventory_history
    );

    if (auction_inventory.status === AUCTION_STATUS.PAID) {
      payment = await query(
        `
          INSERT INTO payments(auction_bidders_id, purpose, amount_paid, receipt_number, payment_type)
          VALUES (?,?,?,?,?)
        `,
        [
          auction_inventory.auction_bidders_id,
          AUCTION_STATUS.REFUNDED,
          computed_price * -1,
          auction_inventory.receipt_number,
          PAYMENT_TYPE.CASH,
        ]
      );
    } else {
      const new_balance =
        auction_inventory.balance -
        computed_price +
        (new_price + (new_price * auction_inventory.service_charge) / 100);

      console.log({
        new_balance,
        current_balance: auction_inventory.balance,
        prev_item_computed_price: computed_price,
        new_price,
        new_computed_price:
          new_price + (new_price * auction_inventory.service_charge) / 100,
      });
      await query(
        `
          UPDATE auctions_bidders
          SET balance = ${new_balance} 
          WHERE auction_bidders_id = ?
        `,
        [auction_inventory.auction_bidders_id]
      );
    }

    // update auction_inventories
    await query(
      `UPDATE auctions_inventories SET price = ?, payment_id = ? WHERE auction_inventory_id = ?`,
      [
        new_price,
        payment ? payment.insertId : null,
        auction_inventory.auction_inventory_id,
      ]
    );

    return auction_inventory;
  } catch (error) {
    console.error(error);
    throw new DBErrorException("discountItem", error);
  }
};

export const createAuctionInventory = async (auction_id, body) => {
  try {
    // get auction_bidder
    const [auction_bidder] = await query(
      `
        SELECT
          auction_bidders_id,
          service_charge,
          balance
        FROM auctions_bidders
        WHERE auction_id = ? AND bidder_id = ?
      `,
      [auction_id, body.bidder]
    );

    // if inventory exists
    let [inventory] = await query(
      `
        SELECT
          inventory_id,
          barcode,
          control_number
        FROM inventories
        WHERE barcode = ? AND status in ("UNSOLD", "REBID")
      `,
      [body.barcode]
    );

    let container_barcode = body.barcode.split("-");
    container_barcode =
      container_barcode.length === 3
        ? container_barcode.slice(0, -1).join("-")
        : body.barcode;

    // get container id based on barcode
    const [container] = await query(
      `SELECT container_id, barcode FROM containers WHERE barcode = ?`,
      [container_barcode]
    );

    const computed_balance =
      parseInt(auction_bidder.balance, 10) +
      (parseInt(body.price, 10) +
        (parseInt(body.price, 10) *
          parseInt(auction_bidder.service_charge, 10)) /
          100);

    console.log({
      auction_bidder,
      computed_balance,
      balance: parseInt(auction_bidder.balance, 10),
      price: parseInt(body.price, 10),
      service_charge: parseInt(auction_bidder.service_charge, 10),
    });

    let newly_inserted_auction_inventory = null;

    if (inventory) {
      // update inventory status to SOLD
      await query(
        `
          UPDATE inventories
          SET status = "SOLD"
          WHERE inventory_id = ?
        `,
        [inventory.inventory_id]
      );
    } else {
      // insert new inventory
      inventory = await query(
        `
          INSERT INTO INVENTORIES (container_id, description, control_number, barcode, status)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          container.container_id,
          body.description,
          body.control,
          body.barcode,
          "SOLD",
        ]
      );
    }

    await query(
      `
        UPDATE auctions_bidders
        SET balance = ${computed_balance}
        WHERE auction_bidders_id = ?;
      `,
      [auction_bidder.auction_bidders_id]
    );
    // increment container.num_of_items
    await query(
      `
      UPDATE containers
      SET num_of_items = num_of_items+1
      WHERE container_id = ?
      `,
      [container.container_id]
    );

    newly_inserted_auction_inventory = await query(
      `
        INSERT INTO auctions_inventories (auction_bidders_id, inventory_id, status, price, qty, manifest_number)
        VALUES (?,?,?,?,?, ?)
      `,
      [
        auction_bidder.auction_bidders_id,
        inventory.insertId ? inventory.insertId : inventory.inventory_id,
        "UNPAID",
        body.price,
        body.qty,
        "ADD_ON",
      ]
    );

    return await getAuctionItemDetails(
      newly_inserted_auction_inventory.insertId
    );
  } catch (error) {
    console.log(error);
    throw new DBErrorException("createAuctionInventory", error);
  }
};
