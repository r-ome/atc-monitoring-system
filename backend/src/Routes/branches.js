const express = require("express");
const {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("../services/branches");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const branches = await getBranches();
    res.status(200).send(branches);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/", async (req, res) => {
  try {
    const branch = await createBranch(req.body);
    res.status(200).send(branch);
  } catch (e) {
    res.status(500).send(e);
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

module.exports = router;
