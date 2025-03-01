import { createContext, useContext, useCallback, useReducer } from "react";
import axios, { isAxiosError } from "axios";
import {
  Inventory,
  InventoryProfile,
  AddInventoryResponse,
  APIError,
  CreateInventoryPayload,
} from "@types";
import * as InventoryActions from "./actions";

interface InventoryState {
  inventory: AddInventoryResponse | null;
  inventoryProfile: InventoryProfile | null;
  inventoriesByContainer: Inventory[];
  isLoading: boolean;
  error: APIError | null;
}

interface InventoryContextType extends InventoryState {
  fetchInventoriesByContainer: (containerId: number | string) => Promise<void>;
  fetchInventory: (inventoryId: number | string) => Promise<void>;
  createInventory: (
    containerId: number | string,
    body: CreateInventoryPayload
  ) => Promise<void>;
  resetInventory: () => void;
}

export type InventoryAction =
  | { type: "RESET_INVENTORY" }
  | { type: "FETCH_INVENTORY" }
  | { type: "FETCH_INVENTORY_SUCCESS"; payload: { data: InventoryProfile } }
  | { type: "FETCH_INVENTORY_FAILED"; payload: APIError }
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
  inventoryProfile: null,
  isLoading: false,
  error: null,
};

const InventoryContext = createContext<InventoryContextType>({
  ...initialState,
  fetchInventoriesByContainer: async () => {},
  createInventory: async () => {},
  fetchInventory: async () => {},
  resetInventory: () => {},
});

const inventoryReducer = (state: InventoryState, action: InventoryAction) => {
  switch (action.type) {
    case InventoryActions.FETCH_INVENTORY:
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
    case InventoryActions.FETCH_INVENTORY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        inventoryProfile: action.payload.data,
        error: null,
      };

    case InventoryActions.FETCH_INVENTORY_FAILED:
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
    async (containerId: number | string) => {
      dispatch({ type: InventoryActions.FETCH_INVENTORIES_BY_CONTAINER });
      try {
        const response = await axios.get(
          `/containers/${containerId}/inventories`
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
    containerId: number | string,
    body: CreateInventoryPayload
  ) => {
    dispatch({ type: InventoryActions.ADD_INVENTORY_TO_CONTAINER });
    try {
      const response = await axios.post(
        `/containers/${containerId}/inventories`,
        {
          barcode: body.barcode,
          description: body.description.toUpperCase(),
          control: body.control,
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

  const fetchInventory = useCallback(async (inventoryId: number | string) => {
    dispatch({ type: InventoryActions.FETCH_INVENTORY });
    try {
      const response = await axios.get(
        `/containers/inventories/${inventoryId}`
      );
      dispatch({
        type: InventoryActions.FETCH_INVENTORY_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: InventoryActions.FETCH_INVENTORY_FAILED,
          payload: error.response?.data,
        });
      }
    }
  }, []);

  const resetInventory = useCallback(
    () => dispatch({ type: InventoryActions.RESET_INVENTORY }),
    []
  );

  return (
    <InventoryContext.Provider
      value={{
        ...state,
        fetchInventory,
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
