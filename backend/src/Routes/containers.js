import express from "express";
import Joi from "joi";
import { getContainers, getContainer } from "../services/containers.js";
import {
  getInventory,
  getContainerInventories,
  createContainerInventory,
} from "../services/inventories.js";
import {
  renderHttpError,
  INVENTORIES_401,
  INVENTORIES_402,
  INVENTORIES_501,
  INVENTORIES_503,
  CONTAINERS_403,
  CONTAINERS_501,
  CONTAINERS_503,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

const router = express.Router({ mergeParams: true });
// THIS ROUTE IS /containers

router.get("/", async (req, res) => {
  try {
    const containers = await getContainers();
    res.status(200).json({ data: containers });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? CONTAINERS_501 : CONTAINERS_503,
    });
  }
});

router.get("/:container_id", async (req, res) => {
  try {
    const { container_id } = req.params;
    const container = await getContainer(container_id);
    res.status(200).json({ data: container });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? CONTAINERS_501 : CONTAINERS_503,
    });
  }
});

router.get("/:container_id/inventories", async (req, res) => {
  try {
    const { container_id } = req.params;
    const container = await getContainer(container_id);
    if (!container) {
      return renderHttpError(res, {
        log: `Container with ID: ${container_id} does not exist.`,
        error: CONTAINERS_403,
      });
    }

    const inventories = await getContainerInventories(container_id);
    return res.status(200).json({ data: inventories });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? CONTAINERS_501 : CONTAINERS_503,
    });
  }
});

router.post("/:container_id/inventories", async (req, res) => {
  try {
    const { container_id } = req.params;
    const { body } = req;

    const schema = Joi.object({
      barcode: Joi.string()
        .pattern(/^[a-zA-Z0-9\- ]+$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Barcode is required",
        }),
      control: Joi.string()
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
        error: CONTAINERS_403,
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

    const containerInventories = await getContainerInventories(container_id);
    const doesExist = containerInventories.find(
      (item) => item.barcode === body.barcode
    );
    if (doesExist) {
      return renderHttpError(res, {
        log: `Inventory with barcode ${body.barcode} already exists!`,
        error: INVENTORIES_402,
      });
    }

    const inventory = await createContainerInventory(container_id, body);
    return res.status(200).json({ data: inventory });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? INVENTORIES_501 : INVENTORIES_503,
    });
  }
});

router.get("/inventories/:inventory_id", async (req, res) => {
  try {
    const { inventory_id } = req.params;
    const inventory = await getInventory(inventory_id);
    return res.status(200).json({ data: inventory });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? CONTAINERS_501 : CONTAINERS_503,
    });
  }
});

// UPDATE INVENTORY
router.put("/inventories/:inventory_id", async (req, res) => {
  try {
    const { inventory_id } = req.params;

    const schema = Joi.object({
      barcode: Joi.string().required(),
      control: Joi.string().required(),
    });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? INVENTORIES_501 : INVENTORIES_503,
    });
  }
});

export default router;
