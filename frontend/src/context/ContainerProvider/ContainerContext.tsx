import { createContext, useContext, useReducer, useCallback } from "react";
import axios, { isAxiosError } from "axios";
import {
  APIError,
  BaseContainer,
  Container,
  CreateContainerPayload,
} from "@types";
import * as ContainerActions from "./actions";

interface ContainerState {
  container: Container | null;
  containersBySupplier: BaseContainer[];
  isLoading: boolean;
  error: APIError | null;
}

interface ContainerContextType extends ContainerState {
  fetchContainer: (supplierId: number, containerId: number) => Promise<void>;
  fetchContainersBySupplier: (supplierId: string) => Promise<void>;
  createContainer: (
    supplierId: number,
    body: CreateContainerPayload
  ) => Promise<void>;
}

export type ContainerAction =
  | { type: "FETCH_CONTAINER" }
  | { type: "FETCH_CONTAINER_SUCCESS"; payload: { data: Container } }
  | { type: "FETCH_CONTAINER_FAILED"; payload: APIError }
  | { type: "FETCH_CONTAINERS_BY_SUPPLIER" }
  | {
      type: "FETCH_CONTAINERS_BY_SUPPLIER_SUCCESS";
      payload: { data: BaseContainer[] };
    }
  | { type: "FETCH_CONTAINERS_BY_SUPPLIER_FAILED"; payload: APIError }
  | { type: "CREATE_CONTAINER" }
  | { type: "CREATE_CONTAINER_SUCCESS"; payload: { data: Container } }
  | { type: "CREATE_CONTAINER_FAILED"; payload: APIError };

const initialState = {
  container: null,
  containersBySupplier: [],
  isLoading: false,
  error: null,
};

const ContainerContext = createContext<ContainerContextType>({
  ...initialState,
  fetchContainer: async () => {},
  fetchContainersBySupplier: async () => {},
  createContainer: async () => {},
});

const containerReducer = (state: ContainerState, action: ContainerAction) => {
  switch (action.type) {
    case ContainerActions.FETCH_CONTAINER:
    case ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER:
    case ContainerActions.CREATE_CONTAINER:
      return { ...state, isLoading: true };

    case ContainerActions.FETCH_CONTAINER_SUCCESS:
      return { ...state, isLoading: false, container: action.payload.data };
    case ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        containersBySupplier: action.payload.data,
      };
    case ContainerActions.CREATE_CONTAINER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        container: action.payload.data,
        error: null,
      };
    case ContainerActions.FETCH_CONTAINER_FAILED:
    case ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER_FAILED:
    case ContainerActions.CREATE_CONTAINER_FAILED:
      return { ...state, isLoading: false, error: action.payload };
  }
};

export const ContainerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(containerReducer, initialState);

  const fetchContainer = async (supplierId: number, containerId: number) => {
    dispatch({ type: ContainerActions.FETCH_CONTAINER });
    try {
      const response = await axios.get(
        `/suppliers/${supplierId}/containers/${containerId}`
      );
      dispatch({
        type: ContainerActions.FETCH_CONTAINER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: ContainerActions.FETCH_CONTAINER_FAILED,
          payload: error.response?.data,
        });
      }
    }
  };

  const fetchContainersBySupplier = useCallback(async (supplierId: string) => {
    dispatch({ type: ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER });
    try {
      const response = await axios.get(`/suppliers/${supplierId}/containers`);
      dispatch({
        type: ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER_FAILED,
          payload: error.response?.data,
        });
      }
    }
  }, []);

  const createContainer = async (
    supplierId: number,
    body: CreateContainerPayload
  ) => {
    dispatch({ type: ContainerActions.CREATE_CONTAINER });
    try {
      const response = await axios.post(
        `/suppliers/${supplierId}/containers`,
        body
      );

      dispatch({
        type: ContainerActions.CREATE_CONTAINER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: ContainerActions.CREATE_CONTAINER_FAILED,
          payload: error.response?.data,
        });
      }
    }
  };

  return (
    <ContainerContext.Provider
      value={{
        ...state,
        fetchContainer,
        fetchContainersBySupplier,
        createContainer,
      }}
    >
      {children}
    </ContainerContext.Provider>
  );
};

export const useContainers = () => {
  const context = useContext(ContainerContext);
  if (!context) {
    throw new Error("useContainer must be used within a SupplierProvider");
  }
  return context;
};
