import { logger } from "../logger.js";
/*
  Error Informations
  HTTP STATUS: 400
  - 401: Invalid request params | request body | invalid input
  - 402: Duplicate Entry
  - 403: Does not Exist

  HTTP STATUS: 500
  - 501: DB Error
  - 502: Logic error
  - 503: Unexpected Error
*/

export const renderHttpError = (res, { log, error }) => {
  let message = "";
  const httpCode = error.includes("40") ? 400 : 500;
  switch (httpCode) {
    case 400:
      message = "Bad request";
      break;
    case 500:
      message = "Internal Server Error";
      break;
    default:
      message = "Unexpected Error";
  }
  logger.error(log);
  return res.status(httpCode).json({ error, message });
};

export const SUPPLIERS_401 = "SUPPLIERS_401";
export const SUPPLIERS_402 = "SUPPLIERS_402";
export const SUPPLIERS_403 = "SUPPLIERS_403";
export const SUPPLIERS_500 = "SUPPLIERS_500";
export const SUPPLIERS_501 = "SUPPLIERS_501";

export const CONTAINERS_400 = {
  error: { code: "CONTAINERS_400", message: "Bad request" },
};
export const CONTAINERS_500 = {
  error: { code: "CONTAINERS_500", message: "Internal Server Error" },
};
export const BRANCHES_400 = {
  error: { code: "BRANCHES_400", message: "Bad request" },
};
export const BRANCHES_500 = {
  error: { code: "BRANCHES_500", message: "Internal Server Error" },
};
