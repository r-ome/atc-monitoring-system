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
              'purpose', p.purpose,
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
