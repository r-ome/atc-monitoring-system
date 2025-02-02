import React, { createContext, useContext, useReducer, useMemo } from "react";
import { Supplier } from "../../types";
import * as SupplierActions from "./actions";
import axios from "axios";

interface SuppliersState {
  supplier: Supplier | null;
  suppliers: Supplier[];
  isLoading: boolean;
  errors: any;
}

interface SupplierContextType extends SuppliersState {
  fetchSupplier: (id: string) => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (a: any) => Promise<void>;
  updateSupplier: (id: string, body: {}) => Promise<void>;
}

const initialState: SuppliersState = {
  supplier: null,
  suppliers: [],
  isLoading: false,
  errors: null,
};

const SupplierContext = createContext<SupplierContextType>({
  ...initialState,
  fetchSupplier: async () => {},
  fetchSuppliers: async () => {},
  createSupplier: async () => {},
  updateSupplier: async () => {},
});

export type SuppliersAction =
  | { type: "FETCH_SUPPLIER" }
  | { type: "FETCH_SUPPLIERS" }
  | { type: "CREATE_SUPPLIER" }
  | { type: "UPDATE_SUPPLIER" }
  | { type: "FETCH_SUPPLIER_SUCCESS"; payload: { data: Supplier } }
  | { type: "FETCH_SUPPLIERS_SUCCESS"; payload: { data: Supplier[] } }
  | { type: "FETCH_SUPPLIERS_FAILED"; payload: { errors: Error | null } }
  | { type: "FETCH_SUPPLIER_FAILED"; payload: Error | null }
  | { type: "CREATE_SUPPLIER_SUCCESS"; payload: { data: Supplier } }
  | { type: "CREATE_SUPPLIER_FAILED"; payload: Error | null }
  | { type: "UPDATE_SUPPLIER_SUCCESS"; payload: { data: Supplier } }
  | { type: "UPDATE_SUPPLIER_FAILED"; payload: Error | null };

const suppliersReducer = (state: SuppliersState, action: SuppliersAction) => {
  switch (action.type) {
    case SupplierActions.CREATE_SUPPLIER:
    case SupplierActions.FETCH_SUPPLIER:
    case SupplierActions.UPDATE_SUPPLIER:
    case SupplierActions.FETCH_SUPPLIERS: {
      return { ...state, isLoading: true };
    }
    case SupplierActions.FETCH_SUPPLIERS_FAILED:
    case SupplierActions.FETCH_SUPPLIER_FAILED:
    case SupplierActions.UPDATE_SUPPLIER_FAILED:
    case SupplierActions.CREATE_SUPPLIER_FAILED: {
      return { ...state, isLoading: false, errors: action.payload };
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
    case SupplierActions.UPDATE_SUPPLIER_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        supplier: action.payload.data,
        error: null,
      };
    }
    case SupplierActions.FETCH_SUPPLIERS_SUCCESS: {
      return { ...state, isLoading: false, suppliers: action.payload.data };
    }
    case SupplierActions.FETCH_SUPPLIER_SUCCESS: {
      return { ...state, isLoading: false, supplier: action.payload.data };
    }
  }
};

export const SupplierProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(suppliersReducer, initialState);

  const fetchSupplier = async (supplierId: string) => {
    dispatch({ type: SupplierActions.FETCH_SUPPLIER });
    try {
      const response = await axios.get(`/suppliers/${supplierId}`);
      dispatch({
        type: SupplierActions.FETCH_SUPPLIER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: SupplierActions.FETCH_SUPPLIER_FAILED,
        payload: error,
      });
    }
  };

  const fetchSuppliers = async () => {
    dispatch({ type: SupplierActions.FETCH_SUPPLIERS });
    try {
      const response = await axios.get("/suppliers");
      dispatch({
        type: SupplierActions.FETCH_SUPPLIERS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: SupplierActions.FETCH_SUPPLIERS_FAILED,
        payload: error.response.data,
      });
    }
  };

  const createSupplier = async (body: any) => {
    dispatch({ type: SupplierActions.CREATE_SUPPLIER });
    try {
      const response = await axios.post("/suppliers", body);
      dispatch({
        type: SupplierActions.CREATE_SUPPLIER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: SupplierActions.CREATE_SUPPLIER_FAILED,
        payload: error.response.data,
      });
    }
  };

  const memoizedSuppliers = useMemo(() => state.suppliers, [state.suppliers]);

  const updateSupplier = async (supplierId: string, body: any) => {
    dispatch({ type: SupplierActions.UPDATE_SUPPLIER });
    try {
      const response = await axios.put(`/suppliers/${supplierId}`, {
        name: body.name,
        supplier_code: body.supplier_code,
        japanese_name: body.japanese_name,
        num_of_containers: body.num_of_containers,
        shipper: body.shipper,
      });
      dispatch({
        type: SupplierActions.UPDATE_SUPPLIER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: SupplierActions.UPDATE_SUPPLIER_FAILED,
        payload: error.response.data,
      });
    }
  };

  return (
    <SupplierContext.Provider
      value={{
        ...state,
        suppliers: memoizedSuppliers,
        fetchSupplier,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
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
