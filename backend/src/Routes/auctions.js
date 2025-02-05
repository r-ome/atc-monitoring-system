import express from "express";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import {
  getAuctionDetails,
  getAuctions,
  createAuction,
  deleteAuction,
  registerBidderAtAuction,
  getMonitoring,
  getBidderItems,
  updateBidderPayment,
  getRegisteredBidders,
  removeRegisteredBidder,
  cancelItem,
  createManifestRecords,
  getManifestRecords,
} from "../services/auctions.js";
import {
  getBidder,
  getMultipleBiddersByBidderNumber,
} from "../services/bidders.js";
import {
  getInventoryByBarcode,
  bulkCreateContainerInventory,
  bulkCreateAuctionInventories,
  checkDuplicateInventory,
} from "../services/inventories.js";
import { getBarcodesFromContainers } from "../services/containers.js";
import { logger } from "../logger.js";
import {
  AUCTIONS_401,
  AUCTIONS_402,
  AUCTIONS_403,
  AUCTIONS_501,
  AUCTIONS_503,
  renderHttpError,
  INVALID_ROW,
  VALID_ROW,
} from "./error_infos.js";

const router = express.Router();
import Joi from "joi";
import {
  sanitizeBarcode,
  formatNumberPadding,
  formatNumberToCurrency,
  uploadMulterMiddleware,
  readXLSXfile,
} from "../utils/index.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";

router.get("/", async (_, res) => {
  try {
    let auctions = await getAuctions();
    // auctions = auctions.map((item) => ({
    //   ...item,
    //   total_registration: formatNumberToCurrency(item.total_registration),
    //   total_sales: formatNumberToCurrency(item.total_sales),
    // }));
    res.status(200).json({ data: auctions });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

router.get("/:auction_id", async (req, res) => {
  try {
    const { auction_id } = req.params;
    const auction = await getAuctionDetails(auction_id);
    if (!auction) {
      return renderHttpError(res, {
        log: `Auction with ID: ${auction_id} does not exist.`,
        error: AUCTIONS_403,
      });
    }
    return res.status(200).json({ data: auction });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

router.post("/", async (_, res) => {
  try {
    /*
      NOTE: DO NOT FORGET TO ADD VALIDATION FOR 1 AUCTION ONLY PER DAY
      PS: I DID NOT ADD IT YET FOR TESTING PURPOSES
    **/
    const auction = await createAuction();
    res.status(200).send({ data: auction });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

router.delete("/:auction_id", async (req, res) => {
  try {
    const { auction_id } = req.params;
    await deleteAuction(auction_id);
    res.status(200).json({ status: "success" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.post("/:auction_id/register-bidder", async (req, res) => {
  try {
    const { auction_id } = req.params;
    const { body } = req;
    const schema = Joi.object({
      bidder_id: Joi.required(),
      service_charge: Joi.number().required(),
      registration_fee: Joi.number().required(),
    });

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
        error: AUCTIONS_401,
      });
    }

    const bidder = await getBidder(body.bidder_id);
    if (!bidder) {
      return renderHttpError(res, {
        log: `Bidder with ID: ${body.bidder_id} does not exist`,
        error: AUCTIONS_403,
      });
    }

    const { bidders } = await getRegisteredBidders(auction_id);
    if (bidders.length) {
      const [isAlreadyRegistered] = bidders.filter(
        (bidder) => bidder.bidder_id === parseInt(body.bidder_id)
      );
      if (isAlreadyRegistered) {
        return renderHttpError(res, {
          log: `Bidder with ID: ${body.bidder_id} and number: ${isAlreadyRegistered.bidder_number} already registered.`,
          error: AUCTIONS_402,
        });
      }
    }

    const auction_bidder = await registerBidderAtAuction(auction_id, req.body);
    return res.status(200).json({ data: auction_bidder });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

router.post("/remove-registered-bidder", async (req, res) => {
  try {
    const auction_id = req.body.auction_id;
    const bidder_id = req.body.bidder_id;
    await removeRegisteredBidder(auction_id, bidder_id);
    res
      .status(200)
      .json({ status: "success", message: "Bidder removed from auction" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.get("/:auction_id/monitoring", async (req, res) => {
  try {
    const { auction_id } = req.params;
    const monitoring = await getMonitoring(auction_id);
    return res.status(200).json({ data: monitoring });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

router.post("/:auction_id/encode", uploadMulterMiddleware, async (req, res) => {
  try {
    const { auction_id } = req.params;
    if (!req.file) {
      return renderHttpError(res, {
        log: "Please upload a file",
        error: AUCTIONS_401,
      });
    }

    const { path } = req.file;
    const raw_sheet_data = readXLSXfile(path);

    const removedEmptyCells = (sheet_data) => {
      return sheet_data
        .map((item) => ({
          ...item,
          DESCRIPTION: item.DESCRIPTION ? item.DESCRIPTION.toUpperCase() : null,
          CONTROL: item.CONTROL
            ? formatNumberPadding(item.CONTROL, 4)
            : item.CONTROL,
          v4_identifier: uuidv4(),
          error_messages: null,
          remarks: VALID_ROW,
        }))
        .map((item) => {
          for (let key in item) {
            if (!item[key] && key !== "error_messages") {
              item.error_messages = `${key} is empty`;
              item.remarks = INVALID_ROW;
            }
          }
          return item;
        });
    };

    const validateSheetBidders = async (sheet_data) => {
      // validate if bidders in sheet is registered
      // get registered bidders in the auction
      const { bidders } = await getRegisteredBidders(auction_id);
      const registered_bidders = bidders.map((bidder) => bidder.bidder_number);

      // get bidders in sheet/manifest
      const sheet_bidders = [...new Set(sheet_data.map((item) => item.BIDDER))];

      // remove from filtered_empty_rows_sheet the rows where bidders are not registered
      const unregistered_bidders = sheet_bidders.filter(
        (item) => !new Set(registered_bidders).has(item)
      );

      // add bidder_id for auctions_inventories table
      const filtered_unregistered_bidders = filtered_empty_rows_sheet.map(
        (item) => {
          if (unregistered_bidders.includes(item.BIDDER)) {
            if (item.remarks === VALID_ROW) {
              item.remarks = INVALID_ROW;
              item.error_messages = `Bidder #${item.BIDDER} is not registered`;
            }
          }
          return item;
        }
      );

      // get VALID bidder numbers from sheet
      let sheet_bidder_numbers = filtered_unregistered_bidders
        .filter((item) => item.remarks === VALID_ROW)
        .map((item) => item.BIDDER);
      // get unique values
      sheet_bidder_numbers = [...new Set(sheet_bidder_numbers)];

      // get registered bidder id from auction_bidders table by bidder number
      const registered_auction_bidder_ids =
        await getMultipleBiddersByBidderNumber(
          auction_id,
          sheet_bidder_numbers
        );

      // add auction_bidders_id to sheet
      return filtered_unregistered_bidders.map((item) => {
        if (item.remarks === VALID_ROW) {
          const bidder = registered_auction_bidder_ids.find(
            (bidder) => bidder.bidder_number === item.BIDDER
          );
          item.auction_bidders_id = bidder.auction_bidders_id;
          return item;
        }
        return item;
      });
    };

    const validateInventories = async (sheet_data) => {
      // if item is in inventories table, update status = SOLD
      // get list of barcodes from sheet
      // check if it has inventory barcode (27-01-01) (the 3rd digit from the combination)
      // if barcode is only a combination of container barcode we skip it and consider it as new inventory
      const sheet_barcodes = sheet_data
        .map((item) => item.BARCODE)
        .filter((item) => item.split("-").length === 3);

      // get list of inventories
      const existing_inventories = sheet_barcodes.length
        ? await getInventoryByBarcode(sheet_barcodes)
        : [];

      // if item from manifest already exists in inventories table, add inventory_id (1)
      const sheet_with_inventory_id = sheet_with_bidder_id.map((item) => {
        const inventory = existing_inventories.find(
          (temp) => temp.barcode === item.BARCODE
        );
        item.inventory_id = inventory ? inventory.inventory_id : null;
        return item;
      });

      // check duplicates (combination of manifest)
      const normalize = (obj) =>
        JSON.stringify({
          BARCODE: obj.BARCODE,
          CONTROL: obj.CONTROL,
          DESCRIPTION: obj.DESCRIPTION,
          BIDDER: obj.BIDDER,
          QTY: obj.QTY,
          PRICE: obj.PRICE,
        });
      const current_inventories = await checkDuplicateInventory(auction_id);
      const current_inventories_set = new Set(
        current_inventories.map(normalize)
      );
      return sheet_with_inventory_id.map((item) => {
        const is_duplicate = current_inventories_set.has(normalize(item));
        if (item.remarks === INVALID_ROW) {
          return item;
        }
        if (is_duplicate) {
          item.remarks = INVALID_ROW;
          item.error_messages = `DUPLICATE ENCODE`;
        }
        return item;
      });
    };

    const addContainerIdKey = async (sheet_data) => {
      // add container_id for inventories table
      // PS: this is the array with complete data
      // get container barcodes
      const container_barcodes = await getBarcodesFromContainers();
      return sheet_data.map((item) => {
        if (item.remarks === INVALID_ROW) return item;
        let itemBarcode = item.BARCODE.split("-");
        itemBarcode =
          itemBarcode.length === 3
            ? itemBarcode.slice(0, -1).join("-")
            : item.BARCODE;
        const container = container_barcodes.find(
          (temp) => temp.barcode === itemBarcode
        );

        if (!container) {
          item.remarks = INVALID_ROW;
          item.error_messages = "INVALID BARCODE";
          return item;
        }

        item.container_id = container.container_id;
        return item;
      });
    };

    const filtered_empty_rows_sheet = removedEmptyCells(raw_sheet_data);
    const sheet_with_bidder_id = await validateSheetBidders(
      filtered_empty_rows_sheet
    );
    const sheet_with_marked_duplicates = await validateInventories(
      sheet_with_bidder_id
    );
    const sheet_with_container_id = await addContainerIdKey(
      sheet_with_marked_duplicates
    );

    const valid_items = sheet_with_container_id.filter(
      (item) => item.remarks === VALID_ROW
    );

    const manifest = sheet_with_container_id.map((item) => [
      auction_id,
      item.BARCODE,
      item.CONTROL,
      item.DESCRIPTION,
      item.PRICE,
      item.BIDDER,
      item.QTY,
      item.MANIFEST,
      moment().format("YYYYMMDDhhmmssA"),
      item.remarks,
      item.error_messages,
    ]);

    await createManifestRecords(manifest);

    if (!valid_items.length) {
      return res
        .status(200)
        .json({ data: `${valid_items.length} rows created!` });
    }

    let rows_for_inserting = sheet_with_container_id.filter(
      (item) => !item.inventory_id && item.remarks === VALID_ROW
    );

    // creating an inventory record for item in manifest
    // this will return the newly created item with an inventory_id
    // for the new items
    await bulkCreateContainerInventory(rows_for_inserting);

    // add back the removed/existing items from manifest to update their status
    const new_rows_with_inventory_id = sheet_with_container_id.filter(
      (item) => item.inventory_id && item.remarks === VALID_ROW
    );

    // create a record for auction_inventories
    await bulkCreateAuctionInventories(new_rows_with_inventory_id);
    return res
      .status(200)
      .json({ data: `${new_rows_with_inventory_id.length} rows created` });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

router.get("/:auction_id/manifest-records", async (req, res) => {
  try {
    const { auction_id } = req.params;
    const manifest_records = await getManifestRecords(auction_id);
    return res.status(200).json({ data: manifest_records });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

router.get("/:auction_id/bidders", async (req, res) => {
  try {
    const { auction_id } = req.params;
    let registered_bidders = await getRegisteredBidders(auction_id);
    // registered_bidders = registered_bidders.map((item) => ({
    //   ...item,
    //   total_price: formatNumberToCurrency(item.total_price),
    // }));
    return res.status(200).json({ data: registered_bidders });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.get("/:auction_id/bidders/:bidder_id", async (req, res) => {
  try {
    const { auction_id, bidder_id } = req.params;
    let [
      {
        data,
        already_consumed,
        auction_service_charge,
        registration_fee,
        created_at,
        bidder_number,
        bidder_name,
      },
    ] = await getBidderItems(auction_id, bidder_id);
    let total_balance = 0;
    if (data.length) {
      total_balance = data
        .filter((item) => item.auction_status === "UNPAID")
        .reduce((acc, curr) => (acc += parseInt(curr.price)), 0);
      let service_charge = (total_balance * auction_service_charge) / 100;
      total_balance += service_charge;
      if (!already_consumed) {
        total_balance -= registration_fee;
      }
    }

    data = data.map((item) => ({
      ...item,
      price: formatNumberToCurrency(item.price),
    }));

    res.status(200).json({
      status: "success",
      data: {
        data,
        already_consumed,
        totalBalance: total_balance,
        totalItems: data.length,
        paidItems: data.filter((item) => item.auction_status === "PAID").length,
        unpaidItems: data.filter((item) => item.auction_status === "UNPAID")
          .length,
        auction: created_at,
        bidderNumber: bidder_number,
        bidderName: bidder_name,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.post("/:auction_id/payment", async (req, res) => {
  try {
    const { auction_id } = req.params;
    const { bidder_id, amount } = req.body;
    const payment = await updateBidderPayment(
      auction_id,
      bidder_id,
      amount,
      req.body.inventory_ids
    );
    return res.status(200).json({ status: "success", data: payment });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.post("/:auction_id/cancel-item/:inventory_id", async (req, res) => {
  try {
    const { auction_id, inventory_id } = req.params;
    const [inventory] = await cancelItem(auction_id, inventory_id);

    return res.status(200).json({ status: "success", data: inventory });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

export default router;
