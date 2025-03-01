import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { logger, morganMiddleware } from "./logger.js";
import {
  auctions,
  suppliers,
  branches,
  containers,
  bidders,
  users,
  auth,
} from "./Routes/index.js";
import {
  authenticateToken,
  FILE_UPLOAD_ERROR_EXCEPTION,
} from "./utils/index.js";
import {
  renderHttpError,
  FILE_UPLOAD_401,
  SYSTEM_503,
} from "./Routes/error_infos.js";

logger.info("STARTING APPLICATION");

app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(function (req, res, next) {
  req.bodyContent = JSON.stringify(req.body);
  next();
});
app.use(morganMiddleware);

app.use(
  cors({
    credentials: true,
    origin: `${process.env.origin}`,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization,Cache-Control,Pragma,Expires",
  })
);

app.use("/suppliers", authenticateToken, suppliers);
app.use("/containers", authenticateToken, containers);
app.use("/branches", authenticateToken, branches);
app.use("/auctions", authenticateToken, auctions);
app.use("/bidders", authenticateToken, bidders);
app.use("/users", authenticateToken, users);
app.use("/", auth);

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

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
