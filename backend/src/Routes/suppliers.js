import express from "express";
import Joi from "joi";

import {
  getSupplierByNameCode,
  getSupplier,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/suppliers.js";
import { logger } from "../logger.js";
import {
  renderHttpError,
  SUPPLIERS_401,
  SUPPLIERS_402,
  SUPPLIERS_403,
  SUPPLIERS_503,
  SUPPLIERS_501,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

const router = express.Router();

router.get("/:supplier_id", async (req, res) => {
  try {
    const { supplier_id } = req.params;
    const suppliers = await getSupplier(supplier_id);
    if (suppliers.length) {
      let supplier = suppliers[0];
      return res.status(200).json({ data: supplier });
    } else {
      return renderHttpError(res, {
        log: `Supplier with ID:${supplier_id} does not exist`,
        error: SUPPLIERS_403,
      });
    }
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? SUPPLIERS_501 : SUPPLIERS_503,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const suppliers = await getSuppliers();
    return res.status(200).json({ data: suppliers });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? SUPPLIERS_501 : SUPPLIERS_503,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string()
        .pattern(/^[a-zA-Z0-9\- ]+$/)
        .min(3)
        .max(255)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Supplier Name is required",
          "string.min": "Must be at least 3 characters ",
        }),
      japanese_name: Joi.string().allow("").optional(),
      supplier_code: Joi.string().min(1).max(255).required().messages({
        "string.pattern.base": "Invalid characters",
        "string.empty": "Supplier Code is required",
        "string.min": "Must be at least 1 characters ",
      }),
      shipper: Joi.string().min(3).max(255).required().messages({
        "string.pattern.base": "Invalid characters",
        "string.empty": "Supplier Code is required",
        "string.min": "Must be at least 3 characters ",
      }),
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
        error: SUPPLIERS_401,
      });
    }

    // duplicate check
    const check = await getSupplierByNameCode(body.name, body.supplier_code);
    if (check.length) {
      return renderHttpError(res, {
        log: `Duplicate entry for name:"${body.name}" OR code:"${body.supplier_code}"`,
        error: SUPPLIERS_402,
      });
    }
    const response = await createSupplier(body);
    const [supplier] = await getSupplier(response.insertId);
    return res.status(200).json({ data: supplier });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? SUPPLIERS_501 : SUPPLIERS_503,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string()
        .pattern(/^[a-zA-Z0-9\- ]+$/)
        .min(3)
        .max(255)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Supplier Name is required",
          "string.min": "Must be at least 3 characters ",
        }),
      japanese_name: Joi.string().allow("").optional(),
      supplier_code: Joi.string().min(1).max(255).required().messages({
        "string.pattern.base": "Invalid characters",
        "string.empty": "Supplier Code is required",
        "string.min": "Must be at least 3 characters ",
      }),
      num_of_containers: Joi.number()
        .required()
        .messages({ "number.base": "Should be a number" }),
      shipper: Joi.string().min(3).max(255).required().messages({
        "string.pattern.base": "Invalid characters",
        "string.empty": "Supplier Code is required",
        "string.min": "Must be at least 3 characters ",
      }),
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

    await updateSupplier(req.params.id, req.body);
    const [supplier] = await getSupplier(req.params.id);
    res.status(200).json({ status: "success", data: supplier });
  } catch (error) {
    res
      .status(500)
      .json({ status: "fail", code: 500, error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supplier = await deleteSupplier(req.params.id);
    res.status(200).json({ status: "success", data: supplier });
  } catch (error) {
    res
      .status(500)
      .json({ status: "fail", code: 500, error: "Internal Server Error" });
  }
});

export default router;
