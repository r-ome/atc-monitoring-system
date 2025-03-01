import express from "express";
import Joi from "joi";
import { getSupplier } from "../services/suppliers.js";
import { getBranch } from "../services/branches.js";
import {
  getContainersBySupplier,
  createContainer,
  getContainer,
  getBarcodesFromContainers,
} from "../services/containers.js";

import {
  renderHttpError,
  CONTAINERS_401,
  CONTAINERS_402,
  CONTAINERS_403,
  CONTAINERS_501,
  CONTAINERS_503,
} from "./error_infos.js";
import inventories from "./inventories.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";
import { formatNumberPadding } from "../utils/index.js";

const supplierContainers = express.Router({ mergeParams: true });
// THIS ROUTE IS /suppliers/{supplier_id}/containers
supplierContainers.use(
  "/:container_id/inventories",
  (req, res, next) => {
    req.container_id = req.params.container_id;
    next();
  },
  inventories
);

supplierContainers.get("/", async (req, res) => {
  try {
    const { supplier_id } = req.params;
    const containers = await getContainersBySupplier(supplier_id);
    res.status(200).json({ data: containers });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? CONTAINERS_501 : CONTAINERS_503,
    });
  }
});

supplierContainers.get("/:container_id", async (req, res) => {
  try {
    const { supplier_id, container_id } = req.params;
    const container = await getContainer(container_id);
    if (!container) {
      return renderHttpError(res, {
        log: `Container with ID:${container_id} does not exist`,
        error: CONTAINERS_403,
      });
    }

    if (container.supplier.supplier_id !== parseInt(supplier_id, 10)) {
      return renderHttpError(res, {
        log: `Container with ID:${container_id} does not belong to Supplier with ID:${supplier_id}`,
        error: CONTAINERS_403,
      });
    }
    return res.status(200).json({ data: container });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? CONTAINERS_501 : CONTAINERS_503,
    });
  }
});

supplierContainers.post("/", async (req, res) => {
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

      return renderHttpError(res, {
        log: JSON.stringify(errorDetails, null, 2),
        error: CONTAINERS_401,
      });
    }

    // validate if supplier exists
    const supplier = await getSupplier(supplier_id);
    if (!supplier) {
      return renderHttpError(res, {
        log: `Supplier with ID:${supplier_id} does not exist`,
        error: CONTAINERS_403,
      });
    }
    // validate if branch exists
    const branch = await getBranch(body.branch_id);
    if (!branch) {
      return renderHttpError(res, {
        log: `Branch with ID:${body.branch_id} does not exist`,
        error: CONTAINERS_403,
      });
    }

    // validate if barcode exists
    let container_barcodes = await getBarcodesFromContainers();
    container_barcodes = container_barcodes.map((item) => item.barcode);
    const barcode = `${supplier.supplier_code}-${formatNumberPadding(
      body.container_num,
      3
    )}`;
    if (container_barcodes.includes(barcode)) {
      return renderHttpError(res, {
        log: `Container with barcode ${barcode} already exists!`,
        error: CONTAINERS_402,
      });
    }

    const container = await createContainer(supplier_id, body);
    return res.status(200).json({ data: container });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? CONTAINERS_501 : CONTAINERS_503,
    });
  }
});

export default supplierContainers;
