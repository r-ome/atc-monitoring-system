import { createContext, useContext, useReducer } from "react";
import axios from "axios";
import { Inventory } from "../../types";
import * as InventoryActions from "./actions";

interface InventoryState {
  inventory: any;
  inventoriesByContainer: any; //Inventory[];
  isLoading: boolean;
  errors: any;
}

interface InventoryContextType extends InventoryState {
  fetchInventoriesByContainer: (
    supplierId: string,
    containerId: string
  ) => Promise<void>;
  createInventory: (
    supplierId: string,
    containerId: string,
    formData: any
  ) => Promise<void>;
}

export type InventoryAction =
  | { type: "FETCH_INVENTORIES_BY_CONTAINER" }
  | { type: "ADD_INVENTORY_TO_CONTAINER" }
  | {
      type: "FETCH_INVENTORIES_BY_CONTAINER_SUCCESS";
      payload: { data: any };
    }
  | { type: "ADD_INVENTORY_TO_CONTAINER_SUCCESS"; payload: { data: Inventory } }
  | { type: "FETCH_INVENTORIES_BY_CONTAINER_FAILED"; payload: null }
  | { type: "ADD_INVENTORY_TO_CONTAINER_FAILED"; payload: null };

const initialState = {
  inventory: null,
  inventoriesByContainer: {},
  isLoading: false,
  errors: null,
};

const InventoryContext = createContext<InventoryContextType>({
  ...initialState,
  fetchInventoriesByContainer: async () => {},
  createInventory: async () => {},
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
      const stateInventoriesByContainer = state.inventoriesByContainer;
      if (stateInventoriesByContainer) {
        stateInventoriesByContainer.inventories = [
          ...stateInventoriesByContainer.inventories,
          action.payload.data,
        ];
      } else {
        stateInventoriesByContainer.inventories = [action.payload.data];
      }
      return {
        ...state,
        isLoading: false,
        inventory: action.payload.data,
        inventoriesByContainer: stateInventoriesByContainer,
        error: null,
      };
    case InventoryActions.FETCH_INVENTORIES_BY_CONTAINER_FAILED:
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

  const fetchInventoriesByContainer = async (
    supplierId: string,
    containerId: string
  ) => {
    dispatch({ type: InventoryActions.FETCH_INVENTORIES_BY_CONTAINER });
    try {
      const response = await axios.get(
        `/suppliers/${supplierId}/containers/${containerId}/inventories`
      );
      dispatch({
        type: InventoryActions.FETCH_INVENTORIES_BY_CONTAINER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: InventoryActions.FETCH_INVENTORIES_BY_CONTAINER_FAILED,
        payload: error,
      });
    }
  };

  const createInventory = async (
    supplierId: string | null | undefined,
    containerId: string | null | undefined,
    body: any
  ) => {
    dispatch({ type: InventoryActions.ADD_INVENTORY_TO_CONTAINER });
    try {
      const response = await axios.post(
        `/suppliers/${supplierId}/containers/${containerId}/inventories`,
        {
          barcode: body.barcode,
          description: body.description,
          control_number: body.control_number,
          url: body.url,
        }
      );
      dispatch({
        type: InventoryActions.ADD_INVENTORY_TO_CONTAINER_SUCCESS,
        payload: response.data,
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
        fetchInventoriesByContainer,
        createInventory,
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
