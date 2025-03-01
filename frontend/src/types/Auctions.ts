import { InventoryStatus } from "./Inventories";

export type AuctionItemStatus = "PAID" | "UNPAID" | "CANCELLED";
export type ItemHistoryStatus =
  | AuctionItemStatus
  | (AuctionItemStatus & "REFUNDED")
  | "LESS"
  | "DISCREPANCY";

export type BaseAuction = {
  auction_id: number;
  auction_date: string;
  number_of_bidders: number;
};

export type AuctionDetails = BaseAuction & {
  total_items: number;
  number_of_unpaid_bidders: number;
  total_items_price: string;
  total_registration_fee: string;
};

export type Monitoring = {
  auction_inventory_id: number;
  barcode: string;
  control: string;
  description: string;
  auction_status: AuctionItemStatus;
  inventory_status: InventoryStatus;
  bidder: {
    bidder_id: number;
    bidder_number: string;
  };
  qty: string;
  price: number;
  manifest_number: string;
};

type ManifestRemark = "VALID_ROW" | "INVALID_ROW";

export type ManifestRecord = {
  manifest_id: number;
  remarks: ManifestRemark;
  barcode: string;
  control: string;
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
    control: string;
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

export type BidderAuctionItem = {
  auction_inventory_id: number;
  qty: string;
  price: number;
  bidder: string;
  status: AuctionItemStatus;
  barcode: string;
  control: string;
  updated_at: string;
  description: string;
  manifest_number: string;
};

export type BidderAuctionProfile = {
  auction_bidders_id: number;
  bidder_id: number;
  bidder_number: string;
  auction_date: string;
  full_name: string;
  receipt_number: string;
  already_consumed: number; // supposed to be boolean
  total_items: number;
  service_charge: string;
  registration_fee: string;
  total_item_price: string;
  total_unpaid_items: string; // supposed to be number
  total_unpaid_items_price: string;
  balance: number;
  items: BidderAuctionItem[];
};

export type RegisterBidderPayload = {
  bidder_id: number;
  registration_fee: number;
  service_charge: number;
};

export type RegisterBidderResponse = {
  balance: number;
  bidder_id: number;
  full_name: string;
  bidder_number: string;
  service_charge: string;
  total_items: number;
  registration_fee: string;
  auction_bidders_id: number;
  remarks?: string;
};

export type AuctionItemHistory = {
  status: ItemHistoryStatus;
  remarks: string | null;
  created_at: string;
  auction_inventory_id: number;
  inventory_history_id: number;
};

export type AuctionItemDetails = {
  inventory: {
    status: InventoryStatus;
    barcode: string;
    control: string;
    created_at: string;
    updated_at: string;
    description: string;
    inventory_id: number;
  };
  auction_inventory?: {
    auction_inventory_id: number;
    auction_id: number;
    payment_id?: number;
    qty: string;
    price: number;
    bidder: {
      bidder_id: number;
      full_name: string;
      bidder_number: string;
      service_charge: number;
    };
    status: AuctionItemStatus;
    created_at: string;
    updated_at: string;
    manifest_number: string;
  };
  histories: AuctionItemHistory[];
};

// TO DO:
// UPDATE THIS TO AUCTION ITEM DETAILS
export type ActionItemResponse = {
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

export type RefundPayload = {
  new_price: number;
};

export type ReassignPayload = {
  new_bidder_number: string;
};

export type AddOnPayload = {
  barcode: string;
  control: string;
  description: string;
  bidder: string;
  qty: string;
  price: number;
};
