import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import cors from "cors";
import bodyParser from "body-parser";
import { logger, morganMiddleware } from "./logger.js";
import {
  auctions,
  suppliers,
  containers,
  branches,
  inventories,
  bidders,
  payments,
  users,
} from "./Routes/index.js";
import { FILE_UPLOAD_ERROR_EXCEPTION } from "./utils/index.js";
import {
  renderHttpError,
  FILE_UPLOAD_401,
  SYSTEM_503,
} from "./Routes/error_infos.js";

logger.info("STARTING APPLICATION");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
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

auctions.use(
  "/:auction_id/payments",
  (req, res, next) => {
    req.auction_id = req.params.auction_id;
    next();
  },
  payments
);

app.use("/payments", payments);
app.use("/suppliers", suppliers);
app.use("/containers", containers);
app.use("/branches", branches);
app.use("/auctions", auctions);
app.use("/bidders", bidders);
app.use("/users", users);

app.get("/", (req, res) => {
  try {
    res.send("HELLO WORLD");
  } catch (err) {
    console.error("Error connecting to MySQL:", err);
    res.status(500).send("Error connecting to MySQL.");
  }
});

app.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    if (error[FILE_UPLOAD_ERROR_EXCEPTION]) {
      return renderHttpError(res, {
        log: error.message,
        error: FILE_UPLOAD_401,
      });
    }
    return renderHttpError(res, {
      log: error.message,
      error: SYSTEM_503,
    });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
