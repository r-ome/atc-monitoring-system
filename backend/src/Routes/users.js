import express from "express";
import Joi from "joi";

import {
  getUsers,
  createUser,
  getUser,
  getUserByUsername,
} from "../services/users.js";
import {
  renderHttpError,
  USERS_401,
  USERS_402,
  USERS_501,
  USERS_503,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await getUsers();
    return res.status(200).json({ data: users });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? USERS_501 : USERS_503,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    // TO DO: ADD PASSWORD VALIDATION
    const schema = Joi.object({
      name: Joi.string()
        .pattern(/^[a-zA-Z\- ]+$/)
        .min(3)
        .max(255)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Name is required",
          "string.min": "Must be at least 3 characters ",
        }),
      username: Joi.string().allow("").optional(),
      role: Joi.string().valid("ADMIN", "CASHIER", "ENCODER"),
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
        error: USERS_401,
      });
    }

    // duplicate check
    const check = await getUserByUsername(body.username);
    if (check.length) {
      return renderHttpError(res, {
        log: `Duplicate entry for name:"${body.name}"`,
        error: USERS_402,
      });
    }
    const response = await createUser(body);
    const user = await getUser(response.insertId);
    return res.status(200).json({ data: user });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? USERS_501 : USERS_503,
    });
  }
});

export default router;
