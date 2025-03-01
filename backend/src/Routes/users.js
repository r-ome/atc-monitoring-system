import express from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import {
  getUsers,
  getUser,
  getUserByUsername,
  registerUser,
  updateUserPassword,
} from "../services/users.js";
import {
  renderHttpError,
  USERS_401,
  USERS_402,
  USERS_403,
  USERS_501,
  USERS_503,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";
import { USER_ROLES } from "./constants.js";

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

router.get("/me", async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await getUser(user_id);
    res.status(200).json({ data: user });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: "",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { body } = req;

    const is_superadmin = await getUser(req.user.user_id);

    let allowed_roles = ["ADMIN", "CASHIER", "ENCODER"];
    if (is_superadmin.role === USER_ROLES.SUPER_ADMIN) {
      allowed_roles = [...allowed_roles, "OWNER"];
    }

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
      username: Joi.string().required(),
      password: Joi.string().min(8).required(),
      role: Joi.string().valid(...allowed_roles),
    });

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
    const user = await getUserByUsername(body.username);
    if (user) {
      return renderHttpError(res, {
        log: `Duplicate entry for name:"${body.name}"`,
        error: USERS_402,
      });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const new_user = await registerUser(
      body.name,
      body.username,
      hashedPassword,
      body.role
    );
    return res.status(200).json({ data: new_user });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? USERS_501 : USERS_503,
    });
  }
});

router.post("/admin-confirm-password", async (req, res) => {
  try {
    const { body } = req;
    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      role: Joi.string().valid(
        USER_ROLES.SUPER_ADMIN,
        USER_ROLES.OWNER,
        USER_ROLES.ADMIN
      ),
    });

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

    const user = await getUserByUsername(body.username);
    if (!user) {
      return renderHttpError(res, {
        log: `User with username: ${body.username} doesn't exist!`,
        error: USERS_403,
      });
    }

    if (![USER_ROLES.ADMIN, USER_ROLES.OWNER].includes(user.role)) {
      return renderHttpError(res, {
        log: `User ${body.username} not authorized`,
        error: USERS_401,
      });
    }

    const is_match = await bcrypt.compare(body.password, user.password);
    if (!is_match) {
      return renderHttpError(res, {
        log: `Password didn't match the user with username ${body.username}`,
        error: USERS_401,
      });
    }

    return res.status(200).json({ data: "ok" });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? USERS_501 : USERS_503,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { body } = req;
    const schema = Joi.object({
      username: Joi.string().required(),
      new_password: Joi.string().required(),
    });

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

    const user = await getUserByUsername(body.username);
    if (!user) {
      return renderHttpError(res, {
        log: `User with username: ${body.username} doesn't exist!`,
        error: USERS_403,
      });
    }

    const hashedPassword = await bcrypt.hash(body.new_password, 10);
    const newly_updated_user = await updateUserPassword(
      user.user_id,
      hashedPassword
    );
    return res.status(200).json({ data: newly_updated_user });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? USERS_501 : USERS_503,
    });
  }
});

export default router;
