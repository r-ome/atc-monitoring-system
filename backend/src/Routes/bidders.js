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
  BIDDERS_401,
  BIDDERS_402,
  BIDDERS_403,
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
      birthdate: Joi.string().required(),
      status: Joi.string().required(),
      registration_fee: Joi.number().required(),
      service_charge: Joi.number().required(),
      registered_at: Joi.string().required(),
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
    const bidder = await createBidder(body);
    return res.status(200).json({ data: bidder });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BIDDERS_501 : BIDDERS_503,
    });
  }
});

router.put("/:bidder_id", async (req, res) => {
  try {
    const { bidder_id } = req.params;
    const { body } = req;

    const doesExists = await getBidder(bidder_id);
    if (!doesExists) {
      return renderHttpError(res, {
        log: `Bidder with ID ${bidder_id} does not exist!`,
        error: BIDDERS_403,
      });
    }

    const schema = Joi.object({
      first_name: Joi.string()
        .pattern(/^[a-zA-Z\-ñÑ ]+$/)
        .max(255)
        .required(),
      middle_name: Joi.string()
        .pattern(/^[a-zA-Z\-ñÑ ]+$/)
        .allow(""),
      last_name: Joi.string()
        .pattern(/^[a-zA-Z\-ñÑ]+$/)
        .max(255)
        .required(),
      birthdate: Joi.string().required(),
      service_charge: Joi.number().required(),
      registration_fee: Joi.number().required(),
      contact_number: Joi.string().required(),
      status: Joi.string().required(),
      remarks: Joi.string(),
    });

    const { error } = schema.validate(body);
    if (error) {
      const errorDetails = error.details.map((err) => ({
        field: err.context.key,
        message: err.message,
      }));

      return renderHttpError(res, { log: errorDetails, error: BIDDERS_401 });
    }
    const bidder = await updateBidder(bidder_id, body);
    return res.status(200).json({ data: bidder });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BIDDERS_501 : BIDDERS_503,
    });
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
