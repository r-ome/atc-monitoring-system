import { createContext, useContext, useCallback, useReducer } from "react";
import axios, { isAxiosError } from "axios";
import {
  Inventory,
  AddInventoryResponse,
  APIError,
  CreateInventoryPayload,
} from "@types";
import * as InventoryActions from "./actions";

interface InventoryState {
  inventory: AddInventoryResponse | null;
  inventoriesByContainer: Inventory[];
  isLoading: boolean;
  error: APIError | null;
}

interface InventoryContextType extends InventoryState {
  fetchInventoriesByContainer: (
    supplierId: number | string,
    containerId: number | string
  ) => Promise<void>;
  createInventory: (
    supplierId: number | string,
    containerId: number | string,
    body: CreateInventoryPayload
  ) => Promise<void>;
  resetInventory: () => void;
}

export type InventoryAction =
  | { type: "RESET_INVENTORY" }
  | { type: "ADD_INVENTORY_TO_CONTAINER" }
  | {
      type: "ADD_INVENTORY_TO_CONTAINER_SUCCESS";
      payload: { data: AddInventoryResponse };
    }
  | { type: "ADD_INVENTORY_TO_CONTAINER_FAILED"; payload: APIError }
  | { type: "FETCH_INVENTORIES_BY_CONTAINER" }
  | {
      type: "FETCH_INVENTORIES_BY_CONTAINER_SUCCESS";
      payload: { data: Inventory[] };
    }
  | { type: "FETCH_INVENTORIES_BY_CONTAINER_FAILED"; payload: APIError };

const initialState = {
  inventory: null,
  inventoriesByContainer: [],
  isLoading: false,
  error: null,
};

const InventoryContext = createContext<InventoryContextType>({
  ...initialState,
  fetchInventoriesByContainer: async () => {},
  createInventory: async () => {},
  resetInventory: () => {},
});

const inventoryReducer = (state: InventoryState, action: InventoryAction) => {
  switch (action.type) {
    case InventoryActions.FETCH_INVENTORIES_BY_CONTAINER:
    case InventoryActions.ADD_INVENTORY_TO_CONTAINER:
      return { ...state, isLoading: true };

    case InventoryActions.FETCH_INVENTORIES_BY_CONTAINER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        inventoriesByContainer: action.payload.data,
      };
    case InventoryActions.ADD_INVENTORY_TO_CONTAINER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        inventory: action.payload.data,
        error: null,
      };
    case InventoryActions.FETCH_INVENTORIES_BY_CONTAINER_FAILED:
    case InventoryActions.ADD_INVENTORY_TO_CONTAINER_FAILED:
      return { ...state, isLoading: false, error: action.payload };
    case InventoryActions.RESET_INVENTORY:
      return { ...state, isLoading: false, inventory: null, error: null };
  }
};

export const InventoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  const fetchInventoriesByContainer = useCallback(
    async (supplierId: number | string, containerId: number | string) => {
      dispatch({ type: InventoryActions.FETCH_INVENTORIES_BY_CONTAINER });
      try {
        const response = await axios.get(
          `/suppliers/${supplierId}/containers/${containerId}/inventories`
        );
        dispatch({
          type: InventoryActions.FETCH_INVENTORIES_BY_CONTAINER_SUCCESS,
          payload: response.data,
        });
      } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
          dispatch({
            type: InventoryActions.FETCH_INVENTORIES_BY_CONTAINER_FAILED,
            payload: error.response?.data,
          });
        }
      }
    },
    []
  );

  const createInventory = async (
    supplierId: number | string,
    containerId: number | string,
    body: CreateInventoryPayload
  ) => {
    dispatch({ type: InventoryActions.ADD_INVENTORY_TO_CONTAINER });
    try {
      const response = await axios.post(
        `/suppliers/${supplierId}/containers/${containerId}/inventories`,
        {
          barcode: body.barcode,
          description: body.description.toUpperCase(),
          control_number: body.control_number,
          url: body.url,
        }
      );
      dispatch({
        type: InventoryActions.ADD_INVENTORY_TO_CONTAINER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: InventoryActions.ADD_INVENTORY_TO_CONTAINER_FAILED,
          payload: error.response?.data,
        });
      }
    }
  };

  const resetInventory = useCallback(
    () => dispatch({ type: InventoryActions.RESET_INVENTORY }),
    []
  );

  return (
    <InventoryContext.Provider
      value={{
        ...state,
        fetchInventoriesByContainer,
        createInventory,
        resetInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventories = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventories must be used within a SupplierProvider");
  }
  return context;
};
