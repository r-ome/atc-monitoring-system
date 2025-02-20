import express from "express";
import Joi from "joi";

import {
  getContainerInventories,
  createContainerInventory,
  updateContainerInventory,
  deleteInventory,
} from "../services/inventories.js";
import { formatNumberPadding } from "../utils/index.js";
import {
  INVENTORIES_401,
  INVENTORIES_403,
  INVENTORIES_501,
  INVENTORIES_503,
  renderHttpError,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";
import { getContainer } from "../services/containers.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { container_id } = req;
    const container = await getContainer(container_id);
    if (!container) {
      return renderHttpError(res, {
        log: `Container with ID: ${container_id} does not exist.`,
        error: INVENTORIES_403,
      });
    }

    const inventories = await getContainerInventories(container_id);
    return res.status(200).json({ data: inventories });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? INVENTORIES_501 : INVENTORIES_503,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { container_id } = req;
    const { body } = req;

    const schema = Joi.object({
      barcode: Joi.string()
        .pattern(/^[a-zA-Z0-9\- ]+$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Barcode is required",
        }),
      control_number: Joi.string()
        .pattern(/^[0-9 ]+$/)
        .allow("")
        .messages({
          "string.pattern.base": "Invalid characters",
        }),
      description: Joi.string()
        .pattern(/^[a-zA-Z0-9\-. ]+$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Description is required",
        }),
      url: Joi.allow(""),
    });

    const container = await getContainer(container_id);
    if (!container) {
      return renderHttpError(res, {
        log: `Container with ID: ${container_id} does not exist.`,
        error: INVENTORIES_403,
      });
    }

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
        error: INVENTORIES_401,
      });
    }

    const inventory = await createContainerInventory(container_id, {
      ...body,
      description: body.description.toUpperCase(),
      barcode_number:
        container.barcode + "-" + formatNumberPadding(body.barcode),
      // barcode_number: sanitizeBarcode(body.barcode),
      control_number: formatNumberPadding(body.control_number, 4),
    });
    return res.status(200).json({ data: inventory });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? INVENTORIES_501 : INVENTORIES_501,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const inventory = await updateContainerInventory(
      req.container_id,
      req.params.id,
      req.body
    );
    res.status(200).send(inventory);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const inventory = await deleteInventory(req.params.id);
    res.status(200).send(inventory);
  } catch (e) {
    res.status(500).send(e);
  }
});

export default router;
