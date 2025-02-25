export type BaseBranch = {
  branch_id: number;
  name: string;
  created_at: string;
};

type BranchContainers = {
  barcode: string;
  supplier: {
    id: string;
    name: string;
    supplier_code: string;
  };
  container_id: string;
  container_num: string;
};

export type Branch = BaseBranch & {
  updated_at: string;
  containers: BranchContainers[];
};

export type BranchPayload = {
  name: string;
};
