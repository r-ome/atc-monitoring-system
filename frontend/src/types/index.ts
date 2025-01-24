export type ErrorState = null | undefined | { field: string; message: string };

export interface Auction {
  auction_id: string;
  created_at: string;
}

export interface Bidder {
  bidder_id: number;
  bidder_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  service_charge: number;
  old_number: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface Supplier {
  supplier_id: number;
  name: string;
  japanese_name: string;
  shipper: string;
  num_of_containers?: string;
  updated_at: string;
  created_at: string;
  deleted_at?: string;
  supplier_code: string;
}

export interface Container {
  container_id: number;
  supplier_id: number;
  barcode: string;
  container_num: string;
  departure_date_from_japan: string;
  bill_of_lading_number: string;
  eta_to_ph: string;
  carrier: string;
  num_of_items: number;
  arrival_date_warehouse_ph: string;
  sorting_date: string;
  auction_date: string;
  payment_date: string;
  telegraphic_transferred: string;
  vessel: string;
  invoice_num: string;
  gross_weight: string;
  vanning_date: string;
  devanning_date: string;
  auction_or_sell: "AUCTION" | "SELL";
  branch_id: number;
  created_at: string;
  deleted_at: string;
  updated_at: string;
}

export interface ContainersBySupplier {
  supplier_id: number;
  supplier_code: string;
  num_of_containers: number;
  name: string;
  containers: {
    barcode: string;
    container_id: number;
    num_of_items: number;
    branch: {
      id: number;
      name: string;
    };
  }[];
}

export interface Branch {
  branch_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface Inventory {
  inventory_id: number;
  container_id: number;
  barcode_number: string;
  price: number;
  description: string;
  control_number: string;
  url: string;
  qty: string;
  status: "SOLD" | "UNSOLD";
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface Monitoring {
  inventory_id: number;
  barcode_number: string;
  control_number: string;
  description: string;
  qty: string;
  price: number;
  bidder_number: string;
}

export interface BidderAuction {}

export interface BidderRequirement {
  requirement_id: number;
  bidder_id: number;
  name: string;
  url?: string;
  validity_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface EncodingSheet {
  barcode: string;
  control_number: string;
  description: string;
  bidder: string;
  qty: string;
  price: string;
  manifest_num: string;
  status?: string;
  message?: string;
}

export interface InventoryDetails {
  auction_id?: number;
  inventory_id?: number;
  barcode_number?: string;
  control_number?: string;
  description?: string;
  qty?: string;
  price?: number;
  bidder_number?: string;
  item_status?: string;
  auction_inventory_id?: number;
  status?: string;
  manifest_number?: string;
}
