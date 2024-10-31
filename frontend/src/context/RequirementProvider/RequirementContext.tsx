import { createContext, useContext, useReducer } from "react";
import axios from "axios";
import { BidderRequirement } from "../../types";
import * as BidderRequirementActions from "./actions";
import moment from "moment";

interface BidderRequirementState {
  requirements: BidderRequirement[];
  isLoading: boolean;
  error: any;
}

interface BidderRequirementContextType extends BidderRequirementState {
  getBidderRequirements: (bidderId: number) => Promise<void>;
  addBidderRequirement: (bidderId: number, formData: FormData) => Promise<void>;
}

export type BidderRequirementAction =
  | { type: "FETCH_REQUIREMENTS" }
  | { type: "ADD_REQUIREMENT" }
  | {
      type: "FETCH_REQUIREMENTS_SUCCESS";
      payload: { data: BidderRequirement[] };
    }
  | { type: "ADD_REQUIREMENT_SUCCESS"; payload: { data: BidderRequirement } }
  | { type: "FETCH_REQUIREMENTS_FAILED"; payload: null }
  | { type: "ADD_REQUIREMENT_FAILED"; payload: null };

const initialState = {
  requirements: [],
  isLoading: false,
  error: null,
};

const BidderRequirementContext = createContext<BidderRequirementContextType>({
  ...initialState,
  getBidderRequirements: async (a) => {},
  addBidderRequirement: async (a, b) => {},
});

const bidderRequirementReducer = (
  state: BidderRequirementState,
  action: BidderRequirementAction
) => {
  switch (action.type) {
    case BidderRequirementActions.FETCH_REQUIREMENTS:
    case BidderRequirementActions.ADD_REQUIREMENT:
      return { ...state, isLoading: true };

    case BidderRequirementActions.FETCH_REQUIREMENTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        requirements: action.payload.data,
      };
    case BidderRequirementActions.ADD_REQUIREMENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        requirements: [...state.requirements, action.payload.data],
        error: null,
      };

    case BidderRequirementActions.FETCH_REQUIREMENTS_FAILED:
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

  const getBidderRequirements = async (bidderId: number) => {
    dispatch({ type: BidderRequirementActions.FETCH_REQUIREMENTS });
    try {
      const response = await axios.get(`/bidders/${bidderId}/requirements`);
      dispatch({
        type: BidderRequirementActions.FETCH_REQUIREMENTS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: BidderRequirementActions.FETCH_REQUIREMENTS_FAILED,
        payload: error,
      });
    }
  };

  const addBidderRequirement = async (bidderId: number, formData: FormData) => {
    dispatch({ type: BidderRequirementActions.ADD_REQUIREMENT });
    try {
      const response = await axios.post(`/bidders/${bidderId}/requirements`, {
        name: formData.get("name"),
        url: "https://www.google.com", //formData.get("url"),
        validity_date: moment(formData.get("validity_date")?.toString()).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      });
      dispatch({
        type: BidderRequirementActions.ADD_REQUIREMENT_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      console.log(error.response.data);
      dispatch({
        type: BidderRequirementActions.ADD_REQUIREMENT_FAILED,
        payload: error.response.data,
      });
    }
  };

  return (
    <BidderRequirementContext.Provider
      value={{
        ...state,
        getBidderRequirements,
        addBidderRequirement,
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
      "useBidderRequirement must be used within a SupplierProvider"
    );
  }
  return context;
};
