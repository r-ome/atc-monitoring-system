export type BaseSupplier = {
  supplier_id: number;
  name: string;
  supplier_code: string;
  total_containers: number;
  created_at: string;
  updated_at: string;
};

export type Supplier = BaseSupplier & {
  num_of_containers: number;
  japanese_name?: string;
  shipper: string;
  updated_at: string;
};

export type CreateSupplierPayload = {
  name: string;
  japanese_name?: string;
  shipper: string;
  supplier_code: string;
};
