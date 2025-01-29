import { createContext, useContext, useReducer } from "react";
import { Bidder, BidderAuction } from "../../types";
import axios from "axios";
import * as BidderActions from "./actions";

interface BidderState {
  bidder: Bidder | null;
  bidders: Bidder[];
  bidderAuctions: BidderAuction[];
  auctionItems: {
    data: any[];
    totalBalance: number;
    bidderNumber: string;
    bidderName: string;
    auction: string;
    paidItems: number;
    unpaidItems: number;
  };
  payments: any[];
  isLoading: boolean;
  error: any;
}

interface BidderStateContextType extends BidderState {
  fetchBidder: (id: string) => Promise<void>;
  fetchBidders: () => Promise<void>;
  createBidder: (body: any) => Promise<void>;
  getBidderAuctions: (bidderId: string) => Promise<void>;
  updateBidder: (bidderId: string, body: any) => Promise<void>;
  getAuctionItems: (auctionId: string, bidderId: string) => Promise<void>;
  getBidderPaymentHistory: (bidderId: string) => Promise<void>;
}

export type BidderAction =
  | { type: "FETCH_BIDDER" }
  | { type: "FETCH_BIDDER_SUCCESS"; payload: { data: Bidder } }
  | { type: "FETCH_BIDDER_FAILED"; payload: null }
  | { type: "FETCH_BIDDERS" }
  | { type: "FETCH_BIDDERS_SUCCESS"; payload: { data: Bidder[] } }
  | { type: "FETCH_BIDDERS_FAILED"; payload: null }
  | { type: "CREATE_BIDDER" }
  | { type: "CREATE_BIDDER_SUCCESS"; payload: { data: Bidder } }
  | { type: "CREATE_BIDDER_FAILED"; payload: null }
  | { type: "UPDATE_BIDDER" }
  | { type: "UPDATE_BIDDER_SUCCESS"; payload: { data: Bidder } }
  | { type: "UPDATE_BIDDER_FAILED"; payload: null }
  | { type: "FETCH_BIDDER_AUCTIONS" }
  | {
      type: "FETCH_BIDDER_AUCTIONS_SUCCESS";
      payload: { data: BidderAuction[] };
    }
  | { type: "FETCH_BIDDER_AUCTIONS_FAILED"; payload: null }
  | { type: "FETCH_AUCTION_BIDDER_ITEMS" }
  | {
      type: "FETCH_AUCTION_BIDDER_ITEMS_SUCCESS";
      payload: {
        data: {
          data: [];
          totalBalance: number;
          auction: string;
          bidderNumber: string;
          bidderName: string;
          paidItems: number;
          unpaidItems: number;
        };
      };
    }
  | { type: "FETCH_AUCTION_BIDDER_ITEMS_FAILED"; payload: null }
  | { type: "FETCH_BIDDER_PAYMENT_HISTORY" }
  | {
      type: "FETCH_BIDDER_PAYMENT_HISTORY_SUCCESS";
      payload: { data: any[]; error: null };
    }
  | { type: "FETCH_BIDDER_PAYMENT_HISTORY_FAILED"; payload: null };

const initialState = {
  bidder: null,
  bidders: [],
  bidderAuctions: [],
  bidderRequirements: [],
  auctionItems: {
    data: [],
    totalBalance: 0,
    auction: "",
    bidderNumber: "",
    bidderName: "",
    paidItems: 0,
    unpaidItems: 0,
  },
  isLoading: false,
  payments: [],
  error: null,
};

const BidderContext = createContext<BidderStateContextType>({
  ...initialState,
  fetchBidder: async () => {},
  fetchBidders: async () => {},
  createBidder: async () => {},
  getBidderAuctions: async () => {},
  updateBidder: async () => {},
  getAuctionItems: async () => {},
  getBidderPaymentHistory: async () => {},
});

const bidderReducer = (
  state: BidderState,
  action: BidderAction
): BidderState => {
  switch (action.type) {
    case BidderActions.FETCH_BIDDER:
    case BidderActions.FETCH_BIDDERS:
    case BidderActions.CREATE_BIDDER:
    case BidderActions.UPDATE_BIDDER:
    case BidderActions.FETCH_BIDDER_AUCTIONS:
    case BidderActions.FETCH_AUCTION_BIDDER_ITEMS:
    case BidderActions.FETCH_BIDDER_PAYMENT_HISTORY:
      return { ...state, isLoading: true };

    case BidderActions.FETCH_BIDDER_SUCCESS:
      return { ...state, isLoading: false, bidder: action.payload.data };
    case BidderActions.FETCH_BIDDERS_SUCCESS:
      return { ...state, isLoading: false, bidders: action.payload.data };
    case BidderActions.UPDATE_BIDDER_SUCCESS:
    case BidderActions.CREATE_BIDDER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        bidder: action.payload.data,
        error: null,
      };
    case BidderActions.FETCH_BIDDER_AUCTIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        bidderAuctions: action.payload.data,
      };
    case BidderActions.FETCH_AUCTION_BIDDER_ITEMS_SUCCESS:
      return { ...state, isLoading: false, auctionItems: action.payload.data };

    case BidderActions.FETCH_BIDDER_PAYMENT_HISTORY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        payments: action.payload.data,
        error: null,
      };

    case BidderActions.FETCH_BIDDER_FAILED:
    case BidderActions.FETCH_BIDDERS_FAILED:
    case BidderActions.CREATE_BIDDER_FAILED:
    case BidderActions.UPDATE_BIDDER_FAILED:
    case BidderActions.FETCH_BIDDER_AUCTIONS_FAILED:
    case BidderActions.FETCH_AUCTION_BIDDER_ITEMS_FAILED:
    case BidderActions.FETCH_BIDDER_PAYMENT_HISTORY_FAILED:
      return { ...state, isLoading: false, error: action.payload };
  }
};

export const BidderProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(bidderReducer, initialState);

  const fetchBidder = async (bidderId: string) => {
    dispatch({ type: BidderActions.FETCH_BIDDER });
    try {
      const response = await axios.get(`/bidders/${bidderId}`);
      dispatch({
        type: BidderActions.FETCH_BIDDER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: BidderActions.FETCH_BIDDERS_FAILED,
        payload: error.data,
      });
    }
  };

  const fetchBidders = async () => {
    dispatch({ type: BidderActions.FETCH_BIDDERS });
    try {
      const response = await axios.get(`/bidders/`);
      dispatch({
        type: BidderActions.FETCH_BIDDERS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: BidderActions.FETCH_BIDDERS_FAILED,
        payload: error,
      });
    }
  };

  const createBidder = async (body: any) => {
    dispatch({ type: BidderActions.CREATE_BIDDER });
    try {
      const response = await axios.post("/bidders", body);
      dispatch({
        type: BidderActions.CREATE_BIDDER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: BidderActions.CREATE_BIDDER_FAILED,
        payload: error.response.data,
      });
    }
  };

  const updateBidder = async (bidderId: string, body: any) => {
    dispatch({ type: BidderActions.UPDATE_BIDDER });
    try {
      const response = await axios.put(`/bidders/${bidderId}`, {
        first_name: body.first_name,
        middle_name: body.middle_name,
        last_name: body.last_name,
        bidder_number: body.bidder_number,
        old_number: body.old_number,
      });
      dispatch({
        type: BidderActions.UPDATE_BIDDER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      console.log({ error });
      dispatch({
        type: BidderActions.UPDATE_BIDDER_FAILED,
        payload: error.response.data,
      });
    }
  };

  const getBidderAuctions = async (bidderId: string) => {
    dispatch({ type: BidderActions.FETCH_BIDDER_AUCTIONS });
    try {
      const response = await axios.get(`/bidders/${bidderId}/auctions`);
      dispatch({
        type: BidderActions.FETCH_BIDDER_AUCTIONS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: BidderActions.FETCH_BIDDER_AUCTIONS_FAILED,
        payload: error,
      });
    }
  };

  const getAuctionItems = async (auctionId: string, bidderId: string) => {
    dispatch({ type: BidderActions.FETCH_AUCTION_BIDDER_ITEMS });
    try {
      const response = await axios.get(
        `/auctions/${auctionId}/bidders/${bidderId}`
      );
      dispatch({
        type: BidderActions.FETCH_AUCTION_BIDDER_ITEMS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: BidderActions.FETCH_AUCTION_BIDDER_ITEMS_FAILED,
        payload: error,
      });
    }
  };

  const getBidderPaymentHistory = async (bidderId: string) => {
    dispatch({ type: BidderActions.FETCH_BIDDER_PAYMENT_HISTORY });
    try {
      const response = await axios.get(`/bidders/${bidderId}/payments`);
      dispatch({
        type: BidderActions.FETCH_BIDDER_PAYMENT_HISTORY_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: BidderActions.FETCH_BIDDER_PAYMENT_HISTORY_FAILED,
        payload: error.data,
      });
    }
  };

  return (
    <BidderContext.Provider
      value={{
        ...state,
        fetchBidder,
        fetchBidders,
        createBidder,
        getBidderAuctions,
        updateBidder,
        getAuctionItems,
        getBidderPaymentHistory,
      }}
    >
      {children}
    </BidderContext.Provider>
  );
};

export const useBidders = () => {
  const context = useContext(BidderContext);
  if (!context) {
    throw new Error("useBidders must be used within a BidderProvider");
  }
  return context;
};
