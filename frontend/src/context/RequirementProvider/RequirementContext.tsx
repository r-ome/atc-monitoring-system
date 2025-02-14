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
}

export type BidderRequirementAction =
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
  }
};

export const BidderRequirementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(bidderRequirementReducer, initialState);

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
      dispatch({
        type: BidderRequirementActions.ADD_REQUIREMENT_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: BidderRequirementActions.ADD_REQUIREMENT_FAILED,
          payload: error.response?.data,
        });
      }
    }
  };

  return (
    <BidderRequirementContext.Provider
      value={{
        ...state,
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
