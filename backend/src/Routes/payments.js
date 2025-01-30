import express from "express";
import Joi from "joi";
import { getAuctionPayments } from "../services/payments.js";
import {
  renderHttpError,
  AUCTION_PAYMENTS_501,
  AUCTION_PAYMENTS_503,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

const router = express.Router({ mergeParams: true });
// THIS ROUTE IS /auctions/{auction_id}/payments

router.get("/", async (req, res) => {
  try {
    const { auction_id } = req.params;
    const payments = await getAuctionPayments(auction_id);
    return res.status(200).json({ data: payments });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION]
        ? AUCTION_PAYMENTS_501
        : AUCTION_PAYMENTS_503,
    });
  }
});

export default router;
