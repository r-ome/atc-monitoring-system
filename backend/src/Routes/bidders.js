const express = require("express");
const {
  getBidder,
  getBidderByBidderNumber,
  getBidders,
  createBidder,
  updateBidder,
  deleteBidder,
  addRequirement,
  getRequirements,
  getAuctionsJoined,
  getBidderPaymentHistory,
} = require("../services/bidders");
const { logger } = require("../logger");
const router = express.Router();
const Joi = require("joi");
const { formatNumberToCurrency } = require("../utils");

router.get("/:id", async (req, res) => {
  try {
    const bidders = await getBidder(req.params.id);
    if (bidders.length) {
      return res.status(200).json({ status: "success", data: bidders[0] });
    }

    return res
      .status(404)
      .json({ status: "fail", code: 404, message: "Bidder not found." });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const bidders = await getBidders();
    res.status(200).json({ status: "success", data: bidders });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.post("/", async (req, res) => {
  try {
    const bidders = await getBidderByBidderNumber(req.body.bidder_number);
    if (bidders.length) {
      return res.status(400).json({
        status: "fail",
        code: 400,
        errors: [
          {
            field: "bidder_number",
            message: "Bidder Number already exists",
          },
        ],
      });
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
      service_charge: Joi.number()
        .required()
        .messages({ "number.base": "Service Charge is required " }),
      old_number: Joi.number().valid(""),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      const errorDetails = error.details.map((err) => {
        console.log(err);
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

    const bidder = await createBidder(req.body);
    console.log({ bidder });
    res.status(200).json({ status: "success", data: bidder });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const bidderExists = await getBidder(req.params.id);
    if (!bidderExists.length) {
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
      service_charge: Joi.number()
        .required()
        .messages({ "number.base": "Service Charge is required " }),
      old_number: Joi.number().valid(""),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      const errorDetails = error.details.map((err) => {
        console.log(err);
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

router.get("/:id/requirements", async (req, res) => {
  try {
    const requirements = await getRequirements(req.params.id);
    res.status(200).json({ status: "success", data: requirements });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.post("/:id/requirements", async (req, res) => {
  try {
    const schema = Joi.object({
      bidder_id: Joi.string()
        .required()
        .messages({ "string.empty": "Bidder ID is required" }),
      name: Joi.string()
        .pattern(/^[a-zA-Z0-9\- ]+$/)
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
      bidder_id: req.params.id,
      ...req.body,
    });
    if (error) {
      const errorDetails = error.details.map((err) => {
        console.log(err);
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

    const requirements = await addRequirement({
      bidder_id: parseInt(req.params.id),
      name: req.body.name,
      url: req.body.url,
      validity_date: req.body.validity_date,
    });

    res.status(200).json({ status: "success", data: requirements });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
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

module.exports = router;