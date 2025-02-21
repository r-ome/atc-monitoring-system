export type BaseBidder = {
  bidder_id: number;
  bidder_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  status: "BANNED" | "ACTIVE" | "INACTIVE";
  registration_fee: number;
  service_charge: number | null;
  created_at: string;
  updated_at: string;
};

export type BaseBidderRequirement = {
  requirement_id: number;
  name: string;
  validity_date: string;
};

export type AddBidderRequirementResponse = BaseBidderRequirement & {
  bidder_id: number;
  name: string;
  validity_date: string;
  url: string;
  created_at: string;
  updated_at: string;
};

export type BidderRequirementPayload = {
  name: string;
  validity_date: string;
};

export type Bidder = BaseBidder & {
  birthdate: string | null;
  requirements: BaseBidderRequirement[];
};

export type CreateBidderPayload = {
  bidder_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  registration_fee: number;
  service_charge: number;
  birthdate: string;
};
