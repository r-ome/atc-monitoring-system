import express from "express";
import moment from "moment";
import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import {
  getAuctionDetails,
  getAuctions,
  createAuction,
  registerBidderAtAuction,
  getMonitoring,
  getBidderAuctionProfile,
  getRegisteredBidders,
  reassignAuctionItem,
  cancelItem,
  createManifestRecords,
  getManifestRecords,
  getAuctionItemDetails,
  discountItem,
  createAuctionInventory,
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
  getContainerInventories,
} from "../services/inventories.js";
import { getBarcodesFromContainers } from "../services/containers.js";
import {
  AUCTIONS_401,
  AUCTIONS_402,
  AUCTIONS_403,
  AUCTIONS_501,
  AUCTIONS_503,
  BIDDERS_403,
  renderHttpError,
  INVALID_ROW,
  VALID_ROW,
  BIDDERS_402,
} from "./error_infos.js";
import {
  formatNumberPadding,
  uploadMulterMiddleware,
  readXLSXfile,
} from "../utils/index.js";
import { DB_ERROR_EXCEPTION } from "../services/index.js";
import { AUCTION_STATUS } from "./constants.js";

const router = express.Router();

// GET LIST OF AUCTIONS
router.get("/", async (_, res) => {
  try {
    const auctions = await getAuctions();
    res.status(200).json({ data: auctions });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

// GET AUCTION DETAILS
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

// CREATE AUCTION
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

// REGISTER BIDDER AT AUCTION
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

    const auction = await getAuctionDetails(auction_id);
    if (!auction) {
      return renderHttpError(res, {
        log: `Auction with ID: ${auction_id} does not exist`,
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

// GET MONITORING FOR AUCTION
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

// UPLOAD MANIFEST || ENCODE MANIFEST IN AUCTION
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

    if (!raw_sheet_data.length) {
      return renderHttpError(res, {
        logger: "No valid rows for this sheet.",
        error: AUCTIONS_401,
      });
    }

    const { bidders } = await getRegisteredBidders(auction_id);
    if (!bidders.length) {
      return renderHttpError(res, {
        log: "Cannot upload file because there are no Registered Bidders",
        error: AUCTIONS_401,
      });
    }

    const removedEmptyCells = (sheet_data) => {
      return sheet_data
        .map((item) => ({
          ...item,
          DESCRIPTION: item.DESCRIPTION ? item.DESCRIPTION.toUpperCase() : null,
          CONTROL: item.CONTROL
            ? formatNumberPadding(item.CONTROL, 4)
            : item.CONTROL,
          BIDDER: item.BIDDER
            ? formatNumberPadding(item.BIDDER, 4)
            : item.bidder,
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

    const validateSheetBidders = async (sheet_data, bidders) => {
      // validate if bidders in sheet is registered
      // get registered bidders in the auction

      const registered_bidders = bidders
        .filter((bidder) => !bidder.remarks)
        .map((bidder) => bidder.bidder_number);

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

      if (!sheet_bidder_numbers.length) {
        return filtered_unregistered_bidders;
      }

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
      // if item is in inventories table, update status = UNSOLD
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
          QTY: obj.QTY.toString(),
          PRICE: obj.PRICE.toString(),
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
      // if inventory doesn't exists
      // add container_id for inventories table
      // PS: this is the array with complete data
      // get container barcodes
      const container_barcodes = await getBarcodesFromContainers();
      return sheet_data.map((item) => {
        if (item.remarks === INVALID_ROW) return item;
        let item_barcode = item.BARCODE.split("-");
        item_barcode =
          item_barcode.length === 3
            ? item_barcode.slice(0, -1).join("-")
            : item.BARCODE;
        const container = container_barcodes.find(
          (temp) => temp.barcode === item_barcode
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
      filtered_empty_rows_sheet,
      bidders
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

    let display_manifest = sheet_with_container_id.map((item) => ({
      barcode: item.BARCODE,
      control_number: item.CONTROL,
      description: item.DESCRIPTION,
      price: item.PRICE,
      bidder_number: item.BIDDER,
      qty: item.QTY.toString(),
      manifest_number: item.MANIFEST,
      remarks: item.remarks,
      error_messages: item.error_messages,
    }));

    if (!valid_items.length) {
      return res.status(200).json({
        data: {
          message: `${valid_items.length} rows created!`,
          manifest: display_manifest,
        },
      });
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
    return res.status(200).json({
      data: {
        message: `${valid_items.length} rows created!`,
        manifest: display_manifest,
      },
    });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

// GET MANIFEST RECORDS
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

// GET REGISTERED BIDDERS
router.get("/:auction_id/bidders", async (req, res) => {
  try {
    const { auction_id } = req.params;
    let registered_bidders = await getRegisteredBidders(auction_id);
    return res.status(200).json({ data: registered_bidders });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

// GET BIDDER DETAILS IN AUCTION
router.get("/:auction_id/bidders/:bidder_id", async (req, res) => {
  try {
    const { auction_id, bidder_id } = req.params;
    const bidder = await getBidderAuctionProfile(auction_id, bidder_id);
    return res.status(200).json({ data: bidder });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

// GET AUCTION ITEM DETAILS
router.get("/:auction_id/item/:auction_inventory_id", async (req, res) => {
  try {
    const { auction_inventory_id } = req.params;
    const inventory = await getAuctionItemDetails(auction_inventory_id);
    if (!inventory) {
      return renderHttpError(res, {
        log: `Auction Item with ID: ${auction_inventory_id} does not exist`,
        error: AUCTIONS_403,
      });
    }

    return res.status(200).json({ data: inventory });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

// CANCEL ITEM
router.post(
  "/:auction_id/cancel-item/:auction_inventory_id",
  async (req, res) => {
    try {
      const { auction_id, auction_inventory_id } = req.params;
      const { reason } = req.body;
      const inventory = await getAuctionItemDetails(auction_inventory_id);
      if (!inventory) {
        return renderHttpError(res, {
          log: `Auction Item with ID:${auction_inventory_id} does not exist`,
          error: AUCTIONS_403,
        });
      }

      if (inventory.auction_status === AUCTION_STATUS.CANCELLED) {
        return renderHttpError(res, {
          log: `Auction Item with ID:${auction_inventory_id} is already CANCELLED`,
          error: AUCTIONS_401,
        });
      }

      const schema = Joi.object({ reason: Joi.string() });
      const { error } = schema.validate(req.body);
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

      const data = await cancelItem(auction_id, auction_inventory_id, reason);
      return res.status(200).json({ data });
    } catch (error) {
      return renderHttpError(res, {
        log: error,
        error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
      });
    }
  }
);

router.post("/:auction_id/void-item/:auction_inventory_id", (req, res) => {
  try {
    const { auction_id, auction_inventory_id } = req.params;
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

// REASSIGN ITEM FROM ONE BIDDER TO ANOTHER BIDDER
router.post(
  "/:auction_id/reassign-item/:auction_inventory_id",
  async (req, res) => {
    try {
      const { auction_id, auction_inventory_id } = req.params;
      const { new_bidder_number } = req.body;
      const inventory = await getAuctionItemDetails(auction_inventory_id);
      if (!inventory) {
        return renderHttpError(res, {
          log: `Auction Item with ID: ${auction_inventory_id} does not exist`,
          error: AUCTIONS_403,
        });
      }

      if (inventory.auction_status === AUCTION_STATUS.PAID) {
        return renderHttpError(res, {
          log: `Item not yet CANCELLED. CANCEL ITEM first before transfer of ownership`,
          error: AUCTIONS_401,
        });
      }

      const schema = Joi.object({
        new_bidder_number: Joi.string().required(),
      });
      const { error } = schema.validate(req.body);
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

      const registered_bidders = await getRegisteredBidders(auction_id);
      const bidder_numbers = registered_bidders.bidders.map((item) => ({
        auction_bidders_id: item.auction_bidders_id,
        service_charge: item.service_charge,
        bidder_number: item.bidder_number,
      }));

      const new_bidder = bidder_numbers.find(
        (item) => item.bidder_number === new_bidder_number
      );

      if (!new_bidder) {
        return renderHttpError(res, {
          log: `Reassigned Bidder Number:${new_bidder_number} does not exist | not registered in auction`,
          error: AUCTIONS_403,
        });
      }

      if (inventory.bidder.bidder_number === new_bidder.bidder_number) {
        return renderHttpError(res, {
          log: `Cannot assign item to same bidder ${new_bidder_number}`,
          error: AUCTIONS_401,
        });
      }

      const data = await reassignAuctionItem(auction_inventory_id, new_bidder);
      return res.status(200).json({ data });
    } catch (error) {
      return renderHttpError(res, {
        log: error,
        error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
      });
    }
  }
);

// REFUND OR DISCOUNT(LESS) ITEM PRICE
router.post(
  "/:auction_id/discount-item/:auction_inventory_id",
  async (req, res) => {
    try {
      const { auction_inventory_id } = req.params;
      const { new_price } = req.body;
      const inventory = await getAuctionItemDetails(auction_inventory_id);
      if (!inventory) {
        return renderHttpError(res, {
          log: `Auction Item with ID:${auction_inventory_id} does not exist`,
          error: AUCTIONS_403,
        });
      }
      if (inventory.auction_status === AUCTION_STATUS.CANCELLED) {
        return renderHttpError(res, {
          log: `Auction Item with ID:${auction_inventory_id} is already CANCELLED`,
          error: AUCTIONS_401,
        });
      }

      const schema = Joi.object({
        new_price: Joi.number().required(),
      });
      const { error } = schema.validate(req.body);
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

      const data = await discountItem(
        inventory.auction_inventory_id,
        new_price
      );
      return res.status(200).json({ data });
    } catch (error) {
      return renderHttpError(res, {
        log: error,
        error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
      });
    }
  }
);

// ENCODE SINGLE ADD ON
router.post("/:auction_id/add-on", async (req, res) => {
  try {
    const { auction_id } = req.params;
    const { body } = req;

    const schema = Joi.object({
      barcode: Joi.string().required(),
      control: Joi.string().required(),
      description: Joi.string().required(),
      bidder: Joi.string().required(),
      qty: Joi.string().required(),
      price: Joi.number().required(),
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

    const registered_bidders = await getRegisteredBidders(auction_id);
    const registered_bidder = registered_bidders.bidders.find(
      (item) => item.bidder_id === parseInt(body.bidder_id) && !item.remarks
    );

    if (!registered_bidder) {
      return renderHttpError(res, {
        log: `Bidder with ID: ${body.bidder} is not registered in auction`,
        error: BIDDERS_403,
      });
    }

    let container_barcodes = await getBarcodesFromContainers();
    let item_container_barcode = body.barcode.split("-");
    item_container_barcode =
      item_container_barcode.length === 3
        ? item_container_barcode.slice(0, -1).join("-")
        : body.barcode;
    const container = container_barcodes.find(
      (container) => container.barcode === item_container_barcode
    );

    if (!container) {
      return renderHttpError(res, {
        log: `Container with Barcode:${item_container_barcode} does not exist. Please create container first!`,
        error: AUCTIONS_403,
      });
    }

    // check if rebid | unsold
    const container_inventories = await getContainerInventories(
      container.container_id
    );
    const inventory = container_inventories.find(
      (inventory) =>
        inventory.barcode === body.barcode && inventory.status === "SOLD"
    );
    if (inventory) {
      return renderHttpError(res, {
        log: `Inventory with barcode:${inventory.barcode} already in SOLD`,
        error: AUCTIONS_402,
      });
    }

    const auction_inventory = await createAuctionInventory(auction_id, body);

    return res.status(200).json({ data: auction_inventory });
  } catch (error) {
    return renderHttpError(res, {
      log: error,
      error: error[DB_ERROR_EXCEPTION] ? AUCTIONS_501 : AUCTIONS_503,
    });
  }
});

export default router;
