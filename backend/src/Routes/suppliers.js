const express = require("express");
const {
  getSupplier,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../services/suppliers");
const router = express.Router();
const { logger } = require("../logger");
const Joi = require("joi");

router.get("/:id", async (req, res) => {
  try {
    const supplier = await getSupplier(req.params.id);
    res.status(200).json({ status: "success", data: supplier[0] });
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ status: "fail", code: 500, error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const suppliers = await getSuppliers();
    res.status(200).json({ status: "success", data: suppliers });
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ status: "fail", code: 500, error: "Internal Server Error" });
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

    const response = await createSupplier(req.body);
    const [supplier] = await getSupplier(response.insertId);
    res.status(200).json({ status: "success", data: supplier });
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ status: "fail", code: 500, error: "Internal Server Error" });
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

module.exports = router;
