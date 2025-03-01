import { logger } from "../logger.js";
/*
  Error Informations
  HTTP STATUS: 400
  - 401: Invalid request params | request body | invalid input
  - 402: Duplicate Entry
  - 403: Does not Exist | Does not belong to
  
  HTTP STATUS: 401
  - AUTH_401: Unauthorized

  HTTP STATUS: 500
  - 501: DB Error
  - 502: Logic error
  - 503: Unexpected Error
*/

export const renderHttpError = (res, { log, error }) => {
  let message = "";
  const httpStatus = error.includes("40") ? 400 : 500;
  switch (httpStatus) {
    case 400:
      message = "Bad request";
      break;
    case 401:
      message = "Unauthorized";
      break;
    case 500:
      message = "Internal Server Error";
      break;
    default:
      message = "Unexpected Error";
  }
  logger.error(log);
  return res.status(httpStatus).json({ error, message, httpStatus });
};

export const INVALID_ROW = "INVALID_ROW";
export const VALID_ROW = "VALID_ROW";

export const FILE_UPLOAD_401 = "FILE_UPLOAD_401";
export const SYSTEM_503 = "SYSTEM_503";
export const AUTH_401 = "AUTH_401";

export const SUPPLIERS_401 = "SUPPLIERS_401";
export const SUPPLIERS_402 = "SUPPLIERS_402";
export const SUPPLIERS_403 = "SUPPLIERS_403";
export const SUPPLIERS_500 = "SUPPLIERS_500";
export const SUPPLIERS_501 = "SUPPLIERS_501";
export const SUPPLIERS_502 = "SUPPLIERS_502";
export const SUPPLIERS_503 = "SUPPLIERS_503";
export const CONTAINERS_401 = "CONTAINERS_401";
export const CONTAINERS_402 = "CONTAINERS_402";
export const CONTAINERS_403 = "CONTAINERS_403";
export const CONTAINERS_501 = "CONTAINERS_501";
export const CONTAINERS_502 = "CONTAINERS_502";
export const CONTAINERS_503 = "CONTAINERS_503";
export const BRANCHES_401 = "BRANCHES_401";
export const BRANCHES_402 = "BRANCHES_402";
export const BRANCHES_403 = "BRANCHES_403";
export const BRANCHES_501 = "BRANCHES_501";
export const BRANCHES_502 = "BRANCHES_502";
export const BRANCHES_503 = "BRANCHES_503";
export const BIDDERS_401 = "BIDDERS_401";
export const BIDDERS_402 = "BIDDERS_402";
export const BIDDERS_403 = "BIDDERS_403";
export const BIDDERS_501 = "BIDDERS_501";
export const BIDDERS_502 = "BIDDERS_502";
export const BIDDERS_503 = "BIDDERS_503";
export const BIDDER_REQUIREMENT_401 = "BIDDER_REQUIREMENT_401";
export const BIDDER_REQUIREMENT_402 = "BIDDER_REQUIREMENT_402";
export const BIDDER_REQUIREMENT_403 = "BIDDER_REQUIREMENT_403";
export const BIDDER_REQUIREMENT_501 = "BIDDER_REQUIREMENT_501";
export const BIDDER_REQUIREMENT_502 = "BIDDER_REQUIREMENT_502";
export const BIDDER_REQUIREMENT_503 = "BIDDER_REQUIREMENT_503";
export const AUCTIONS_401 = "AUCTIONS_401";
export const AUCTIONS_402 = "AUCTIONS_402";
export const AUCTIONS_403 = "AUCTIONS_403";
export const AUCTIONS_501 = "AUCTIONS_501";
export const AUCTIONS_502 = "AUCTIONS_502";
export const AUCTIONS_503 = "AUCTIONS_503";
export const AUCTION_PAYMENTS_401 = "AUCTION_PAYMENTS_401";
export const AUCTION_PAYMENTS_402 = "AUCTION_PAYMENTS_402";
export const AUCTION_PAYMENTS_403 = "AUCTION_PAYMENTS_403";
export const AUCTION_PAYMENTS_501 = "AUCTION_PAYMENTS_501";
export const AUCTION_PAYMENTS_502 = "AUCTION_PAYMENTS_502";
export const AUCTION_PAYMENTS_503 = "AUCTION_PAYMENTS_503";
export const INVENTORIES_401 = "INVENTORIES_401";
export const INVENTORIES_402 = "INVENTORIES_402";
export const INVENTORIES_403 = "INVENTORIES_403";
export const INVENTORIES_501 = "INVENTORIES_501";
export const INVENTORIES_502 = "INVENTORIES_502";
export const INVENTORIES_503 = "INVENTORIES_503";
export const USERS_401 = "USERS_401";
export const USERS_402 = "USERS_402";
export const USERS_403 = "USERS_403";
export const USERS_501 = "USERS_501";
export const USERS_502 = "USERS_502";
export const USERS_503 = "USERS_503";
