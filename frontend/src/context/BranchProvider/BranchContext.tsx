import { createContext, useContext, useReducer } from "react";
import { Branch } from "../../types";
import axios from "axios";
import * as BranchActions from "./actions";

interface BranchState {
  branch: Branch | null;
  branches: Branch[];
  isLoading: boolean;
  error: any;
}

interface BranchStateContextType extends BranchState {
  fetchBranch: (id: string) => Promise<void>;
  fetchBranches: () => Promise<void>;
  createBranch: (body: any) => Promise<void>;
}

export type BranchAction =
  | { type: "FETCH_BRANCHES" }
  | { type: "FETCH_BRANCHES_SUCCESS"; payload: { data: Branch[] } }
  | { type: "FETCH_BRANCHES_FAILED"; payload: Error | null }
  | { type: "CREATE_BRANCH" }
  | { type: "CREATE_BRANCH_SUCCESS"; payload: { data: Branch } }
  | { type: "CREATE_BRANCH_FAILED"; payload: Error | null }
  | { type: "FETCH_BRANCH" }
  | { type: "FETCH_BRANCH_SUCCESS"; payload: { data: any } }
  | { type: "FETCH_BRANCH_FAILED"; payload: Error | null };

const initialState = {
  branch: null,
  branches: [],
  isLoading: false,
  error: null,
};

const BranchContext = createContext<BranchStateContextType>({
  ...initialState,
  fetchBranch: async (id) => {},
  fetchBranches: async () => {},
  createBranch: async ({ name }: { name: string }) => {},
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
        error: null,
      };

    case BranchActions.CREATE_BRANCH_FAILED:
    case BranchActions.FETCH_BRANCH_FAILED:
    case BranchActions.FETCH_BRANCHES_FAILED:
      return { ...state, isLoading: false, error: action.payload };
  }
};

export const BranchProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(branchReducer, initialState);

  const fetchBranch = async (branchId: string) => {
    dispatch({ type: BranchActions.FETCH_BRANCH });
    try {
      const response = await axios.get(`/branches/${branchId}`);
      dispatch({
        type: BranchActions.FETCH_BRANCH_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({ type: BranchActions.FETCH_BRANCH_FAILED, payload: error });
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
    } catch (error: any) {
      dispatch({ type: BranchActions.FETCH_BRANCHES_FAILED, payload: error });
    }
  };

  const createBranch = async (branch: any) => {
    dispatch({ type: BranchActions.CREATE_BRANCH });

    try {
      const response = await axios.post("/branches", { name: branch.name });
      dispatch({
        type: BranchActions.CREATE_BRANCH_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: BranchActions.CREATE_BRANCH_FAILED,
        payload: error.response.data,
      });
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
