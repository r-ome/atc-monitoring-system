const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { logger, morganMiddleware } = require("./logger");
const {
  auctions,
  suppliers,
  containers,
  branches,
  inventories,
  bidders,
} = require("./Routes");

logger.info("STARTING APPLICATION");
app.use(bodyParser.json());
app.use(function (req, res, next) {
  req.bodyContent = JSON.stringify(req.body);
  next();
});
app.use(morganMiddleware);

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization,Cache-Control,Pragma,Expires",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/suppliers", suppliers);
suppliers.use(
  "/:supplier_id/containers",
  (req, res, next) => {
    req.supplier_id = req.params.supplier_id;
    next();
  },
  containers
);

containers.use(
  "/:container_id/inventories",
  (req, res, next) => {
    req.container_id = req.params.container_id;
    next();
  },
  inventories
);

app.use("/containers", containers);
app.use("/branches", branches);
app.use("/auctions", auctions);
app.use("/bidders", bidders);

app.get("/", (req, res) => {
  try {
    res.send("HELLO WORLD");
  } catch (err) {
    console.error("Error connecting to MySQL:", err);
    res.status(500).send("Error connecting to MySQL.");
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
