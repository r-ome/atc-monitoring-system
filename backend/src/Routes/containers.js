const express = require("express");
const {
  getContainers,
  getContainersBySupplier,
  createContainer,
  updateContainer,
  deleteContainer,
  getContainer,
} = require("../services/containers");
const { logger } = require("../logger");
const Joi = require("joi");

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  try {
    const containers = await getContainersBySupplier(req.params.supplier_id);
    res.status(200).json({ status: "success", data: containers });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.post("/", async (req, res) => {
  try {
    const schema = Joi.object({
      supplier_id: Joi.number()
        .required()
        .messages({ "number.base": "Supplier field is required" }),
      branch_id: Joi.number()
        .required()
        .messages({ "number.base": "Branch field is required" }),
      container_num: Joi.number()
        .required()
        .messages({ "number.base": "Container Number is required" }),
      bill_of_lading_number: Joi.string()
        .alphanum()
        .required()
        .messages({ "string.empty": "Bill of Lading is required" }),
      port_of_landing: Joi.string()
        .alphanum()
        .required()
        .messages({ "string.empty": "Port of Landing is required" }),
      carrier: Joi.string()
        .alphanum()
        .required()
        .messages({ "string.empty": "Carrier is required" }),
      vessel: Joi.string()
        .alphanum()
        .required()
        .messages({ "string.empty": "Vessel is required" }),
      invoice_num: Joi.string()
        .alphanum()
        .required()
        .messages({ "string.empty": "Invoice Number is required" }),
      gross_weight: Joi.string()
        .alphanum()
        .required()
        .messages({ "string.empty": "Gross Weight is required" }),
      auction_or_sell: Joi.string()
        .valid("AUCTION", "SELL")
        .required()
        .messages({ "string.empty": "Gross Weight is required" }),
      telegraphic_transferred: Joi.string()
        .required()
        .messages({ "string.empty": "Telegraphic Transferred is required" }),
      arrival_date_warehouse_ph: Joi.string()
        .required()
        .messages({ "string.empty": "Arrival Date to PH is required" }),
      departure_date_from_japan: Joi.string()
        .required()
        .messages({ "string.empty": "Departure Date from JP is required" }),
      eta_to_ph: Joi.string()
        .required()
        .messages({ "string.empty": "ETA to PH is required" }),
      sorting_date: Joi.string()
        .required()
        .messages({ "string.empty": "Sorting Date is required" }),
      auction_date: Joi.string()
        .required()
        .messages({ "string.empty": "Auction Date is required" }),
      payment_date: Joi.string()
        .required()
        .messages({ "string.empty": "Payment Date is required" }),
      vanning_date: Joi.string()
        .required()
        .messages({ "string.empty": "Vanning Date is required" }),
      devanning_date: Joi.string()
        .required()
        .messages({ "string.empty": "Devanning Date is required" }),
    });

    const { error } = schema.validate({
      supplier_id: req.params.supplier_id,
      ...req.body,
    });
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

    const container = await createContainer(req.params.supplier_id, req.body);
    res.status(200).json({ status: "success", data: container });
  } catch (error) {
    logger.error({ error });
    res.status(500).json({ status: "fail", error });
  }
});

router.put("/:container_id", async (req, res) => {
  try {
    const containerExists = await getContainer(req.params.container_id);
    if (!containerExists.length) {
      res.status(404).json({
        status: "fail",
        message: `Container not found`,
      });
    }

    const container = await updateContainer(req.params.container_id, req.body);
    res.status(200).json({ status: "success", data: container });
  } catch (error) {
    logger.error({ error });
    res.status(500).json({ status: "fail", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const containerExists = await getContainer(req.params.id);
    if (!containerExists.length) {
      res.status(404).json({
        status: "fail",
        message: `Container not found`,
      });
    }
    const container = await deleteContainer(req.params.id);
    res.status(200).json({ status: "success", container });
  } catch (error) {
    logger.error({ error });
    res.status(500).json({ status: "fail", error });
  }
});

router.get("/all", async (req, res) => {
  try {
    const containers = await getContainers();
    res.status(200).json({ status: "success", data: containers });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

module.exports = router;
