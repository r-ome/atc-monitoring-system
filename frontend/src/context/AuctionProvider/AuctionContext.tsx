import { createContext, useCallback, useContext, useReducer } from "react";
import {
  Auction,
  Monitoring,
  InventoryDetails,
  RegisteredBidders,
} from "../../types";
import axios from "axios";
import * as AuctionActions from "./actions";

interface AuctionState {
  auction: any;
  auctions: Auction[];
  monitoring: Monitoring[];
  manifestRecords: any[];
  registeredBidders?: RegisteredBidders;
  registeredBidder: any;
  inventory: InventoryDetails | null;
  payment: any;
  isLoading: boolean;
  sheetErrors: any;
  errors: any;
}

interface AuctionStateContextType extends AuctionState {
  createAuction: () => Promise<void>;
  getAuctions: () => Promise<void>;
  fetchAuctionDetails: (id: string) => Promise<void>;
  fetchMonitoring: (id: string) => Promise<void>;
  fetchManifestRecords: (id: string) => Promise<void>;
  fetchRegisteredBidders: (id: string) => Promise<void>;
  uploadMonitoring: (file: any) => Promise<void>;
  registerBidderAtAuction: (id: number, bidder: any) => Promise<void>;
  payBidderItems: (
    auctionId: number,
    bidderId: number,
    amount: number,
    inventoryIds: number[]
  ) => Promise<void>;
  cancelItem: (auctionId: number, inventoryId: number) => Promise<void>;
}

export type MonitoringAction =
  | { type: "FETCH_MONITORING" }
  | { type: "FETCH_MANIFEST_RECORDS" }
  | { type: "FETCH_AUCTIONS" }
  | { type: "FETCH_AUCTION_BIDDERS" }
  | { type: "CREATE_AUCTION" }
  | { type: "UPLOAD_MONITORING" }
  | { type: "REGISTER_BIDDER_AT_AUCTION" }
  | { type: "FETCH_AUCTION_DETAILS" }
  | { type: "BIDDER_PAYMENT" }
  | { type: "CANCEL_ITEM" }
  | { type: "FETCH_MANIFEST_RECORDS_SUCCESS"; payload: { data: any[] } }
  | { type: "FETCH_MONITORING_SUCCESS"; payload: { data: Monitoring[] } }
  | { type: "FETCH_AUCTIONS_SUCCESS"; payload: { data: Auction[] } }
  | {
      type: "FETCH_AUCTION_BIDDERS_SUCCESS";
      payload: { data: RegisteredBidders };
    }
  | { type: "CREATE_AUCTION_SUCCESS"; payload: { data: Auction } }
  | { type: "UPLOAD_MONITORING_SUCCESS"; payload: { data: any } }
  | { type: "REGISTER_BIDDER_AT_AUCTION_SUCCESS"; payload: { data: any } }
  | { type: "FETCH_AUCTION_DETAILS_SUCCESS"; payload: { data: any } }
  | { type: "BIDDER_PAYMENT_SUCCESS"; payload: { data: any } }
  | { type: "CANCEL_ITEM_SUCCESS"; payload: { data: InventoryDetails } }
  | { type: "FETCH_MANIFEST_RECORDS_FAILED"; payload: { errors: null } }
  | { type: "FETCH_AUCTIONS_FAILED"; payload: { errors: null } }
  | { type: "FETCH_MONITORING_FAILED"; payload: { errors: null } }
  | { type: "FETCH_AUCTION_BIDDERS_FAILED"; payload: { errors: null } }
  | { type: "CREATE_AUCTION_FAILED"; payload: { errors: null } }
  | { type: "UPLOAD_MONITORING_FAILED"; payload: { errors: null } }
  | { type: "REGISTER_BIDDER_AT_AUCTION_FAILED"; payload: { errors: null } }
  | { type: "FETCH_AUCTION_DETAILS_FAILED"; payload: { errors: null } }
  | { type: "BIDDER_PAYMENT_FAILED"; payload: { errors: null } }
  | { type: "CANCEL_ITEM_FAILED"; payload: { errors: null } };

const initialState = {
  auction: {},
  auctions: [],
  manifestRecords: [],
  monitoring: [],
  registeredBidders: undefined,
  registeredBidder: undefined,
  auctionBidders: [],
  inventory: null,
  payment: {},
  isLoading: false,
  sheetErrors: [],
  errors: null,
};

const AuctionContext = createContext<AuctionStateContextType>({
  ...initialState,
  createAuction: async () => {},
  fetchMonitoring: async () => {},
  fetchManifestRecords: async () => {},
  getAuctions: async () => {},
  fetchRegisteredBidders: async () => {},
  uploadMonitoring: async () => {},
  registerBidderAtAuction: async () => {},
  fetchAuctionDetails: async () => {},
  payBidderItems: async () => {},
  cancelItem: async () => {},
});

const monitoringReducer = (
  state: AuctionState,
  action: MonitoringAction
): AuctionState => {
  switch (action.type) {
    case AuctionActions.CREATE_AUCTION:
    case AuctionActions.FETCH_AUCTIONS:
    case AuctionActions.FETCH_MANIFEST_RECORDS:
    case AuctionActions.FETCH_AUCTION_BIDDERS:
    case AuctionActions.FETCH_MONITORING:
    case AuctionActions.UPLOAD_MONITORING:
    case AuctionActions.REGISTER_BIDDER_AT_AUCTION:
    case AuctionActions.FETCH_AUCTION_DETAILS:
    case AuctionActions.BIDDER_PAYMENT:
    case AuctionActions.CANCEL_ITEM:
      return { ...state, isLoading: true };

    case AuctionActions.CREATE_AUCTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auctions: [...state.auctions, action.payload.data],
        errors: null,
      };

    case AuctionActions.FETCH_MANIFEST_RECORDS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        manifestRecords: action.payload.data,
      };
    case AuctionActions.FETCH_MONITORING_SUCCESS:
      return { ...state, isLoading: false, monitoring: action.payload.data };
    case AuctionActions.FETCH_AUCTIONS_SUCCESS:
      return { ...state, isLoading: false, auctions: action.payload.data };
    case AuctionActions.FETCH_AUCTION_BIDDERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        registeredBidders: action.payload.data,
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
        registeredBidder: action.payload.data,
        errors: null,
      };

    case AuctionActions.FETCH_AUCTION_DETAILS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auction: action.payload.data,
        errors: null,
      };

    case AuctionActions.BIDDER_PAYMENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        payment: action.payload.data,
        errors: null,
      };
    case AuctionActions.CANCEL_ITEM_SUCCESS:
      return {
        ...state,
        inventory: action.payload.data,
        errors: null,
      };

    case AuctionActions.UPLOAD_MONITORING_FAILED:
    case AuctionActions.FETCH_MANIFEST_RECORDS_FAILED:
    case AuctionActions.CREATE_AUCTION_FAILED:
    case AuctionActions.FETCH_AUCTIONS_FAILED:
    case AuctionActions.FETCH_MONITORING_FAILED:
    case AuctionActions.FETCH_AUCTION_BIDDERS_FAILED:
    case AuctionActions.REGISTER_BIDDER_AT_AUCTION_FAILED:
    case AuctionActions.FETCH_AUCTION_DETAILS_FAILED:
    case AuctionActions.BIDDER_PAYMENT_FAILED:
    case AuctionActions.CANCEL_ITEM_FAILED:
      return { ...state, isLoading: false, errors: action.payload };
  }
};

export const AuctionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(monitoringReducer, initialState);

  const fetchManifestRecords = useCallback(async (auctionId: string) => {
    dispatch({ type: AuctionActions.FETCH_MANIFEST_RECORDS });
    try {
      const response = await axios.get(
        `/auctions/${auctionId}/manifest-records`
      );
      dispatch({
        type: AuctionActions.FETCH_MANIFEST_RECORDS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.FETCH_MANIFEST_RECORDS_FAILED,
        payload: error.payload,
      });
    }
  }, []);

  const fetchMonitoring = useCallback(async (auctionId: string) => {
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
        payload: error.payload,
      });
    }
  }, []);

  const getAuctions = async () => {
    dispatch({ type: AuctionActions.FETCH_AUCTIONS });
    try {
      const response = await axios.get("/auctions");
      dispatch({
        type: AuctionActions.FETCH_AUCTIONS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.FETCH_AUCTIONS_FAILED,
        payload: error.response.data,
      });
    }
  };

  const fetchRegisteredBidders = useCallback(async (auctionId: string) => {
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
        payload: error.response.data,
      });
    }
  }, []);

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
        payload: { errors: null },
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
        payload: error.response.data,
      });
    }
  };

  const fetchAuctionDetails = useCallback(async (auctionId: string) => {
    dispatch({ type: AuctionActions.FETCH_AUCTION_DETAILS });
    try {
      const response = await axios.get(`/auctions/${auctionId}`);
      dispatch({
        type: AuctionActions.FETCH_AUCTION_DETAILS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.FETCH_AUCTION_DETAILS_FAILED,
        payload: error.response.data,
      });
    }
  }, []);

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

  const cancelItem = async (auctionId: number, inventoryId: number) => {
    dispatch({ type: AuctionActions.CANCEL_ITEM });
    try {
      const response = await axios.post(
        `/auctions/${auctionId}/cancel-item/${inventoryId}`
      );
      dispatch({
        type: AuctionActions.CANCEL_ITEM_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: AuctionActions.CANCEL_ITEM_FAILED,
        payload: error.payload,
      });
    }
  };

  return (
    <AuctionContext.Provider
      value={{
        ...state,
        createAuction,
        fetchManifestRecords,
        fetchMonitoring,
        getAuctions,
        fetchRegisteredBidders,
        uploadMonitoring,
        registerBidderAtAuction,
        fetchAuctionDetails,
        payBidderItems,
        cancelItem,
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
