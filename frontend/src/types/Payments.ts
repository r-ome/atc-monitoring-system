import { AuctionItemStatus } from "./Auctions";
import { InventoryStatus } from "./Inventories";

export type PaymentType = "CASH" | "CHEQUE" | "BANK_TRANSFER";
export type PaymentPurpose = "PULL_OUT" | "REGISTRATION" | "REFUNDED" | "LESS";

export type AuctionPayment = {
  purpose: PaymentPurpose;
  full_name: string;
  created_at: string;
  payment_id: number;
  amount_paid: string;
  payment_type: string;
  bidder_number: string;
};

export type AuctionTransaction = {
  auction_id: number;
  auction_date: string;
  payments: AuctionPayment[];
};

export type PullOutPayment = {
  payment_id: number;
  purpose: PaymentPurpose;
  receipt_number: string;
  payment_type: PaymentType;
  auction_id: number;
  bidder_number: string;
  full_name: string;
};

export type BidderAuctionTransaction = {
  payment_id: number;
  purpose: PaymentPurpose;
  amount_paid: string;
  receipt_number: string;
  payment_type: PaymentType;
  created_at: string;
  total_items: string;
};

export type AuctionInventory = {
  qty: string;
  price: string;
  description: string;
  inventory_id: number;
  auction_status: AuctionItemStatus;
  barcode_number: string;
  control_number: string;
  manifest_number: string;
  inventory_status: InventoryStatus;
  auction_inventory_id: number;
};

export type PaymentDetails = {
  payment_id: number;
  receipt_number: string;
  amount_paid: string;
  purpose: PaymentPurpose;
  full_name: string;
  bidder_number: string;
  service_charge: number;
  already_consumed: number;
  registration_fee: string;
  created_at: string;
  total_items: number;
  auction_inventories: AuctionInventory[];
};
