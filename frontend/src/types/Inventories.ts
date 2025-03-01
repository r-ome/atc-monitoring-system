import { AuctionItemStatus, AuctionItemHistory } from "./Auctions";

export type InventoryStatus = "SOLD" | "UNSOLD" | "REBID" | "VOID";

export type Inventory = {
  inventory_id: number;
  barcode: string;
  control: string;
  description: string;
  status: InventoryStatus;
  qty: string;
  price: number;
  created_at: string;
  updated_at: string;
};

export type InventoryProfile = {
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

export type ContainerInventory = {
  container_id: number;
  barcode: string;
  supplier: {
    name: string;
    supplier_id: string;
  };
  inventories: Inventory[];
};

export type AddInventoryResponse = {
  inventory_id: number;
  container_id: number;
  barcode: string;
  description: string;
  control: string;
  url: string;
  status: InventoryStatus;
  created_at: string;
  updated_at: string;
};

export type CreateInventoryPayload = {
  barcode: string;
  description: string;
  control: string;
  url?: string;
};
