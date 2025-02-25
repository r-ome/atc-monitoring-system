export type BidderStatus = "BANNED" | "ACTIVE" | "INACTIVE";

export type BaseBidder = {
  bidder_id: number;
  bidder_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  status: BidderStatus;
  registration_fee: number;
  service_charge: number;
  has_balance?: {
    balance: number;
    auction_id: number;
    auction_date: string;
  };
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
  birthdate: string;
  contact_number: string;
  registered_at: string;
  remarks: string;
  requirements: BaseBidderRequirement[];
};

export type CreateBidderPayload = {
  bidder_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  status: BidderStatus;
  registration_fee: number;
  service_charge: number;
  birthdate: string;
  registered_at: string;
  contact_number: string;
};

export type UpdateBidderPayload = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  status: BidderStatus;
  registration_fee: number;
  service_charge: number;
  contact_number: string;
  birthdate: any;
  remarks?: string;
};
