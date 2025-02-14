import { createContext, useCallback, useContext, useReducer } from "react";
import axios from "axios";
import {
  APIError,
  AuctionTransaction,
  PullOutPayment,
  BidderAuctionTransaction,
} from "@types";
import * as PaymentActions from "./action";

interface PaymentState {
  payment: PullOutPayment | null;
  auctionTransactions: AuctionTransaction | null;
  bidderTransactions: BidderAuctionTransaction[];
  isLoading: boolean;
  error?: APIError;
}

interface PaymentContextType extends PaymentState {
  resetPaymentState: () => void;
  fetchAuctionTransactions: (auctionId: string) => Promise<void>;
  payBidderItems: (
    auctionId: string,
    auctionBiddersId: number,
    inventoryIds: number[]
  ) => Promise<void>;
  fetchBidderAuctionTransactions: (
    auctionId: string,
    auctionBidderId: number
  ) => Promise<void>;
}

export type PaymentAction =
  | { type: "RESET_PAYMENT_STATE" }
  | { type: "FETCH_AUCTION_PAYMENT" }
  | {
      type: "FETCH_AUCTION_PAYMENT_SUCCESS";
      payload: { data: AuctionTransaction };
    }
  | { type: "FETCH_AUCTION_PAYMENT_FAILED"; payload: APIError }
  | { type: "BIDDER_PULLOUT_PAYMENT" }
  | {
      type: "BIDDER_PULLOUT_PAYMENT_SUCCESS";
      payload: { data: PullOutPayment };
    }
  | { type: "BIDDER_PULLOUT_PAYMENT_FAILED"; payload: APIError }
  | { type: "FETCH_BIDDER_AUCTION_TRANSACTIONS" }
  | {
      type: "FETCH_BIDDER_AUCTION_TRANSACTIONS_SUCCESS";
      payload: { data: BidderAuctionTransaction[] };
    }
  | {
      type: "FETCH_BIDDER_AUCTION_TRANSACTIONS_FAILED";
      payload: APIError;
    };

const initialState: PaymentState = {
  payment: null,
  auctionTransactions: null,
  bidderTransactions: [],
  isLoading: false,
  error: undefined,
};

const PaymentContext = createContext<PaymentContextType>({
  ...initialState,
  fetchAuctionTransactions: async () => {},
  payBidderItems: async () => {},
  resetPaymentState: () => {},
  fetchBidderAuctionTransactions: async () => {},
});

const paymentsReducer = (
  state: PaymentState,
  action: PaymentAction
): PaymentState => {
  switch (action.type) {
    case PaymentActions.FETCH_AUCTION_PAYMENT:
    case PaymentActions.FETCH_BIDDER_AUCTION_TRANSACTIONS:
    case PaymentActions.BIDDER_PULLOUT_PAYMENT:
      return { ...state, isLoading: true };

    case PaymentActions.FETCH_BIDDER_AUCTION_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        bidderTransactions: action.payload.data,
      };
    case PaymentActions.FETCH_AUCTION_PAYMENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auctionTransactions: action.payload.data,
      };
    case PaymentActions.BIDDER_PULLOUT_PAYMENT_SUCCESS:
      return {
        ...state,
        payment: action.payload.data,
        isLoading: false,
        error: undefined,
      };

    case PaymentActions.FETCH_BIDDER_AUCTION_TRANSACTIONS_FAILED:
    case PaymentActions.BIDDER_PULLOUT_PAYMENT_FAILED:
    case PaymentActions.FETCH_AUCTION_PAYMENT_FAILED:
      return { ...state, isLoading: false, error: action.payload };

    case PaymentActions.RESET_PAYMENT_STATE:
      return { ...state, payment: null };
  }
};

export const PaymentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(paymentsReducer, initialState);

  const fetchAuctionTransactions = useCallback(async (auctionId: string) => {
    dispatch({ type: PaymentActions.FETCH_AUCTION_PAYMENT });
    try {
      const response = await axios.get(`/auctions/${auctionId}/payments`);
      dispatch({
        type: PaymentActions.FETCH_AUCTION_PAYMENT_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: PaymentActions.FETCH_AUCTION_PAYMENT_FAILED,
        payload: error.payload,
      });
    }
  }, []);

  const payBidderItems = async (
    auctionId: string,
    auctionBiddersId: number,
    inventoryIds: number[]
  ) => {
    dispatch({ type: PaymentActions.BIDDER_PULLOUT_PAYMENT });
    try {
      const response = await axios.post(
        `/auctions/${auctionId}/payments/pull-out`,
        {
          auction_bidders_id: auctionBiddersId,
          auction_inventory_ids: inventoryIds,
        }
      );
      dispatch({
        type: PaymentActions.BIDDER_PULLOUT_PAYMENT_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: PaymentActions.BIDDER_PULLOUT_PAYMENT_FAILED,
        payload: error.response.data,
      });
    }
  };

  const fetchBidderAuctionTransactions = useCallback(
    async (auctionId: string, auctionBidderId: number) => {
      dispatch({ type: PaymentActions.FETCH_BIDDER_AUCTION_TRANSACTIONS });
      try {
        const response = await axios.get(
          `/auctions/${auctionId}/payments/${auctionBidderId}/transactions`
        );
        dispatch({
          type: PaymentActions.FETCH_BIDDER_AUCTION_TRANSACTIONS_SUCCESS,
          payload: response.data,
        });
      } catch (error: any) {
        dispatch({
          type: PaymentActions.FETCH_BIDDER_AUCTION_TRANSACTIONS_FAILED,
          payload: error.response.data,
        });
      }
    },
    []
  );

  const resetPaymentState = async () => {
    dispatch({ type: PaymentActions.RESET_PAYMENT_STATE });
  };

  return (
    <PaymentContext.Provider
      value={{
        ...state,
        fetchAuctionTransactions,
        payBidderItems,
        resetPaymentState,
        fetchBidderAuctionTransactions,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayments must be used within a PaymentProvider");
  }
  return context;
};
