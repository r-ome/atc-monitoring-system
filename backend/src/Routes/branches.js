import express from "express";
import Joi from "joi";

import {
  getBranch,
  getBranchByName,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../services/branches.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

import {
  renderHttpError,
  BRANCHES_401,
  BRANCHES_402,
  BRANCHES_501,
  BRANCHES_503,
  BRANCHES_403,
} from "./error_infos.js";

const router = express.Router();

router.get("/:branch_id", async (req, res) => {
  try {
    const { branch_id } = req.params;
    const [branch] = await getBranch(branch_id);
    if (!branch) {
      return renderHttpError(res, {
        log: `Branch with ID: ${branch_id} does not exist`,
        error: BRANCHES_403,
      });
    }
    return res.status(200).json({ data: branch });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BRANCHES_501 : BRANCHES_503,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const branches = await getBranches();
    return res.status(200).send({ data: branches });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BRANCHES_501 : BRANCHES_503,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { body } = req;
    const schema = Joi.object({
      name: Joi.string()
        .pattern(/^[a-zA-Z0-9Ññ\- ]+$/)
        .min(3)
        .max(255)
        .required()
        .messages({
          "string.pattern.base": "Invalid characters",
          "string.empty": "Branch Name is required",
          "string.min": "Must be at least 3 characters ",
        }),
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
        error: BRANCHES_401,
      });
    }

    // duplicate check
    const check = await getBranchByName(body.name);
    if (check.length) {
      return renderHttpError(res, {
        log: `Duplicate entry for name:"${body.name}"`,
        error: BRANCHES_402,
      });
    }

    const response = await createBranch(req.body);
    const [branch] = await getBranch(response.insertId);
    return res.status(200).json({ data: branch });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BRANCHES_501 : BRANCHES_503,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const branch = await updateBranch(req.params.id, req.body);
    return es.status(200).send(branch);
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BRANCHES_501 : BRANCHES_503,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const branch = await deleteBranch(req.params.id);
    return res.status(200).send(branch);
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? BRANCHES_501 : BRANCHES_503,
    });
  }
});

export default router;
