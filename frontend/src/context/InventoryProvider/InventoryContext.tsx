import { createContext, useContext, useReducer } from "react";
import axios from "axios";
import { Inventory } from "../../types";
import * as InventoryActions from "./actions";

interface InventoryState {
  inventory: any;
  inventoriesByContainer: Inventory[];
  isLoading: boolean;
  error: null | undefined;
}

interface InventoryContextType extends InventoryState {
  getInventoriesByContainer: (
    supplierId: string,
    containerId: string
  ) => Promise<void>;
  addInventoryToContainer: (
    supplierId: string,
    containerId: string,
    formData: FormData
  ) => Promise<void>;
}

export type InventoryAction =
  | { type: "FETCH_INVENTORY_BY_CONTAINER" }
  | { type: "ADD_INVENTORY_TO_CONTAINER" }
  | { type: "FETCH_INVENTORY_BY_CONTAINER_SUCCESS"; payload: Inventory[] }
  | { type: "ADD_INVENTORY_TO_CONTAINER_SUCCESS"; payload: Inventory }
  | { type: "FETCH_INVENTORY_BY_CONTAINER_FAILED"; payload: null }
  | { type: "ADD_INVENTORY_TO_CONTAINER_FAILED"; payload: null };

const initialState = {
  inventory: null,
  inventoriesByContainer: [],
  isLoading: false,
  error: null,
};

const InventoryContext = createContext<InventoryContextType>({
  ...initialState,
  getInventoriesByContainer: async () => {},
  addInventoryToContainer: async () => {},
});

const inventoryReducer = (state: InventoryState, action: InventoryAction) => {
  switch (action.type) {
    case InventoryActions.FETCH_INVENTORY_BY_CONTAINER:
    case InventoryActions.ADD_INVENTORY_TO_CONTAINER:
      return { ...state, isLoading: true };

    case InventoryActions.FETCH_INVENTORY_BY_CONTAINER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        inventoriesByContainer: action.payload,
      };
    case InventoryActions.ADD_INVENTORY_TO_CONTAINER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        inventoriesByContainer: [
          ...state.inventoriesByContainer,
          action.payload,
        ],
        error: null,
      };
    case InventoryActions.FETCH_INVENTORY_BY_CONTAINER_FAILED:
    case InventoryActions.ADD_INVENTORY_TO_CONTAINER_FAILED:
      return { ...state, isLoading: false, error: action.payload };
  }
};

export const InventoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  const getInventoriesByContainer = async (
    supplierId: string,
    containerId: string
  ) => {
    dispatch({ type: InventoryActions.FETCH_INVENTORY_BY_CONTAINER });
    try {
      const response = await axios.get(
        `/suppliers/${supplierId}/containers/${containerId}/inventories`
      );
      dispatch({
        type: InventoryActions.FETCH_INVENTORY_BY_CONTAINER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: InventoryActions.FETCH_INVENTORY_BY_CONTAINER_FAILED,
        payload: error,
      });
    }
  };

  const addInventoryToContainer = async (
    supplierId: string | null | undefined,
    containerId: string | null | undefined,
    formData: FormData
  ) => {
    dispatch({ type: InventoryActions.ADD_INVENTORY_TO_CONTAINER });
    try {
      const response = await axios.post(
        `/suppliers/${supplierId}/containers/${containerId}/inventories`,
        {
          container_id: containerId,
          barcode_number: formData.get("barcode_number"),
          description: formData.get("description"),
          control_number: formData.get("control_number"),
          url: formData.get("url"),
          status: "UNSOLD",
        }
      );
      dispatch({
        type: InventoryActions.ADD_INVENTORY_TO_CONTAINER_SUCCESS,
        payload: response.data.data,
      });
    } catch (error: any) {
      dispatch({
        type: InventoryActions.ADD_INVENTORY_TO_CONTAINER_FAILED,
        payload: error,
      });
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        ...state,
        getInventoriesByContainer,
        addInventoryToContainer,
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
