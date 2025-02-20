import { createContext, useCallback, useContext, useReducer } from "react";
import axios, { isAxiosError } from "axios";
import {
  BaseAuction,
  AuctionDetails,
  Monitoring,
  ManifestRecord,
  ManifestRecordResponse,
  RegisteredBidders,
  RegisterBidderPayload,
  RegisterBidderResponse,
  BidderAuctionProfile,
  ActionItemResponse,
  APIError,
  AuctionItemDetails,
  RefundPayload,
  ReassignPayload,
  AddOnPayload,
} from "@types";
import * as AuctionActions from "./actions";

interface AuctionState {
  auction: AuctionDetails | null;
  auctions: BaseAuction[];
  monitoring: Monitoring[];
  manifestRecords: ManifestRecord[];
  manifestRecord: ManifestRecordResponse | null;
  registeredBidders: RegisteredBidders | null;
  registeredBidder: RegisterBidderResponse | null;
  actionItemResponse: ActionItemResponse | null;
  bidder: BidderAuctionProfile | null;
  auctionItemDetails: AuctionItemDetails | null;
  isLoading: boolean;
  error: APIError | null;
}

interface AuctionStateContextType extends AuctionState {
  createAuction: () => Promise<void>;
  getAuctions: () => Promise<void>;
  fetchAuctionDetails: (id: string) => Promise<void>;
  fetchMonitoring: (id: string) => Promise<void>;
  fetchBidderAuctionProfile: (a: string, b: string) => Promise<void>;
  fetchManifestRecords: (id: string) => Promise<void>;
  fetchRegisteredBidders: (id: string) => Promise<void>;
  uploadManifest: (id: number | string, file: any) => Promise<void>;
  registerBidderAtAuction: (
    id: number | string,
    body: RegisterBidderPayload
  ) => Promise<void>;
  cancelItem: (
    auctionId: number | string,
    inventoryId: number | string,
    reason: string | null
  ) => Promise<void>;
  reassignItem: (
    auctionId: number | string,
    auctionInventoryId: number | string,
    body: ReassignPayload
  ) => Promise<void>;
  refundItem: (
    auctionId: number | string,
    auctionInventoryId: number | string,
    body: RefundPayload
  ) => Promise<void>;
  addOn: (auctionId: number | string, body: AddOnPayload) => Promise<void>;
  fetchAuctionItemDetails: (
    auctionId: string | number,
    auctionInventoryId: string | number
  ) => Promise<void>;
  resetRegisteredBidder: () => void;
  resetActionItem: () => void;
  resetAuction: () => void;
  resetAuctionItem: () => void;
}

export type MonitoringAction =
  | { type: "RESET_AUCTION_ITEM" }
  | { type: "RESET_AUCTION" }
  | { type: "RESET_ACTION_ITEM" }
  | { type: "RESET_REGISTERED_BIDDER" }
  | { type: "CREATE_AUCTION" }
  | { type: "CREATE_AUCTION_SUCCESS"; payload: { data: AuctionDetails } }
  | { type: "CREATE_AUCTION_FAILED"; payload: APIError }
  | { type: "FETCH_AUCTIONS" }
  | { type: "FETCH_AUCTIONS_SUCCESS"; payload: { data: BaseAuction[] } }
  | { type: "FETCH_AUCTIONS_FAILED"; payload: APIError }
  | { type: "FETCH_AUCTION_DETAILS" }
  | { type: "FETCH_AUCTION_DETAILS_SUCCESS"; payload: { data: AuctionDetails } }
  | { type: "FETCH_AUCTION_DETAILS_FAILED"; payload: APIError }
  | { type: "FETCH_MONITORING" }
  | { type: "FETCH_MONITORING_SUCCESS"; payload: { data: Monitoring[] } }
  | { type: "FETCH_MONITORING_FAILED"; payload: APIError }
  | { type: "CANCEL_ITEM" }
  | { type: "CANCEL_ITEM_SUCCESS"; payload: { data: ActionItemResponse } }
  | { type: "CANCEL_ITEM_FAILED"; payload: APIError }
  | { type: "REFUND_ITEM" }
  | { type: "REFUND_ITEM_SUCCESS"; payload: { data: ActionItemResponse } }
  | { type: "REFUND_ITEM_FAILED"; payload: APIError }
  | { type: "REASSIGN_ITEM" }
  | { type: "REASSIGN_ITEM_SUCCESS"; payload: { data: ActionItemResponse } }
  | { type: "REASSIGN_ITEM_FAILED"; payload: APIError }
  | { type: "ADD_ON" }
  | { type: "ADD_ON_SUCCESS"; payload: { data: AuctionItemDetails } }
  | { type: "ADD_ON_FAILED"; payload: APIError }
  | { type: "REGISTER_BIDDER_AT_AUCTION" }
  | {
      type: "REGISTER_BIDDER_AT_AUCTION_SUCCESS";
      payload: { data: RegisterBidderResponse };
    }
  | { type: "REGISTER_BIDDER_AT_AUCTION_FAILED"; payload: APIError }
  | { type: "FETCH_BIDDER_AUCTION_PROFILE" }
  | {
      type: "FETCH_BIDDER_AUCTION_PROFILE_SUCCESS";
      payload: { data: BidderAuctionProfile };
    }
  | { type: "FETCH_BIDDER_AUCTION_PROFILE_FAILED"; payload: APIError }
  | { type: "FETCH_MANIFEST_RECORDS" }
  | {
      type: "FETCH_MANIFEST_RECORDS_SUCCESS";
      payload: { data: ManifestRecord[] };
    }
  | { type: "FETCH_MANIFEST_RECORDS_FAILED"; payload: APIError }
  | { type: "UPLOAD_MANIFEST" }
  | {
      type: "UPLOAD_MANIFEST_SUCCESS";
      payload: { data: ManifestRecordResponse };
    }
  | { type: "UPLOAD_MANIFEST_FAILED"; payload: APIError }
  | { type: "FETCH_REGISTERED_BIDDERS" }
  | {
      type: "FETCH_REGISTERED_BIDDERS_SUCCESS";
      payload: { data: RegisteredBidders };
    }
  | { type: "FETCH_REGISTERED_BIDDERS_FAILED"; payload: APIError }
  | { type: "FETCH_AUCTION_ITEM_DETAILS" }
  | {
      type: "FETCH_AUCTION_ITEM_DETAILS_SUCCESS";
      payload: { data: AuctionItemDetails };
    }
  | { type: "FETCH_AUCTION_ITEM_DETAILS_FAILED"; payload: APIError };

const initialState = {
  auction: null,
  auctions: [],
  manifestRecords: [],
  manifestRecord: null,
  monitoring: [],
  registeredBidders: null,
  registeredBidder: null,
  auctionBidders: [],
  actionItemResponse: null,
  auctionItemDetails: null,
  bidder: null,
  isLoading: false,
  error: null,
};

const AuctionContext = createContext<AuctionStateContextType>({
  ...initialState,
  createAuction: async () => {},
  fetchMonitoring: async () => {},
  fetchManifestRecords: async () => {},
  fetchBidderAuctionProfile: async () => {},
  getAuctions: async () => {},
  fetchRegisteredBidders: async () => {},
  uploadManifest: async () => {},
  registerBidderAtAuction: async () => {},
  fetchAuctionDetails: async () => {},
  fetchAuctionItemDetails: async () => {},
  cancelItem: async () => {},
  refundItem: async () => {},
  reassignItem: async () => {},
  addOn: async () => {},
  resetRegisteredBidder: () => {},
  resetActionItem: () => {},
  resetAuction: () => {},
  resetAuctionItem: () => {},
});

const monitoringReducer = (
  state: AuctionState,
  action: MonitoringAction
): AuctionState => {
  switch (action.type) {
    case AuctionActions.CREATE_AUCTION:
    case AuctionActions.FETCH_AUCTION_ITEM_DETAILS:
    case AuctionActions.FETCH_AUCTIONS:
    case AuctionActions.FETCH_MANIFEST_RECORDS:
    case AuctionActions.FETCH_REGISTERED_BIDDERS:
    case AuctionActions.FETCH_MONITORING:
    case AuctionActions.UPLOAD_MANIFEST:
    case AuctionActions.REGISTER_BIDDER_AT_AUCTION:
    case AuctionActions.FETCH_AUCTION_DETAILS:
    case AuctionActions.CANCEL_ITEM:
    case AuctionActions.REFUND_ITEM:
    case AuctionActions.REASSIGN_ITEM:
    case AuctionActions.ADD_ON:
    case AuctionActions.FETCH_BIDDER_AUCTION_PROFILE:
      return { ...state, isLoading: true };

    case AuctionActions.FETCH_BIDDER_AUCTION_PROFILE_SUCCESS:
      return { ...state, isLoading: false, bidder: action.payload.data };

    case AuctionActions.CREATE_AUCTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auctions: [...state.auctions, action.payload.data],
        error: null,
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
    case AuctionActions.FETCH_REGISTERED_BIDDERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        registeredBidders: action.payload.data,
      };

    case AuctionActions.UPLOAD_MANIFEST_SUCCESS:
      return {
        ...state,
        manifestRecord: action.payload.data,
        isLoading: false,
        error: null,
      };

    case AuctionActions.REGISTER_BIDDER_AT_AUCTION_SUCCESS:
      let registeredBidders = Object.assign({}, state.registeredBidders);
      registeredBidders.bidders = [
        ...registeredBidders.bidders,
        action.payload.data,
      ];
      return {
        ...state,
        isLoading: false,
        registeredBidder: action.payload.data,
        registeredBidders: registeredBidders,
        error: null,
      };

    case AuctionActions.FETCH_AUCTION_DETAILS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auction: action.payload.data,
        error: null,
      };

    case AuctionActions.ADD_ON_SUCCESS:
    case AuctionActions.FETCH_AUCTION_ITEM_DETAILS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        auctionItemDetails: action.payload.data,
        error: null,
      };

    case AuctionActions.REFUND_ITEM_SUCCESS:
    case AuctionActions.REASSIGN_ITEM_SUCCESS:
    case AuctionActions.CANCEL_ITEM_SUCCESS:
      return {
        ...state,
        actionItemResponse: action.payload.data,
        error: null,
      };

    case AuctionActions.ADD_ON_FAILED:
    case AuctionActions.FETCH_AUCTION_ITEM_DETAILS_FAILED:
    case AuctionActions.FETCH_BIDDER_AUCTION_PROFILE_FAILED:
    case AuctionActions.UPLOAD_MANIFEST_FAILED:
    case AuctionActions.FETCH_MANIFEST_RECORDS_FAILED:
    case AuctionActions.CREATE_AUCTION_FAILED:
    case AuctionActions.FETCH_AUCTIONS_FAILED:
    case AuctionActions.FETCH_MONITORING_FAILED:
    case AuctionActions.FETCH_REGISTERED_BIDDERS_FAILED:
    case AuctionActions.REGISTER_BIDDER_AT_AUCTION_FAILED:
    case AuctionActions.FETCH_AUCTION_DETAILS_FAILED:
    case AuctionActions.CANCEL_ITEM_FAILED:
    case AuctionActions.REFUND_ITEM_FAILED:
    case AuctionActions.REASSIGN_ITEM_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        manifestRecord: null,
      };

    case AuctionActions.RESET_REGISTERED_BIDDER:
      return {
        ...state,
        isLoading: false,
        error: null,
        registeredBidder: null,
      };

    case AuctionActions.RESET_AUCTION:
      return {
        ...state,
        isLoading: false,
        error: null,
        auction: null,
      };

    case AuctionActions.RESET_AUCTION_ITEM:
      return {
        ...state,
        isLoading: false,
        auctionItemDetails: null,
        error: null,
      };

    case AuctionActions.RESET_ACTION_ITEM:
      return {
        ...state,
        isLoading: false,
        error: null,
        actionItemResponse: null,
      };
  }
};

export const AuctionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(monitoringReducer, initialState);

  const fetchBidderAuctionProfile = useCallback(
    async (auctionId: string, bidderId: string) => {
      dispatch({ type: AuctionActions.FETCH_BIDDER_AUCTION_PROFILE });
      try {
        const response = await axios.get(
          `/auctions/${auctionId}/bidders/${bidderId}`
        );
        dispatch({
          type: AuctionActions.FETCH_BIDDER_AUCTION_PROFILE_SUCCESS,
          payload: response.data,
        });
      } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
          dispatch({
            type: AuctionActions.FETCH_BIDDER_AUCTION_PROFILE_FAILED,
            payload: error.response.data,
          });
        }
      }
    },
    []
  );

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
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.FETCH_MANIFEST_RECORDS_FAILED,
          payload: error.response.data,
        });
      }
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
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.FETCH_MONITORING_FAILED,
          payload: error.response.data,
        });
      }
    }
  }, []);

  const getAuctions = useCallback(async () => {
    dispatch({ type: AuctionActions.FETCH_AUCTIONS });
    try {
      const response = await axios.get("/auctions");
      dispatch({
        type: AuctionActions.FETCH_AUCTIONS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.FETCH_AUCTIONS_FAILED,
          payload: error.response.data,
        });
      }
    }
  }, []);

  const fetchRegisteredBidders = useCallback(async (auctionId: string) => {
    dispatch({ type: AuctionActions.FETCH_REGISTERED_BIDDERS });
    try {
      const response = await axios.get(`/auctions/${auctionId}/bidders`);
      dispatch({
        type: AuctionActions.FETCH_REGISTERED_BIDDERS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.FETCH_REGISTERED_BIDDERS_FAILED,
          payload: error.response.data,
        });
      }
    }
  }, []);

  const createAuction = async () => {
    dispatch({ type: AuctionActions.CREATE_AUCTION });
    try {
      const response = await axios.post("/auctions");
      setTimeout(() => {
        dispatch({
          type: AuctionActions.CREATE_AUCTION_SUCCESS,
          payload: response.data,
        });
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        if (isAxiosError(error) && error.response?.data) {
          dispatch({
            type: AuctionActions.CREATE_AUCTION_FAILED,
            payload: error.response.data,
          });
        }
      }, 1000);
    }
  };

  const uploadManifest = async (auctionId: number | string, file: any) => {
    dispatch({ type: AuctionActions.UPLOAD_MANIFEST });
    try {
      const response = await axios.post(`/auctions/${auctionId}/encode`, file);
      dispatch({
        type: AuctionActions.UPLOAD_MANIFEST_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.UPLOAD_MANIFEST_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const registerBidderAtAuction = async (
    auctionId: number | string,
    body: RegisterBidderPayload
  ) => {
    dispatch({ type: AuctionActions.REGISTER_BIDDER_AT_AUCTION });
    try {
      const response = await axios.post(
        `/auctions/${auctionId}/register-bidder`,
        body
      );
      setTimeout(() => {
        dispatch({
          type: AuctionActions.REGISTER_BIDDER_AT_AUCTION_SUCCESS,
          payload: response.data,
        });
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        if (isAxiosError(error) && error.response?.data) {
          dispatch({
            type: AuctionActions.REGISTER_BIDDER_AT_AUCTION_FAILED,
            payload: error.response.data,
          });
        }
      }, 1000);
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
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.FETCH_AUCTION_DETAILS_FAILED,
          payload: error.response.data,
        });
      }
    }
  }, []);

  const cancelItem = async (
    auctionId: number | string,
    inventoryId: number | string,
    reason: string | null
  ) => {
    dispatch({ type: AuctionActions.CANCEL_ITEM });
    try {
      const response = await axios.post(
        `/auctions/${auctionId}/cancel-item/${inventoryId}`,
        { reason }
      );
      setTimeout(() => {
        dispatch({
          type: AuctionActions.CANCEL_ITEM_SUCCESS,
          payload: response.data,
        });
      }, 1000);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.CANCEL_ITEM_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const refundItem = async (
    auctionId: number | string,
    auctionInventoryId: number | string,
    body: RefundPayload
  ) => {
    dispatch({ type: AuctionActions.REFUND_ITEM });
    try {
      const response = await axios.post(
        `/auctions/${auctionId}/discount-item/${auctionInventoryId}`,
        body
      );
      dispatch({
        type: AuctionActions.REFUND_ITEM_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.REFUND_ITEM_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const reassignItem = async (
    auctionId: number | string,
    auctionInventoryId: number | string,
    body: ReassignPayload
  ) => {
    dispatch({ type: AuctionActions.REASSIGN_ITEM });
    try {
      const response = await axios.post(
        `/auctions/${auctionId}/reassign-item/${auctionInventoryId}`,
        body
      );
      dispatch({
        type: AuctionActions.REASSIGN_ITEM_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.REASSIGN_ITEM_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const addOn = async (auctionId: number | string, body: AddOnPayload) => {
    dispatch({ type: AuctionActions.ADD_ON });
    try {
      const response = await axios.post(`/auctions/${auctionId}/add-on`, body);
      dispatch({ type: AuctionActions.ADD_ON_SUCCESS, payload: response.data });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuctionActions.ADD_ON_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const fetchAuctionItemDetails = useCallback(
    async (auctionId: string | number, auctionInventoryId: string | number) => {
      dispatch({ type: AuctionActions.FETCH_AUCTION_ITEM_DETAILS });
      try {
        const response = await axios.get(
          `/auctions/${auctionId}/item/${auctionInventoryId}`
        );
        dispatch({
          type: AuctionActions.FETCH_AUCTION_ITEM_DETAILS_SUCCESS,
          payload: response.data,
        });
      } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
          dispatch({
            type: AuctionActions.FETCH_AUCTION_ITEM_DETAILS_FAILED,
            payload: error.response.data,
          });
        }
      }
    },
    []
  );

  const resetRegisteredBidder = useCallback(
    () => dispatch({ type: AuctionActions.RESET_REGISTERED_BIDDER }),
    []
  );

  const resetActionItem = useCallback(
    () => dispatch({ type: AuctionActions.RESET_ACTION_ITEM }),
    []
  );

  const resetAuction = useCallback(
    () => dispatch({ type: AuctionActions.RESET_AUCTION }),
    []
  );

  const resetAuctionItem = useCallback(
    () => dispatch({ type: AuctionActions.RESET_AUCTION_ITEM }),
    []
  );

  return (
    <AuctionContext.Provider
      value={{
        ...state,
        addOn,
        resetAuctionItem,
        createAuction,
        fetchAuctionItemDetails,
        fetchManifestRecords,
        fetchMonitoring,
        fetchBidderAuctionProfile,
        getAuctions,
        fetchRegisteredBidders,
        uploadManifest,
        registerBidderAtAuction,
        fetchAuctionDetails,
        cancelItem,
        refundItem,
        reassignItem,
        resetRegisteredBidder,
        resetActionItem,
        resetAuction,
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
