import { createContext, useContext, useReducer, useCallback } from "react";
import axios, { isAxiosError } from "axios";
import {
  BaseBidder,
  Bidder,
  CreateBidderPayload,
  APIError,
  UpdateBidderPayload,
} from "@types";
import * as BidderActions from "./actions";

interface BidderState {
  bidder: Bidder | null;
  bidders: BaseBidder[];
  isLoading: boolean;
  error?: APIError;
}

interface BidderStateContextType extends BidderState {
  fetchBidder: (id: string | number) => Promise<void>;
  fetchBidders: () => Promise<void>;
  createBidder: (body: CreateBidderPayload) => Promise<void>;
  updateBidder: (
    bidderId: string | number,
    body: UpdateBidderPayload
  ) => Promise<void>;
  resetCreateBidderResponse: () => void;
  resetError: () => void;
}

export type BidderAction =
  | { type: "RESET_ERROR" }
  | { type: "RESET_CREATE_BIDDER_RESPONSE" }
  | { type: "FETCH_BIDDER" }
  | { type: "FETCH_BIDDER_SUCCESS"; payload: { data: Bidder } }
  | { type: "FETCH_BIDDER_FAILED"; payload: APIError }
  | { type: "FETCH_BIDDERS" }
  | { type: "FETCH_BIDDERS_SUCCESS"; payload: { data: Bidder[] } }
  | { type: "FETCH_BIDDERS_FAILED"; payload: APIError }
  | { type: "CREATE_BIDDER" }
  | { type: "CREATE_BIDDER_SUCCESS"; payload: { data: Bidder } }
  | { type: "CREATE_BIDDER_FAILED"; payload: APIError }
  | { type: "UPDATE_BIDDER" }
  | { type: "UPDATE_BIDDER_SUCCESS"; payload: { data: Bidder } }
  | { type: "UPDATE_BIDDER_FAILED"; payload: APIError };

const initialState = {
  bidder: null,
  bidders: [],
  bidderAuctions: [],
  bidderRequirements: [],
  isLoading: false,
  payments: [],
  error: undefined,
};

const BidderContext = createContext<BidderStateContextType>({
  ...initialState,
  fetchBidder: async () => {},
  fetchBidders: async () => {},
  createBidder: async () => {},
  updateBidder: async () => {},
  resetCreateBidderResponse: () => {},
  resetError: () => {},
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
      return { ...state, isLoading: true };

    case BidderActions.FETCH_BIDDER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        bidder: action.payload.data,
        error: undefined,
      };
    case BidderActions.FETCH_BIDDERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        bidders: action.payload.data,
        error: undefined,
      };

    case BidderActions.UPDATE_BIDDER_SUCCESS:
    case BidderActions.CREATE_BIDDER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        bidder: action.payload.data,
        error: undefined,
      };

    case BidderActions.FETCH_BIDDER_FAILED:
    case BidderActions.FETCH_BIDDERS_FAILED:
    case BidderActions.CREATE_BIDDER_FAILED:
    case BidderActions.UPDATE_BIDDER_FAILED:
      return { ...state, isLoading: false, error: action.payload };

    case BidderActions.RESET_CREATE_BIDDER_RESPONSE:
      return { ...state, isLoading: false, bidder: null };
    case BidderActions.RESET_ERROR:
      return { ...state, isLoading: false, error: undefined };
  }
};

export const BidderProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(bidderReducer, initialState);

  const fetchBidder = useCallback(async (bidderId: string | number) => {
    dispatch({ type: BidderActions.FETCH_BIDDER });
    try {
      const response = await axios.get(`/bidders/${bidderId}`);
      dispatch({
        type: BidderActions.FETCH_BIDDER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: BidderActions.FETCH_BIDDERS_FAILED,
          payload: error.response?.data,
        });
      }
    }
  }, []);

  const fetchBidders = useCallback(async () => {
    dispatch({ type: BidderActions.FETCH_BIDDERS });
    try {
      const response = await axios.get(`/bidders/`);
      dispatch({
        type: BidderActions.FETCH_BIDDERS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: BidderActions.FETCH_BIDDERS_FAILED,
          payload: error.response?.data,
        });
      }
    }
  }, []);

  const createBidder = async (body: CreateBidderPayload) => {
    dispatch({ type: BidderActions.CREATE_BIDDER });
    try {
      const response = await axios.post("/bidders", body);
      dispatch({
        type: BidderActions.CREATE_BIDDER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: BidderActions.CREATE_BIDDER_FAILED,
          payload: error.response?.data,
        });
      }
    }
  };

  const updateBidder = async (
    bidderId: string | number,
    body: UpdateBidderPayload
  ) => {
    dispatch({ type: BidderActions.UPDATE_BIDDER });
    try {
      const response = await axios.put(`/bidders/${bidderId}`, body);
      setTimeout(() => {
        dispatch({
          type: BidderActions.UPDATE_BIDDER_SUCCESS,
          payload: response.data,
        });
      }, 2000);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: BidderActions.UPDATE_BIDDER_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const resetCreateBidderResponse = useCallback(() => {
    dispatch({ type: BidderActions.RESET_CREATE_BIDDER_RESPONSE });
  }, []);

  const resetError = useCallback(
    () => dispatch({ type: BidderActions.RESET_ERROR }),
    []
  );

  return (
    <BidderContext.Provider
      value={{
        ...state,
        fetchBidder,
        fetchBidders,
        createBidder,
        updateBidder,
        resetCreateBidderResponse,
        resetError,
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
