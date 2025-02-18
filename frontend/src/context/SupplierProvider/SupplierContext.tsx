import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from "react";
import axios, { isAxiosError } from "axios";
import {
  APIError,
  BaseSupplier,
  CreateSupplierPayload,
  Supplier,
} from "@types";
import * as SupplierActions from "./actions";

interface SuppliersState {
  supplier: Supplier | null;
  suppliers: BaseSupplier[];
  isLoading: boolean;
  error: APIError | null;
}

interface SupplierContextType extends SuppliersState {
  fetchSupplier: (id: number | string) => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (body: CreateSupplierPayload) => Promise<void>;
  resetSupplier: () => void;
}

const initialState: SuppliersState = {
  supplier: null,
  suppliers: [],
  isLoading: false,
  error: null,
};

const SupplierContext = createContext<SupplierContextType>({
  ...initialState,
  fetchSupplier: async () => {},
  fetchSuppliers: async () => {},
  createSupplier: async () => {},
  resetSupplier: () => {},
});

export type SuppliersAction =
  | { type: "RESET_SUPPLIER" }
  | { type: "FETCH_SUPPLIER" }
  | { type: "FETCH_SUPPLIER_SUCCESS"; payload: { data: Supplier } }
  | { type: "FETCH_SUPPLIER_FAILED"; payload: APIError }
  | { type: "FETCH_SUPPLIERS" }
  | { type: "FETCH_SUPPLIERS_SUCCESS"; payload: { data: BaseSupplier[] } }
  | { type: "FETCH_SUPPLIERS_FAILED"; payload: APIError }
  | { type: "CREATE_SUPPLIER" }
  | { type: "CREATE_SUPPLIER_SUCCESS"; payload: { data: Supplier } }
  | { type: "CREATE_SUPPLIER_FAILED"; payload: APIError };

const suppliersReducer = (state: SuppliersState, action: SuppliersAction) => {
  switch (action.type) {
    case SupplierActions.CREATE_SUPPLIER:
    case SupplierActions.FETCH_SUPPLIER:
    case SupplierActions.FETCH_SUPPLIERS: {
      return { ...state, isLoading: true };
    }
    case SupplierActions.FETCH_SUPPLIERS_FAILED:
    case SupplierActions.FETCH_SUPPLIER_FAILED:
    case SupplierActions.CREATE_SUPPLIER_FAILED: {
      return { ...state, isLoading: false, error: action.payload };
    }
    case SupplierActions.CREATE_SUPPLIER_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        supplier: action.payload.data,
        suppliers: [...state.suppliers, action.payload.data],
        error: null,
      };
    }
    case SupplierActions.FETCH_SUPPLIERS_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        suppliers: action.payload.data,
        error: null,
      };
    }
    case SupplierActions.FETCH_SUPPLIER_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        supplier: action.payload.data,
        error: null,
      };
    }
    case SupplierActions.RESET_SUPPLIER:
      return { ...state, isLoading: false, supplier: null, error: null };
  }
};

export const SupplierProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(suppliersReducer, initialState);

  const fetchSupplier = useCallback(async (supplierId: number | string) => {
    dispatch({ type: SupplierActions.FETCH_SUPPLIER });
    try {
      const response = await axios.get(`/suppliers/${supplierId}`);
      setTimeout(() => {
        dispatch({
          type: SupplierActions.FETCH_SUPPLIER_SUCCESS,
          payload: response.data,
        });
      }, 1000);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: SupplierActions.FETCH_SUPPLIER_FAILED,
          payload: error?.response.data,
        });
      }
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    dispatch({ type: SupplierActions.FETCH_SUPPLIERS });
    try {
      const response = await axios.get("/suppliers");
      dispatch({
        type: SupplierActions.FETCH_SUPPLIERS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: SupplierActions.FETCH_SUPPLIERS_FAILED,
          payload: error.response?.data,
        });
      }
    }
  }, []);

  const createSupplier = async (body: CreateSupplierPayload) => {
    dispatch({ type: SupplierActions.CREATE_SUPPLIER });
    try {
      const response = await axios.post("/suppliers", body);
      dispatch({
        type: SupplierActions.CREATE_SUPPLIER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: SupplierActions.CREATE_SUPPLIER_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const resetSupplier = useCallback(
    () => dispatch({ type: SupplierActions.RESET_SUPPLIER }),
    []
  );

  const memoizedSuppliers = useMemo(() => state.suppliers, [state.suppliers]);

  return (
    <SupplierContext.Provider
      value={{
        ...state,
        suppliers: memoizedSuppliers,
        fetchSupplier,
        fetchSuppliers,
        createSupplier,
        resetSupplier,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error("useSupplier must be used within a SupplierProvider");
  }
  return context;
};
