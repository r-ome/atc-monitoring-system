import express from "express";
import {
  getAuctionDetails,
  getAuctions,
  createAuction,
  deleteAuction,
  registerBidderAtAuction,
  getMonitoring,
  encodeInventoryOnAuction,
  getBidderItems,
  updateBidderPayment,
  getRegisteredBidders,
  removeRegisteredBidder,
  validateExistingAuctionInventories,
  cancelItem,
} from "../services/auctions.js";

import {
  getBidder,
  getMultipleBiddersByBidderNumber,
} from "../services/bidders.js";
import {
  getInventoryByBarcodeAndControl,
  addInventoryFromEncoding,
  addAuctionInventoriesFromEncoding,
} from "../services/inventories.js";
import {
  getContainerIdByBarcode,
  getBarcodesFromContainers,
} from "../services/containers.js";
import { logger } from "../logger.js";
import {
  AUCTIONS_401,
  AUCTIONS_402,
  AUCTIONS_403,
  AUCTIONS_501,
  AUCTIONS_503,
  renderHttpError,
} from "./error_infos.js";
const router = express.Router();
import Joi from "joi";
import {
  sanitizeBarcode,
  formatNumberPadding,
  formatNumberToCurrency,
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
      error: error[DBErrorException] ? AUCTIONS_501 : AUCTIONS_503,
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
    res.status(200).json({ status: "success", data: monitoring });
  } catch (e) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
  }
});

router.post("/:auction_id/encode", async (req, res) => {
  try {
    const { file } = req.body;
    const { auction_id } = req.params;
    let errors = [];
    let bidder_numbers_in_sheet = [];
    let bidder_ids_from_db = [];
    let valid_rows = [];

    if (file.length) {
      // validate file contents
      for (row of file) {
        // row validations
        if (!row.barcode) {
          errors.push({ row, message: "barcode is a required field" });
          continue;
        } else {
          row.barcode = sanitizeBarcode(row.barcode);
        }

        if (!row.control_number) {
          errors.push({ row, message: "control number is a required field" });
          continue;
        } else {
          if (isNaN(row.control_number)) {
            errors.push({
              row,
              message: `Invalid control Number: ${row.control_number}`,
            });
            continue;
          }
          row.control_number = formatNumberPadding(row.control_number, 4);
        }

        if (!row.description) {
          row.description = "NO DESCRIPTION";
        } else {
          row.description = row.description.toUpperCase();
        }

        if (!row.bidder) {
          errors.push({ row, message: "bidder is a required field" });
          continue;
        }

        if (!row.qty) {
          row.qty = "NO QTY";
        }

        if (!row.price) {
          errors.push({ row, message: "price is a required field" });
        }

        if (!row.manifest_number) {
          row.manifest_number = "NO MANIFEST NUMBER";
        }

        if (!bidder_numbers_in_sheet.includes(row.bidder)) {
          bidder_numbers_in_sheet.push(row.bidder);
        }

        row.auction_id = auction_id;
        valid_rows.push(row);
      }

      // set bidder id(db) by bidder num(sheet)
      bidder_ids_from_db = await getMultipleBiddersByBidderNumber(
        auction_id,
        bidder_numbers_in_sheet
      );
      bidder_ids_from_db = Object.assign(
        {},
        ...bidder_ids_from_db.map((item) => ({
          [item.bidder_number]: item.bidder_id,
        }))
      );

      valid_rows = valid_rows.map((row) => ({
        ...row,
        bidder_id: bidder_ids_from_db[row.bidder] || null,
      }));

      // validate invalid bidders
      let bidder_valid_rows = [];
      for (const row of valid_rows) {
        if (!row.bidder_id) {
          errors.push({
            row,
            message: `bidder number ${row.bidder} does not exist or not in auction`,
          });
          continue;
        } else bidder_valid_rows.push(row);
      }

      if (bidder_valid_rows.length) {
        // check if row already exists in inventory table
        // if true - skip - add to auctions_inventories table
        // else add item to inventory
        let barcodes_from_db = await getBarcodesFromContainers();
        barcodes_from_db = barcodes_from_db.map((item) => item.barcode);

        // validate invalid barcode
        let barcode_valid_rows = [];
        for (const row of bidder_valid_rows) {
          let barcodeCheck = row.barcode;
          if (barcodeCheck.split("-").length >= 3) {
            barcodeCheck = row.barcode.split("-").slice(0, 2).join("-");
          }

          if (!barcodes_from_db.includes(barcodeCheck)) {
            errors.push({
              row,
              message: `BARCODE ${row.barcode} does not exist`,
            });
            continue;
          } else {
            barcode_valid_rows.push(row);
          }
        }

        if (barcode_valid_rows.length) {
          // get existing inventories from sheet
          let barcode_control_number_from_sheet = barcode_valid_rows.map(
            (row) => [row.barcode, row.control_number]
          );
          const inventory_ids = await getInventoryByBarcodeAndControl(
            barcode_control_number_from_sheet
          );

          // add unexisting items in inventories table
          let items_for_inventory = [];

          for (row of barcode_valid_rows) {
            let inventory_id =
              inventory_ids.find(
                (inventory) =>
                  inventory.barcode_number === row.barcode &&
                  inventory.control_number === row.control_number
              )?.inventory_id || null;

            if (inventory_id) {
              row.inventory_id = inventory_id;
            } else {
              let barcode = row.barcode;
              if (barcode.split("-").length === 3) {
                barcode = barcode.split("-").slice(0, -1).join("-");
              }
              const [{ container_id }] = await getContainerIdByBarcode(barcode);
              if (container_id) {
                items_for_inventory.push([
                  container_id,
                  row.barcode,
                  row.control_number,
                  row.description,
                  row.price,
                  row.qty,
                  "SOLD",
                ]);
              }
            }
          }

          if (items_for_inventory.length) {
            const newly_added_inventory_ids = await addInventoryFromEncoding(
              items_for_inventory
            );

            // add inventory_id for valid rows (newly added)
            // to prepare for adding rows to auctions_inventories
            for (row of valid_rows) {
              if (items_for_inventory.length) {
                row.inventory_id = newly_added_inventory_ids.find(
                  (inventory) =>
                    inventory.barcode_number === row.barcode &&
                    inventory.control_number === row.control_number
                )?.inventory_id;
              }
            }
          }

          // validate if sheet data is already in auctions_inventories
          const sheet_inventories = valid_rows.map((item) => [
            item.auction_id,
            item.bidder_id,
            item.inventory_id,
          ]);
          let existing_inventories = await validateExistingAuctionInventories(
            sheet_inventories
          );
          existing_inventories = existing_inventories.map(
            (item) => item.inventory_id
          );

          let inventory_valid_rows = [];
          for (const row of barcode_valid_rows) {
            if (existing_inventories.includes(row.inventory_id)) {
              errors.push({ row, message: "Already encoded" });
              continue;
            } else {
              inventory_valid_rows.push(row);
            }
          }

          if (inventory_valid_rows.length) {
            // add sheet to inventory items
            let auction_inventories = inventory_valid_rows.map((row) => [
              row.auction_id,
              row.inventory_id,
              row.bidder_id,
              "UNPAID",
              row.manifest_number,
            ]);
            console.log(auction_inventories);
            await addAuctionInventoriesFromEncoding(auction_inventories);
          }

          valid_rows = inventory_valid_rows;
        }
      }

      // get new set of monitoring
      const monitoring = await getMonitoring(auction_id);

      return res.status(200).json({
        monitoring,
        valid_rows,
        sheet_errors: errors,
      });
    } else {
      return res
        .status(400)
        .json({ status: "success", message: "manifest is empty " });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "fail", error });
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

// router.get("/:auction_id/details", async (req, res) => {
//   try {
//     const [auction] = await getAuctionDetails();
//     return res.status(200).json({ status: "success", data: auction });
//   } catch (error) {
//     logger.error(error);
//     res.status(500).json({ status: "fail", error });
//   }
// });

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
