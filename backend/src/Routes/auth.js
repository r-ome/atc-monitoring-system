import express from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  getUser,
  getUserByUsername,
  createSuperAdmin,
} from "../services/users.js";
import {
  renderHttpError,
  USERS_401,
  USERS_501,
  USERS_503,
} from "./error_infos.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    res.send("HELLO WORLD");
  } catch (err) {
    console.error("Error connecting to MySQL:", err);
    res.status(500).send("Error connecting to MySQL.");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { body } = req;
    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
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

    // user validation (if exists)
    const user = await getUserByUsername(body.username);
    if (!user) {
      return renderHttpError(res, {
        log: `User with username: ${body.username} doesnt exist!`,
        error: USERS_401,
      });
    }

    const is_match = await bcrypt.compare(body.password, user.password);
    if (!is_match) {
      return renderHttpError(res, {
        log: `Invalid Password for ${body.username}`,
        error: USERS_401,
      });
    }

    const loggedInUser = await getUser(user.user_id);
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // Set true in production (HTTPS required)
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Successfully Logged In!",
      token,
      data: loggedInUser,
    });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? USERS_501 : USERS_503,
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out Successfully" });
});

router.post("/create-super-admin", async (req, res) => {
  try {
    if (process.env.SUPER_ADMIN_PASSWORD) {
      const password = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);
      const result = await createSuperAdmin(password);
      if (!result) {
        return renderHttpError(res, {
          log: "SUPERADMIN already exists!",
          error: USERS_501,
        });
      }
      return res.status(200).json({ data: "ok" });
    }

    return renderHttpError(res, { log: "NO ENV FOUND", error: USERS_503 });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? USERS_501 : USERS_503,
    });
  }
});

export default router;
