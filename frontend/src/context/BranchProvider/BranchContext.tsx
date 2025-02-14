import { createContext, useContext, useReducer } from "react";
import axios, { isAxiosError } from "axios";
import { BaseBranch, Branch, CreateBranchPayload, APIError } from "@types";
import * as BranchActions from "./actions";

interface BranchState {
  branch: Branch | null;
  branches: BaseBranch[];
  isLoading: boolean;
  error?: APIError;
}

interface BranchStateContextType extends BranchState {
  fetchBranch: (id: number) => Promise<void>;
  fetchBranches: () => Promise<void>;
  createBranch: (body: CreateBranchPayload) => Promise<void>;
}

export type BranchAction =
  | { type: "FETCH_BRANCHES" }
  | { type: "FETCH_BRANCHES_SUCCESS"; payload: { data: BaseBranch[] } }
  | { type: "FETCH_BRANCHES_FAILED"; payload: APIError }
  | { type: "CREATE_BRANCH" }
  | { type: "CREATE_BRANCH_SUCCESS"; payload: { data: Branch } }
  | { type: "CREATE_BRANCH_FAILED"; payload: APIError }
  | { type: "FETCH_BRANCH" }
  | { type: "FETCH_BRANCH_SUCCESS"; payload: { data: Branch } }
  | { type: "FETCH_BRANCH_FAILED"; payload: APIError };

const initialState = {
  branch: null,
  branches: [],
  isLoading: false,
  error: undefined,
};

const BranchContext = createContext<BranchStateContextType>({
  ...initialState,
  fetchBranch: async () => {},
  fetchBranches: async () => {},
  createBranch: async () => {},
});

const branchReducer = (
  state: BranchState,
  action: BranchAction
): BranchState => {
  switch (action.type) {
    case BranchActions.FETCH_BRANCH:
    case BranchActions.FETCH_BRANCHES:
    case BranchActions.CREATE_BRANCH:
      return { ...state, isLoading: true };

    case BranchActions.FETCH_BRANCH_SUCCESS:
      return { ...state, isLoading: false, branch: action.payload.data };
    case BranchActions.FETCH_BRANCHES_SUCCESS:
      return { ...state, isLoading: false, branches: action.payload.data };
    case BranchActions.CREATE_BRANCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        branch: action.payload.data,
        error: undefined,
      };

    case BranchActions.CREATE_BRANCH_FAILED:
    case BranchActions.FETCH_BRANCH_FAILED:
    case BranchActions.FETCH_BRANCHES_FAILED:
      return { ...state, isLoading: false, error: action.payload };
  }
};

export const BranchProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(branchReducer, initialState);

  const fetchBranch = async (branchId: number) => {
    dispatch({ type: BranchActions.FETCH_BRANCH });
    try {
      const response = await axios.get(`/branches/${branchId}`);
      dispatch({
        type: BranchActions.FETCH_BRANCH_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: BranchActions.FETCH_BRANCH_FAILED,
          payload: error.response?.data,
        });
      }
    }
  };

  const fetchBranches = async () => {
    dispatch({ type: BranchActions.FETCH_BRANCHES });
    try {
      const response = await axios.get("/branches");
      dispatch({
        type: BranchActions.FETCH_BRANCHES_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: BranchActions.FETCH_BRANCHES_FAILED,
          payload: error.response?.data,
        });
      }
    }
  };

  const createBranch = async (branch: CreateBranchPayload) => {
    dispatch({ type: BranchActions.CREATE_BRANCH });
    try {
      const response = await axios.post("/branches", { name: branch.name });
      dispatch({
        type: BranchActions.CREATE_BRANCH_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: BranchActions.CREATE_BRANCH_FAILED,
          payload: error.response?.data,
        });
      }
    }
  };

  return (
    <BranchContext.Provider
      value={{ ...state, fetchBranch, fetchBranches, createBranch }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranches = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranches must be used within a BranchProvider");
  }
  return context;
};
