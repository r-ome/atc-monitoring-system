export type InventoryStatus = "SOLD" | "UNSOLD" | "REBID";

export type Inventory = {
  url: string | null;
  status: InventoryStatus;
  barcode: string;
  created_at: string;
  updated_at: string;
  description: string;
  inventory_id: number;
  control_number: string;
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
  control_number: string;
  url: string;
  status: InventoryStatus;
  created_at: string;
  updated_at: string;
};

export type CreateInventoryPayload = {
  barcode: string;
  description: string;
  control_number: string;
  url?: string;
};
