export type BaseContainer = {
  container_id: number;
  barcode: string;
  num_of_items: number;
  branch: {
    branch_id: number;
    name: string;
  };
};

export type Container = BaseContainer & {
  supplier: {
    supplier_id: string;
    code: string;
    name: string;
  };
  sold_items: string;
  container_num: number;
  bill_of_lading_number: string;
  total_sold_item_price: string;
  port_of_landing: string;
  carrier: string;
  vessel: string;
  num_of_items: string;
  departure_date_from_japan: string;
  eta_to_ph: string;
  arrival_date_warehouse_ph: string;
  sorting_date: string;
  auction_date: string;
  payment_date: string;
  telegraphic_transferred: string;
  vanning_date: string;
  devanning_date: string;
  invoice_num: string;
  gross_weight: string;
  auction_or_sell: string;
  created_at: string;
  updated_at: string;
};

export type CreateContainerPayload = {
  arrival_date_warehouse_ph: string;
  auction_date: string;
  auction_or_sell: "AUCTION" | "SELL";
  bill_of_lading_number: string;
  branch_id: string;
  carrier: string;
  container_num: string;
  departure_date_from_japan: string;
  eta_to_ph: string;
  gross_weight: string;
  invoice_num: string;
  payment_date: string;
  port_of_landing: string;
  sorting_date: string;
  telegraphic_transferred: string;
  vanning_date: string;
  vessel: string;
};
