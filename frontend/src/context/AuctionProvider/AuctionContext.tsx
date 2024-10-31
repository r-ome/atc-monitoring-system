import { createContext, useContext, useReducer } from "react";
import { Auction, Bidder, Monitoring } from "../../types";
import axios from "axios";
import * as AuctionActions from "./actions";
import * as XLSX from "xlsx";

interface AuctionState {
  auction: any;
  auctions: Auction[];
  monitoring: Monitoring[];
  auctionBidders: Bidder[];
  payment: any;
  isLoading: boolean;
  sheetErrors: any;
  error: any;
}

interface AuctionStateContextType extends AuctionState {
  createAuction: () => Promise<void>;
  getAuctions: () => Promise<void>;
  getAuctionDetails: (id: number) => Promise<void>;
  getMonitoring: (id: number) => Promise<void>;
  getAuctionBidders: (id: number) => Promise<void>;
  uploadMonitoring: (file: any) => Promise<void>;
  registerBidderAtAuction: (id: number, bidder: any) => Promise<void>;
  payBidderItems: (
    auctionId: number,
    bidderId: number,
    amount: number,
    inventoryIds: number[]
  ) => Promise<void>;
}

export type MonitoringAction =
  | { type: "FETCH_MONITORING" }
  | { type: "FETCH_MONITORING_SUCCESS"; payload: { data: Monitoring[] } }
  | { type: "FETCH_MONITORING_FAILED"; payload: { error: null } }
  | { type: "FETCH_AUCTIONS" }
  | { type: "FETCH_AUCTIONS_SUCCESS"; payload: { data: Auction[] } }
  | { type: "FETCH_AUCTIONS_FAILED"; payload: { error: null } }
  | { type: "FETCH_AUCTION_BIDDERS" }
  | { type: "FETCH_AUCTION_BIDDERS_SUCCESS"; payload: { data: Bidder[] } }
  | { type: "FETCH_AUCTION_BIDDERS_FAILED"; payload: { error: null } }
  | { type: "CREATE_AUCTION" }
  | { type: "CREATE_AUCTION_SUCCESS"; payload: { data: Auction } }
  | { type: "CREATE_AUCTION_FAILED"; payload: { error: null } }
  | { type: "UPLOAD_MONITORING" }
  | { type: "UPLOAD_MONITORING_SUCCESS"; payload: { data: any } }
  | { type: "UPLOAD_MONITORING_FAILED"; payload: { error: null } }
  | { type: "REGISTER_BIDDER_AT_AUCTION" }
  | { type: "REGISTER_BIDDER_AT_AUCTION_SUCCESS"; payload: { data: any } }
  | { type: "REGISTER_BIDDER_AT_AUCTION_FAILED"; payload: { error: null } }
  | { type: "FETCH_AUCTION_DETAILS" }
  | { type: "FETCH_AUCTION_DETAILS_SUCCESS"; payload: { data: any } }
  | { type: "FETCH_AUCTION_DETAILS_FAILED"; payload: { error: null } }
  | { type: "BIDDER_PAYMENT" }
  | { type: "BIDDER_PAYMENT_SUCCESS"; payload: { data: any } }
  | { type: "BIDDER_PAYMENT_FAILED"; payload: { error: null } };

const initialState = {
  auction: {},
  auctions: [],
  monitoring: [],
  auctionBidders: [],
  payment: {},
  isLoading: false,
  sheetErrors: [],
  error: null,
};

const AuctionContext = createContext<AuctionStateContextType>({
  ...initialState,
  createAuction: async () => {},
  getMonitoring: async () => {},
  getAuctions: async () => {},
  getAuctionBidders: async () => {},
  uploadMonitoring: async () => {},
  registerBidderAtAuction: async () => {},
  getAuctionDetails: async () => {},
  payBidderItems: async () => {},
});

const monitoringReducer = (
  state: AuctionState,
  action: MonitoringAction
): AuctionState => {
  switch (action.type) {
    case AuctionActions.CREATE_AUCTION:
    case AuctionActions.FETCH_AUCTIONS:
    case AuctionActions.FETCH_AUCTION_BIDDERS:
    case AuctionActions.FETCH_MONITORING:
    case AuctionActions.UPLOAD_MONITORING:
    case AuctionActions.REGISTER_BIDDER_AT_AUCTION:
    case AuctionActions.FETCH_AUCTION_DETAILS:
    case AuctionActions.BIDDER_PAYMENT:
      return { ...state, isLoading: true };

    case AuctionActions.CREATE_AUCTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auctions: [...state.auctions, action.payload.data],
        error: null,
      };

    case AuctionActions.FETCH_MONITORING_SUCCESS:
      return { ...state, isLoading: false, monitoring: action.payload.data };
    case AuctionActions.FETCH_AUCTIONS_SUCCESS:
      return { ...state, isLoading: false, auctions: action.payload.data };
    case AuctionActions.FETCH_AUCTION_BIDDERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auctionBidders: action.payload.data,
      };

    case AuctionActions.UPLOAD_MONITORING_SUCCESS:
      return {
        ...state,
        isLoading: false,
        sheetErrors: action.payload.data.sheet_errors,
        monitoring: action.payload.data.monitoring,
      };

    case AuctionActions.REGISTER_BIDDER_AT_AUCTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auctionBidders: [...state.auctionBidders, action.payload.data],
        error: null,
      };

    case AuctionActions.FETCH_AUCTION_DETAILS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auction: action.payload.data,
        error: null,
      };

    case AuctionActions.BIDDER_PAYMENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        payment: action.payload.data,
        error: null,
      };

    case AuctionActions.UPLOAD_MONITORING_FAILED:
    case AuctionActions.CREATE_AUCTION_FAILED:
    case AuctionActions.FETCH_AUCTIONS_FAILED:
    case AuctionActions.FETCH_MONITORING_FAILED:
    case AuctionActions.FETCH_AUCTION_BIDDERS_FAILED:
    case AuctionActions.REGISTER_BIDDER_AT_AUCTION_FAILED:
    case AuctionActions.FETCH_AUCTION_DETAILS_FAILED:
    case AuctionActions.BIDDER_PAYMENT_FAILED:
      return { ...state, isLoading: false, error: action.payload.error };
  }
};

export const AuctionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(monitoringReducer, initialState);

  const getMonitoring = async (auctionId: number) => {
    dispatch({ type: AuctionActions.FETCH_MONITORING });
    try {
      const response = await axios.get(`/auctions/${auctionId}/monitoring`);
      dispatch({
        type: AuctionActions.FETCH_MONITORING_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.FETCH_MONITORING_FAILED,
        payload: error,
      });
    }
  };

  const getAuctions = async () => {
    dispatch({ type: AuctionActions.FETCH_AUCTIONS });
    try {
      const response = await axios.get("/auctions");
      dispatch({
        type: AuctionActions.FETCH_AUCTIONS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({ type: AuctionActions.FETCH_AUCTIONS_FAILED, payload: error });
    }
  };

  const getAuctionBidders = async (auctionId: number) => {
    dispatch({ type: AuctionActions.FETCH_AUCTION_BIDDERS });
    try {
      const response = await axios.get(`/auctions/${auctionId}/bidders`);
      dispatch({
        type: AuctionActions.FETCH_AUCTION_BIDDERS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.FETCH_AUCTION_BIDDERS_FAILED,
        payload: error,
      });
    }
  };

  const createAuction = async () => {
    dispatch({ type: AuctionActions.CREATE_AUCTION });
    try {
      const response = await axios.post("/auctions");
      dispatch({
        type: AuctionActions.CREATE_AUCTION_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.CREATE_AUCTION_FAILED,
        payload: error.data,
      });
    }
  };

  const uploadMonitoring = async (file: any) => {
    dispatch({ type: AuctionActions.UPLOAD_MONITORING });
    try {
      const response = await axios.post("/auctions/1/encode", { file });
      dispatch({
        type: AuctionActions.UPLOAD_MONITORING_SUCCESS,
        payload: { data: response.data },
      });
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: AuctionActions.UPLOAD_MONITORING_FAILED,
        payload: { error: null },
      });
    }
  };

  const registerBidderAtAuction = async (auctionId: number, bidder: any) => {
    dispatch({ type: AuctionActions.REGISTER_BIDDER_AT_AUCTION });
    try {
      const response = await axios.post(
        `/auctions/${auctionId}/register-bidder`,
        bidder
      );
      dispatch({
        type: AuctionActions.REGISTER_BIDDER_AT_AUCTION_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.REGISTER_BIDDER_AT_AUCTION_FAILED,
        payload: error.payload.data,
      });
    }
  };

  const getAuctionDetails = async (auctionId: number) => {
    dispatch({ type: AuctionActions.FETCH_AUCTION_DETAILS });
    try {
      const response = await axios.get(`/auctions/${auctionId}/details`);
      dispatch({
        type: AuctionActions.FETCH_AUCTION_DETAILS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.FETCH_AUCTION_DETAILS_FAILED,
        payload: error.payload.data,
      });
    }
  };

  const payBidderItems = async (
    auctionId: number,
    bidderId: number,
    amount: number,
    inventoryIds: number[]
  ) => {
    dispatch({ type: AuctionActions.BIDDER_PAYMENT });
    try {
      const response = await axios.post(`/auctions/${auctionId}/payment`, {
        bidder_id: bidderId,
        inventory_ids: inventoryIds,
        amount,
      });
      dispatch({
        type: AuctionActions.BIDDER_PAYMENT_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.BIDDER_PAYMENT_FAILED,
        payload: error.payload,
      });
    }
  };

  return (
    <AuctionContext.Provider
      value={{
        ...state,
        createAuction,
        getMonitoring,
        getAuctions,
        getAuctionBidders,
        uploadMonitoring,
        registerBidderAtAuction,
        getAuctionDetails,
        payBidderItems,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuction must be used within a AuctionProvider");
  }
  return context;
};
