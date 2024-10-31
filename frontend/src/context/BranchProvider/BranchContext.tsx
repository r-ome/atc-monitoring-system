import { createContext, useContext, useReducer } from "react";
import { Branch } from "../../types";
import axios from "axios";
import * as BranchActions from "./actions";

interface BranchState {
  branches: Branch[];
  isLoading: boolean;
  error: Error | null;
}

interface BranchStateContextType extends BranchState {
  getBranches: () => Promise<void>;
}

export type BranchAction =
  | { type: "FETCH_BRANCHES" }
  | { type: "FETCH_BRANCHES_SUCCESS"; payload: Branch[] }
  | { type: "FETCH_BRANCHES_FAILED"; payload: Error | null };

const initialState = {
  branches: [],
  isLoading: false,
  error: null,
};

const BranchContext = createContext<BranchStateContextType>({
  ...initialState,
  getBranches: async () => {},
});

const branchReducer = (
  state: BranchState,
  action: BranchAction
): BranchState => {
  switch (action.type) {
    case BranchActions.FETCH_BRANCHES:
      return { ...state, isLoading: true };
    case BranchActions.FETCH_BRANCHES_SUCCESS:
      return { ...state, isLoading: false, branches: action.payload };
    case BranchActions.FETCH_BRANCHES_FAILED:
      return { ...state, isLoading: false, error: action.payload };
  }
};

export const BranchProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(branchReducer, initialState);

  const getBranches = async () => {
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

  return (
    <BranchContext.Provider value={{ ...state, getBranches }}>
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
