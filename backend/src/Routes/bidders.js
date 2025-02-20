import express from "express";
import Joi from "joi";

import {
  getBidder,
  getBidderByBidderNumber,
  getBidders,
  createBidder,
  updateBidder,
  deleteBidder,
  addRequirement,
  getAuctionsJoined,
  getBidderPaymentHistory,
} from "../services/bidders.js";

import { logger } from "../logger.js";
import { formatNumberPadding, formatNumberToCurrency } from "../utils/index.js";
import {
  renderHttpError,
  BIDDERS_501,
  BIDDERS_503,
  BIDDERS_402,
  BIDDERS_401,
  BIDDER_REQUIREMENT_401,
  BIDDER_REQUIREMENT_501,
  BIDDER_REQUIREMENT_503,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

const router = express.Router();

router.get("/:bidder_id", async (req, res) => {
  try {
    const { bidder_id } = req.params;
    const bidder = await getBidder(bidder_id);
    if (!bidder) {
      return renderHttpError(res, {
        log: `Bidder with ID:${bidder_id} does not exist`,
        error: BIDDERS_402,
      });
    }

    return res.status(200).json({ data: bidder });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BIDDERS_501 : BIDDERS_503,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const bidders = await getBidders();
    return res.status(200).json({ data: bidders });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BIDDERS_501 : BIDDERS_503,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { body } = req;

    const schema = Joi.object({
      bidder_number: Joi.number()
        .required()
        .messages({ "number.base": "Bidder Number is required" }),
      first_name: Joi.string()
        .pattern(/^[a-zA-Z\- ]+$/)
        .min(2)
        .max(255)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Supplier Name is required",
          "string.min": "Must be at least 2 characters ",
        }),
      middle_name: Joi.string()
        .pattern(/^[a-zA-Z\- ]+$/)
        .allow(""),
      last_name: Joi.string()
        .pattern(/^[a-zA-Z\- ]+$/)
        .min(2)
        .max(255)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Supplier Name is required",
          "string.min": "Must be at least 2 characters ",
        }),
      old_number: Joi.number().valid(""),
    });

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
        error: BIDDERS_401,
      });
    }

    body.bidder_number = formatNumberPadding(body.bidder_number, 4);

    const bidders = await getBidderByBidderNumber(
      formatNumberPadding(body.bidder_number, 4)
    );
    if (bidders.length) {
      return renderHttpError(res, {
        log: `Bidder Number ${body.bidder_number} already exists!`,
        error: BIDDERS_402,
      });
    }
    const response = await createBidder(body);
    const bidder = await getBidder(response.insertId);
    return res.status(200).json({ data: bidder });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BIDDERS_501 : BIDDERS_503,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const bidderExists = await getBidder(req.params.id);
    if (!bidderExists) {
      res.status(404).json({ status: "fail", message: "Bidder not found" });
    }
    const schema = Joi.object({
      bidder_number: Joi.number()
        .required()
        .messages({ "number.base": "Bidder Number is required" }),
      first_name: Joi.string()
        .pattern(/^[a-zA-Z\- ]+$/)
        .min(3)
        .max(255)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Supplier Name is required",
          "string.min": "Must be at least 3 characters ",
        }),
      middle_name: Joi.string()
        .pattern(/^[a-zA-Z\- ]+$/)
        .allow(""),
      last_name: Joi.string()
        .pattern(/^[a-zA-Z\- ]+$/)
        .min(3)
        .max(255)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Supplier Name is required",
          "string.min": "Must be at least 3 characters ",
        }),
      old_number: Joi.number().valid(""),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      const errorDetails = error.details.map((err) => {
        return {
          field: err.context.key,
          message: err.message,
        };
      });

      logger.error(JSON.stringify(errorDetails, null, 2));
      return res.status(400).json({
        status: "fail",
        code: 400,
        errors: errorDetails,
      });
    }

    const bidder = await updateBidder(req.params.id, req.body);
    res.status(200).json({ status: "success", data: bidder });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const bidder = await deleteBidder(req.params.id);
    res.status(200).json({ status: "success" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

// create bidder requirements
router.post("/:bidder_id/requirements", async (req, res) => {
  try {
    const { bidder_id } = req.params;
    const { body } = req;
    const schema = Joi.object({
      bidder_id: Joi.string()
        .required()
        .messages({ "string.empty": "Bidder ID is required" }),
      name: Joi.string()
        .pattern(/^[a-zA-Z0-9\-'` ]+$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Requirement name is required",
        }),
      url: Joi.allow(""),
      validity_date: Joi.string()
        .required()
        .messages({ "string.empty": "Validity Date is required" }),
    });

    const { error } = schema.validate({
      bidder_id,
      ...body,
    });
    if (error) {
      const errorDetails = error.details.map((err) => ({
        field: err.context.key,
        message: err.message,
      }));
      return renderHttpError(res, {
        log: JSON.stringify(errorDetails, null, 2),
        error: BIDDER_REQUIREMENT_401,
      });
    }

    const requirements = await addRequirement({
      bidder_id,
      name: body.name,
      url: body.url,
      validity_date: body.validity_date,
    });

    return res.status(200).json({ data: requirements });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION]
        ? BIDDER_REQUIREMENT_501
        : BIDDER_REQUIREMENT_503,
    });
  }
});

router.get("/:bidder_id/auctions", async (req, res) => {
  try {
    const { bidder_id } = req.params;
    let auctions = await getAuctionsJoined(bidder_id);
    auctions = auctions.map((item) => ({
      ...item,
      total_price: formatNumberToCurrency(item.total_price),
    }));
    res.status(200).json({ status: "success", data: auctions });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.get("/:bidder_id/payments", async (req, res) => {
  try {
    const { bidder_id } = req.params;
    let payments = await getBidderPaymentHistory(bidder_id);
    payments = payments.map((item) => ({
      ...item,
      payment: formatNumberToCurrency(item.payment),
    }));
    res.status(200).json({ status: "success", data: payments });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

export default router;
