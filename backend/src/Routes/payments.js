import express from "express";
import Joi from "joi";
import { getAuctionDetails } from "../services/auctions.js";
import {
  getAuctionPayments,
  handleBidderPullout,
  getBidderAuctionTransactions,
} from "../services/payments.js";
import {
  renderHttpError,
  AUCTION_PAYMENTS_401,
  AUCTION_PAYMENTS_501,
  AUCTION_PAYMENTS_503,
  AUCTION_PAYMENTS_403,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

const router = express.Router({ mergeParams: true });
// THIS ROUTE IS /auctions/{auction_id}/payments

router.get("/", async (req, res) => {
  try {
    const { auction_id } = req.params;
    const auction = await getAuctionDetails(auction_id);
    if (!auction) {
      return renderHttpError(res, {
        log: `Auction with ID:${auction_id} does not exist`,
        error: AUCTION_PAYMENTS_403,
      });
    }
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

router.post("/pull-out", async (req, res) => {
  try {
    const schema = Joi.object({
      auction_bidders_id: Joi.number().required().messages({
        "string.pattern.base": "Invalid characters",
        "number.empty": "Bidder ID is required",
      }),
      auction_inventory_ids: Joi.array()
        .items(Joi.number().required())
        .required(),
    });

    const { body } = req;
    // validation check
    const { error } = schema.validate(body);
    if (error) {
      const errorDetails = error.details.map((err) => {
        return {
          field: err.context.key,
          message: err.message,
        };
      });

      return renderHttpError(res, {
        log: JSON.stringify(errorDetails, null, 2),
        error: AUCTION_PAYMENTS_401,
      });
    }
    const { auction_bidders_id, auction_inventory_ids } = body;
    const payment = await handleBidderPullout(
      auction_bidders_id,
      auction_inventory_ids
    );
    return res.status(200).json({ data: payment });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION]
        ? AUCTION_PAYMENTS_501
        : AUCTION_PAYMENTS_503,
    });
  }
});

router.get("/:auction_bidders_id/transactions", async (req, res) => {
  try {
    const { auction_bidders_id } = req.params;
    const transactions = await getBidderAuctionTransactions(auction_bidders_id);

    return res.status(200).json({
      data: transactions,
    });
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
