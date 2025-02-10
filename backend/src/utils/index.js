import moment from "moment";
import multer from "multer";
import path from "path";
import * as fs from "fs";
import * as XLSX from "xlsx/xlsx.mjs";
import { renderHttpError } from "../Routes/error_infos.js";
XLSX.set_fs(fs);

export const formatNumberPadding = (num, padding = 3) =>
  num?.toString().padStart(padding, "0");

export const sanitizeBarcode = (barcode) => {
  const parts = barcode.split("-");
  parts[1] = formatNumberPadding(parts[1]);
  if (parts.length > 2) parts[2] = formatNumberPadding(parts[2], 4);

  return parts.join("-");
};

export const formatNumberToCurrency = (num) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(num));
};

export const formatToReadableDate = (resource) => {
  let newResource = resource;
  for (let key in newResource) {
    if (
      key.includes("_at") ||
      key.includes("_date") ||
      key.includes("eta") ||
      key.includes("telegraphic")
    ) {
      newResource[key] = moment(newResource[key]).format("MMM DD YYYY hh:mma");
    }
  }
  return newResource;
};

/**
 * returns a string for a specific year month and date for a folder name
 * format: YYYY-MM-DD
 * example: manifests/2025-02-02
 * @returns string
 */
const generateFolderName = () => {
  const folderName = moment().format("YYYY-MM-DD");
  const uploadPath = path.join("manifests", folderName);

  // Ensure the folder exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return uploadPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, generateFolderName());
  },
  filename: (_, file, cb) => {
    cb(null, `${moment().format("YYYY-MMM-DD")}-${file.originalname}`);
  },
});

const uploadMulter = multer({
  storage,
  fileFilter: function (_, file, cb) {
    const ext = path.extname(file.originalname);
    if (ext !== ".xlsx" && ext !== ".xls" && ext !== ".numbers") {
      return cb(new Error("Only Excel files are allowed"));
    }
    cb(null, true);
  },
}).single("file");

/**
 * deletes a file after reading the data within it
 * @param {string} filePath
 */
const deleteFile = (filePath) => {
  fs.unlink(filePath, (deleteErr) => {
    if (deleteErr) {
      return renderHttpError(res, {
        log: deleteErr,
        error: AUCTIONS_503,
      });
    }
  });
};

export const FILE_UPLOAD_ERROR_EXCEPTION = Symbol("FILE_UPLOAD_ERROR_SYMBOL");
export const uploadMulterMiddleware = (req, res, next) => {
  class FileUploadErrorException extends Error {
    constructor(func_name, message) {
      super(`${func_name}:${message}`);
      this.name = "FileUploadErrorException";
      this.func_name = func_name;
      this[FILE_UPLOAD_ERROR_EXCEPTION] = true;
    }
  }

  uploadMulter(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return next(new FileUploadErrorException("uploadMulter", error));
    } else if (error) {
      return next(new FileUploadErrorException("uploadMulter", error));
    }
    next();
  });
};

export const readXLSXfile = (filePath) => {
  const headers = [
    "BARCODE",
    "CONTROL",
    "DESCRIPTION",
    "BIDDER",
    "QTY",
    "PRICE",
    "MANIFEST",
  ];
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  let data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const fileHeaders = data[0];
  const headerIndexMap = headers.reduce((acc, header) => {
    const idx = fileHeaders.indexOf(header);
    if (idx !== -1) {
      acc[header] = idx;
    }
    return acc;
  }, {});

  const isRowEmpty = (row) =>
    row.every((cell) => cell === undefined || cell === null || cell === "");

  const sanitizedData = data
    .slice(1)
    .filter((row) => {
      if (row.length) return true;
      return !isRowEmpty(row);
    })
    .map((row) => {
      const sanitizedRow = {};
      headers.forEach((header) => {
        const idx = headerIndexMap[header];
        if (idx !== undefined) {
          sanitizedRow[header] = row[idx];
        }
      });

      return sanitizedRow;
    })
    .filter((item) => Object.keys(item).length);

  deleteFile(filePath);
  return sanitizedData;
};
