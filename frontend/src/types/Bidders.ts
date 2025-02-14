export type BaseBidder = {
  bidder_id: number;
  bidder_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
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
  requirements: BaseBidderRequirement[];
};

export type CreateBidderPayload = {
  bidder_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
};
