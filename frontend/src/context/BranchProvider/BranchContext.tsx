import { createContext, useCallback, useContext, useReducer } from "react";
import axios, { isAxiosError } from "axios";
import { BaseBranch, Branch, BranchPayload, APIError } from "@types";
import * as BranchActions from "./actions";

interface BranchState {
  branch: Branch | null;
  branches: BaseBranch[];
  isLoading: boolean;
  error?: APIError;
}

interface BranchStateContextType extends BranchState {
  fetchBranch: (id: number | string) => Promise<void>;
  fetchBranches: () => Promise<void>;
  createBranch: (body: BranchPayload) => Promise<void>;
  updateBranch: (id: number | string, body: BranchPayload) => Promise<void>;
  resetBranchResponse: () => void;
}

export type BranchAction =
  | { type: "RESET_CREATE_BRANCH_RESPONSE" }
  | { type: "FETCH_BRANCHES" }
  | { type: "FETCH_BRANCHES_SUCCESS"; payload: { data: BaseBranch[] } }
  | { type: "FETCH_BRANCHES_FAILED"; payload: APIError }
  | { type: "UPDATE_BRANCH" }
  | { type: "UPDATE_BRANCH_SUCCESS"; payload: { data: Branch } }
  | { type: "UPDATE_BRANCH_FAILED"; payload: APIError }
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
  updateBranch: async () => {},
  resetBranchResponse: () => {},
});

const branchReducer = (
  state: BranchState,
  action: BranchAction
): BranchState => {
  switch (action.type) {
    case BranchActions.FETCH_BRANCH:
    case BranchActions.FETCH_BRANCHES:
    case BranchActions.CREATE_BRANCH:
    case BranchActions.UPDATE_BRANCH:
      return { ...state, isLoading: true };

    case BranchActions.FETCH_BRANCH_SUCCESS:
      return { ...state, isLoading: false, branch: action.payload.data };
    case BranchActions.FETCH_BRANCHES_SUCCESS:
      return { ...state, isLoading: false, branches: action.payload.data };
    case BranchActions.UPDATE_BRANCH_SUCCESS:
    case BranchActions.CREATE_BRANCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        branch: action.payload.data,
        error: undefined,
      };

    case BranchActions.UPDATE_BRANCH_FAILED:
    case BranchActions.CREATE_BRANCH_FAILED:
    case BranchActions.FETCH_BRANCH_FAILED:
    case BranchActions.FETCH_BRANCHES_FAILED:
      return { ...state, isLoading: false, error: action.payload };

    case BranchActions.RESET_CREATE_BRANCH_RESPONSE:
      return { ...state, isLoading: false, branch: null };
  }
};

export const BranchProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(branchReducer, initialState);

  const fetchBranch = useCallback(async (branchId: number | string) => {
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
  }, []);

  const fetchBranches = useCallback(async () => {
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
  }, []);

  const createBranch = async (branch: BranchPayload) => {
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

  const updateBranch = async (
    branchId: number | string,
    branch: BranchPayload
  ) => {
    dispatch({ type: BranchActions.UPDATE_BRANCH });
    try {
      const response = await axios.put(`/branches/${branchId}`, branch);
      setTimeout(() => {
        dispatch({
          type: BranchActions.UPDATE_BRANCH_SUCCESS,
          payload: response.data,
        });
      }, 2000);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: BranchActions.UPDATE_BRANCH_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const resetBranchResponse = useCallback(
    () => dispatch({ type: BranchActions.RESET_CREATE_BRANCH_RESPONSE }),
    []
  );

  return (
    <BranchContext.Provider
      value={{
        ...state,
        fetchBranch,
        fetchBranches,
        createBranch,
        updateBranch,
        resetBranchResponse,
      }}
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
