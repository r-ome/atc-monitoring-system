import { InventoryStatus } from "./Inventories";

export type BaseAuction = {
  auction_id: number;
  auction_date: string;
  number_of_bidders: number;
};

export type AuctionDetails = BaseAuction & {
  total_items: number;
  total_items_price: string;
};

export type Monitoring = {
  auction_inventory_id: number;
  barcode: string;
  control_number: string;
  bidder: {
    bidder_id: number;
    bidder_number: string;
  };
  qty: string;
  price: string;
  manifest_number: string;
};

type ManifestRemark = "VALID_ROW" | "INVALID_ROW";

export type ManifestRecord = {
  manifest_id: number;
  remarks: ManifestRemark;
  barcode_number: string;
  control_number: string;
  description: string;
  price: string;
  bidder_number: string;
  qty: string;
  manifest_number: string;
  batch_number: string;
  error_messages: string;
  created_at: string;
  updated_at: string;
};

export type ManifestRecordResponse = {
  message: string;
  manifest: {
    barcode: string;
    description: string;
    price: number;
    bidder_number: string;
    qty: string;
    manifest_number: string;
    remarks: ManifestRemark;
    error_messages: string;
  }[];
};

export type RegisteredBidders = {
  auction_id: number;
  auction_date: string;
  bidders: RegisterBidderResponse[];
};

type AuctionItemStatus = "PAID" | "UNPAID" | "CANCELLED";

type ItemHistoryStatus =
  | (AuctionItemStatus & "REFUNDED")
  | "LESS"
  | "DISCREPANCY";

export type BidderAuctionProfile = {
  auction_bidders_id: number;
  bidder_id: number;
  bidder_number: string;
  full_name: string;
  already_consumed: number; // supposed to be boolean
  total_items: number;
  service_charge: string;
  registration_fee: string;
  total_item_price: string;
  total_unpaid_items: string; // supposed to be number
  total_unpaid_items_price: string;
  balance: string;
  items: {
    auction_inventory_id: number;
    qty: string;
    price: string;
    status: AuctionItemStatus;
    barcode: string;
    control: string;
    updated_at: string;
    description: string;
    manifest_number: string;
  }[];
};

export type RegisterBidderPayload = {
  bidder_id: number;
  registration_fee: string;
  service_charge: string;
};

export type RegisterBidderResponse = {
  balance: string;
  bidder_id: number;
  full_name: string;
  bidder_number: string;
  service_charge: string;
  total_no_items: number;
  registration_fee: string;
  auction_bidders_id: number;
};

type AuctionItemHistory = {
  status: ItemHistoryStatus;
  remarks: string | null;
  created_at: string;
  auction_inventory_id: number;
  inventory_history_id: number;
};

type AuctionItemDetails = {
  auction_inventory_id: number;
  auction_id: number;
  price: string;
  inventory_status: InventoryStatus;
  auction_status: AuctionItemStatus;
  service_charge: number;
  bidder: {
    bidder_id: number;
    full_name: string;
    bidder_number: string;
  };
  histories: AuctionItemHistory[];
};

// TO DO:
// UPDATE THIS TO AUCTION ITEM DETAILS
export type CancelItemResponse = {
  auction_inventory_id: number;
  inventory_id: number;
  auction_bidders: number;
  price: number;
  status: AuctionItemStatus;
  service_charge: number;
  receipt_number: string | null;
};

export type UploadManifestPayload = {
  file: any;
};
