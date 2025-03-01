import express from "express";
import Joi from "joi";
import { getAuctionDetails } from "../services/auctions.js";
import {
  getPaymentDetails,
  getAuctionPayments,
  handleBidderPullout,
  getBidderAuctionTransactions,
  refundRegistrationFee,
  settlePartialPayment,
} from "../services/payments.js";
import {
  renderHttpError,
  AUCTION_PAYMENTS_401,
  AUCTION_PAYMENTS_402,
  AUCTION_PAYMENTS_501,
  AUCTION_PAYMENTS_503,
  AUCTION_PAYMENTS_403,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

const router = express.Router({ mergeParams: true });
// THIS ROUTE IS /auctions/:auction_id/payments

router.get("/:payment_id", async (req, res) => {
  try {
    const { auction_id, payment_id } = req.params;
    const auction = await getAuctionDetails(auction_id);
    if (!auction) {
      return renderHttpError(res, {
        log: `Auction with ID:${auction_id} does not exist`,
        error: AUCTION_PAYMENTS_403,
      });
    }

    const payment = await getPaymentDetails(payment_id);
    if (!payment) {
      return renderHttpError(res, {
        log: `Payment with ID:${payment_id} does not exist`,
        error: AUCTION_PAYMENTS_403,
      });
    }

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

// HANDLE PULL OUT PAYMENT
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
      amount_paid: Joi.number().allow(null),
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

    const { auction_bidders_id, auction_inventory_ids, amount_paid } = body;
    const payment = await handleBidderPullout(
      auction_bidders_id,
      auction_inventory_ids,
      amount_paid
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

// GET BIDDER-AUCTION TRANSACTIONS
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

// REFUND REGISTRATION_FEE
router.post("/:auction_bidders_id/refund-registration", async (req, res) => {
  try {
    const { auction_bidders_id } = req.params;
    const result = await refundRegistrationFee(auction_bidders_id);
    if (!result) {
      return renderHttpError(res, {
        log: "Bidder already refunded his/her registration fee!",
        error: AUCTION_PAYMENTS_402,
      });
    }

    return res.status(200).json({ data: result });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION]
        ? AUCTION_PAYMENTS_501
        : AUCTION_PAYMENTS_503,
    });
  }
});

router.post("/:payment_id/settle-partial-payment", async (req, res) => {
  try {
    const { payment_id } = req.params;
    const result = await settlePartialPayment(payment_id);
    return res.status(200).json({ data: result });
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
