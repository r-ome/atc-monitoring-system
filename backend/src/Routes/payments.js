import express from "express";
import Joi from "joi";
import { getRegisteredBidders } from "../services/auctions.js";
import {
  getAuctionPayments,
  handleBidderPullout,
} from "../services/payments.js";
import {
  renderHttpError,
  AUCTION_PAYMENTS_401,
  AUCTION_PAYMENTS_403,
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

router.post("/pull-out", async (req, res) => {
  try {
    const schema = Joi.object({
      auction_bidders_id: Joi.string().required().messages({
        "string.pattern.base": "Invalid characters",
        "string.empty": "Bidder ID is required",
        "string.min": "Must be at least 3 characters ",
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

export default router;
