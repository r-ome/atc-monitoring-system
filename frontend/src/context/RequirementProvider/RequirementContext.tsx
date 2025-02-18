import { createContext, useContext, useReducer } from "react";
import axios, { isAxiosError } from "axios";
import moment from "moment";
import {
  APIError,
  AddBidderRequirementResponse,
  BidderRequirementPayload,
} from "@types";
import * as BidderRequirementActions from "./actions";

interface BidderRequirementState {
  requirement: AddBidderRequirementResponse | null;
  isLoading: boolean;
  error?: APIError;
}

interface BidderRequirementContextType extends BidderRequirementState {
  createBidderRequirement: (
    bidderId: number,
    body: BidderRequirementPayload
  ) => Promise<void>;
  resetCreateRequirementResponse: () => void;
}

export type BidderRequirementAction =
  | { type: "RESET_SUCCESS_RESPONSE" }
  | { type: "ADD_REQUIREMENT" }
  | {
      type: "ADD_REQUIREMENT_SUCCESS";
      payload: { data: AddBidderRequirementResponse };
    }
  | { type: "ADD_REQUIREMENT_FAILED"; payload: APIError };

const initialState = {
  requirement: null,
  isLoading: false,
  error: undefined,
};

const BidderRequirementContext = createContext<BidderRequirementContextType>({
  ...initialState,
  createBidderRequirement: async () => {},
  resetCreateRequirementResponse: () => {},
});

const bidderRequirementReducer = (
  state: BidderRequirementState,
  action: BidderRequirementAction
): BidderRequirementState => {
  switch (action.type) {
    case BidderRequirementActions.ADD_REQUIREMENT:
      return { ...state, isLoading: true };

    case BidderRequirementActions.ADD_REQUIREMENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        requirement: action.payload.data,
        error: undefined,
      };

    case BidderRequirementActions.ADD_REQUIREMENT_FAILED:
      return { ...state, isLoading: false, error: action.payload };

    case BidderRequirementActions.RESET_SUCCESS_RESPONSE:
      return { ...state, isLoading: false, requirement: null };
  }
};

export const BidderRequirementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(bidderRequirementReducer, initialState);

  const resetCreateRequirementResponse = () => {
    dispatch({ type: BidderRequirementActions.RESET_SUCCESS_RESPONSE });
  };

  const createBidderRequirement = async (
    bidderId: number,
    body: BidderRequirementPayload
  ) => {
    dispatch({ type: BidderRequirementActions.ADD_REQUIREMENT });
    try {
      const data = {
        name: body.name.toUpperCase(),
        url: "https://www.google.com",
        validity_date: moment(body.validity_date?.toString()).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      };

      const response = await axios.post(
        `/bidders/${bidderId}/requirements`,
        data
      );
      setTimeout(() => {
        dispatch({
          type: BidderRequirementActions.ADD_REQUIREMENT_SUCCESS,
          payload: response.data,
        });
      }, 3000);
    } catch (error: any) {
      if (isAxiosError(error) && error.response?.data) {
        setTimeout(() => {
          dispatch({
            type: BidderRequirementActions.ADD_REQUIREMENT_FAILED,
            payload: error.response?.data,
          });
        }, 3000);
      }
    }
  };

  return (
    <BidderRequirementContext.Provider
      value={{
        ...state,
        resetCreateRequirementResponse,
        createBidderRequirement,
      }}
    >
      {children}
    </BidderRequirementContext.Provider>
  );
};

export const useBidderRequirement = () => {
  const context = useContext(BidderRequirementContext);
  if (!context) {
    throw new Error(
      "useBidderRequirement must be used within a BidderRequirementProvider"
    );
  }
  return context;
};
