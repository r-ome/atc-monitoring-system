import express from "express";
import service from "../services/inventories.js";
const {
  getContainerInventories,
  createContainerInventory,
  updateContainerInventory,
  deleteInventory,
} = service;
import { logger } from "../logger.js";
const router = express.Router();
import {
  formatNumberPadding,
  sanitizeBarcode,
  formatNumberToCurrency,
} from "../utils/index.js";

router.get("/", async (req, res) => {
  try {
    let containerInventories = await getContainerInventories(req.container_id);
    containerInventories = containerInventories.map((item) => ({
      ...item,
      price: formatNumberToCurrency(item.price),
    }));
    res.status(200).send(containerInventories);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/", async (req, res) => {
  try {
    const { container_id } = req;
    let body = req.body;

    const containerInventory = await createContainerInventory(container_id, {
      ...body,
      barcode_number: sanitizeBarcode(body.barcode_number),
      control_number: formatNumberPadding(body.control_number, 4),
    });
    res.status(200).json({ status: "success", data: containerInventory });
  } catch (error) {
    logger.error({ error });
    res.status(500).json({ status: "fail", error });
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
