import express from "express";
import Joi from "joi";

import { getSupplier } from "../services/suppliers.js";
import { getBranch } from "../services/branches.js";
import {
  getContainers,
  getContainersBySupplier,
  createContainer,
  updateContainer,
  deleteContainer,
  getContainer,
} from "../services/containers.js";
import { logger } from "../logger.js";
import { CONTAINERS_400, CONTAINERS_500 } from "./error_infos.js";

const router = express.Router({ mergeParams: true });
// THIS ROUTE IS /suppliers/{supplier_id}/containers

router.get("/", async (req, res) => {
  try {
    const { supplier_id } = req.params;
    const [containers] = await getContainersBySupplier(supplier_id);
    res.status(200).json({ data: containers });
  } catch (error) {
    logger.error(error);
    res.status(500).json(CONTAINERS_500);
  }
});

router.get("/:container_id", async (req, res) => {
  try {
    const { supplier_id, container_id } = req.params;
    const [container] = await getContainer(container_id);
    if (!container) {
      logger.error({
        message: `Container with ID:${container_id} does not exist`,
      });
      return res.status(400).json(CONTAINERS_400);
    }

    if (container.supplier.id !== container_id) {
      logger.error({
        message: `Container with ID:${container_id} does not belong to Supplier with ID:${supplier_id}`,
      });
      return res.status(400).json(CONTAINERS_400);
    }
    return res.status(200).json({ data: container });
  } catch (error) {
    logger.error(error);
    return res.status(500).json(CONTAINERS_500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { supplier_id } = req.params;
    const { body } = req;
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
        .pattern(/^[a-zA-Z0-9\- ]+$/)
        .required()
        .messages({ "string.empty": "Carrier is required" }),
      vessel: Joi.string()
        .pattern(/^[a-zA-Z0-9\- ]+$/)
        .required()
        .messages({ "string.empty": "Vessel is required" }),
      invoice_num: Joi.string()
        .pattern(/^[a-zA-Z0-9\- ]+$/)
        .required()
        .messages({ "string.empty": "Invoice Number is required" }),
      gross_weight: Joi.string()
        .pattern(/^[a-zA-Z0-9\- ]+$/)
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

    const { error } = schema.validate({ supplier_id, ...body });
    if (error) {
      const errorDetails = error.details.map((err) => {
        return {
          field: err.context.key,
          message: err.message,
        };
      });

      logger.error(JSON.stringify(errorDetails, null, 2));
      return res.status(400).json(CONTAINERS_400);
    }

    // validate if supplier exists
    const suppliers = await getSupplier(supplier_id);
    if (!suppliers.length) {
      logger.error(`Supplier with ID:${supplier_id} does not exist`);
      return res.status(400).json(CONTAINERS_400);
    }
    // validate if branch exists
    const branches = await getBranch(body.branch_id);
    if (!branches.length) {
      logger.error(`Branch with ID:${body.branch_id} does not exist`);
      return res.status(400).json(CONTAINERS_400);
    }

    const container = await createContainer(supplier_id, body);
    return res.status(200).json({ data: container });
  } catch (error) {
    logger.error({ error });
    return res.status(500).json(CONTAINERS_500);
  }
});

router.put("/:container_id", async (req, res) => {
  try {
    const { container_id } = req.params;
    const containerExists = await getContainer(container_id);
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

export default router;
