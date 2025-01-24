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
import { logger } from "../logger.js";
import { BRANCHES_400, BRANCHES_500 } from "./error_infos.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const branches = await getBranches();
    res.status(200).send({ data: branches });
  } catch (error) {
    logger.error({ error });
    res.status(500).send(BRANCHES_500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { body } = req;
    const schema = Joi.object({
      name: Joi.string()
        .pattern(/^[a-zA-Z0-9\- ]+$/)
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
        console.log(err);
        return {
          field: err.context.key,
          message: err.message,
        };
      });

      logger.error(JSON.stringify(errorDetails, null, 2));
      return res.status(400).json(BRANCHES_400);
    }

    // duplicate check
    const check = await getBranchByName(body.name);
    if (check.length) {
      logger.error({
        message: `Duplicate entry for name:"${body.name}"`,
      });
      return res.status(400).json(BRANCHES_400);
    }

    const response = await createBranch(req.body);
    const [branch] = await getBranch(response.insertId);
    res.status(200).json({ data: branch });
  } catch (error) {
    logger.error({ error });
    res.status(500).send(BRANCHES_500);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const branch = await updateBranch(req.params.id, req.body);
    res.status(200).send(branch);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const branch = await deleteBranch(req.params.id);
    res.status(200).send(branch);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

export default router;
