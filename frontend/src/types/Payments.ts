export type PaymentType = "CASH" | "CHEQUE" | "BANK_TRANSFER";
export type Purpose = "PULL_OUT" | "REGISTRATION" | "REFUNDED" | "LESS";

export type AuctionPayment = {
  purpose: Purpose;
  full_name: string;
  created_at: string;
  payment_id: number;
  amount_paid: string;
  payment_type: string;
  bidder_number: string;
};

export type AuctionTransaction = {
  auction_id: number;
  auction_date: string;
  payments: AuctionPayment[];
};

export type PullOutPayment = {
  payment_id: number;
  purpose: Purpose;
  receipt_number: string;
  payment_type: PaymentType;
  auction_id: number;
  bidder_number: string;
  full_name: string;
};

export type BidderAuctionTransaction = {
  payment_id: number;
  purpose: Purpose;
  amount_paid: string;
  receipt_number: string;
  payment_type: PaymentType;
  created_at: string;
  total_items: string;
};
