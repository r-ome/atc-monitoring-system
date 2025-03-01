import express from "express";
import Joi from "joi";
import supplierContainers from "./supplierContainers.js";
import {
  getSupplierByNameCode,
  getSupplier,
  getSuppliers,
  createSupplier,
} from "../services/suppliers.js";
import {
  renderHttpError,
  SUPPLIERS_401,
  SUPPLIERS_402,
  SUPPLIERS_403,
  SUPPLIERS_503,
  SUPPLIERS_501,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

const suppliers = express.Router();

suppliers.get("/:supplier_id", async (req, res) => {
  try {
    const { supplier_id } = req.params;
    const supplier = await getSupplier(supplier_id);
    if (supplier) {
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

suppliers.get("/", async (req, res) => {
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

suppliers.post("/", async (req, res) => {
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
    const supplier = await getSupplier(response.insertId);
    return res.status(200).json({ data: supplier });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? SUPPLIERS_501 : SUPPLIERS_503,
    });
  }
});

suppliers.use(
  "/:supplier_id/containers",
  (req, res, next) => {
    req.supplier_id = req.params.supplier_id;
    next();
  },
  supplierContainers
);

export default suppliers;
