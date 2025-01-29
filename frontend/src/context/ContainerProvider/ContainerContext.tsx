import { createContext, useContext, useReducer } from "react";
import axios from "axios";
import { Container, ContainersBySupplier } from "../../types";
import * as ContainerActions from "./actions";
import moment from "moment";

interface ContainerState {
  container: any;
  containers: Container[];
  containersBySupplier: ContainersBySupplier | null;
  isLoading: boolean;
  error: any;
}

interface ContainerContextType extends ContainerState {
  fetchContainer: (supplierId: string, containerId: string) => Promise<void>;
  getContainers: () => Promise<void>;
  fetchContainersBySupplier: (id: string) => Promise<void>;
  createContainer: (supplierId: string | undefined, body: {}) => Promise<void>;
  updateContainer: (supplierId: string, containerId: string, body: any) => void;
}

export type ContainerAction =
  | { type: "FETCH_CONTAINERS" }
  | { type: "FETCH_CONTAINER" }
  | { type: "FETCH_CONTAINERS_BY_SUPPLIER" }
  | { type: "CREATE_CONTAINER" }
  | { type: "UPDATE_CONTAINER" }
  | {
      type: "FETCH_CONTAINERS_SUCCESS";
      payload: { data: Container[] };
    }
  | {
      type: "FETCH_CONTAINER_SUCCESS";
      payload: { data: Container[] };
    }
  | {
      type: "FETCH_CONTAINERS_BY_SUPPLIER_SUCCESS";
      payload: { data: ContainersBySupplier };
    }
  | { type: "CREATE_CONTAINER_SUCCESS"; payload: { data: Container } }
  | { type: "UPDATE_CONTAINER_SUCCESS"; payload: Container }
  | { type: "FETCH_CONTAINER_FAILED"; payload: Error | null }
  | { type: "FETCH_CONTAINERS_FAILED"; payload: Error | null }
  | { type: "FETCH_CONTAINERS_BY_SUPPLIER_FAILED"; payload: Error | null }
  | { type: "CREATE_CONTAINER_FAILED"; payload: Error | null }
  | { type: "UPDATE_CONTAINER_FAILED"; payload: Error | null };

const initialState = {
  container: null,
  containers: [],
  containersBySupplier: null,
  isLoading: false,
  error: null,
};

const ContainerContext = createContext<ContainerContextType>({
  ...initialState,
  fetchContainer: async () => {},
  getContainers: async () => {},
  fetchContainersBySupplier: async () => {},
  createContainer: async () => {},
  updateContainer: () => {},
});

const containerReducer = (state: ContainerState, action: ContainerAction) => {
  switch (action.type) {
    case ContainerActions.FETCH_CONTAINER:
    case ContainerActions.FETCH_CONTAINERS:
    case ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER:
    case ContainerActions.CREATE_CONTAINER:
    case ContainerActions.UPDATE_CONTAINER:
      return { ...state, isLoading: true };

    case ContainerActions.FETCH_CONTAINERS_SUCCESS:
      return { ...state, isLoading: false, containers: action.payload.data };

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
    case ContainerActions.UPDATE_CONTAINER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        container: action.payload,
        error: null,
      };
    case ContainerActions.FETCH_CONTAINERS_FAILED:
    case ContainerActions.FETCH_CONTAINER_FAILED:
    case ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER_FAILED:
    case ContainerActions.CREATE_CONTAINER_FAILED:
    case ContainerActions.UPDATE_CONTAINER_FAILED:
      return { ...state, isLoading: false, error: action.payload };
  }
};

export const ContainerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(containerReducer, initialState);

  const fetchContainer = async (supplierId: string, containerId: string) => {
    dispatch({ type: ContainerActions.FETCH_CONTAINER });
    try {
      const response = await axios.get(
        `/suppliers/${supplierId}/containers/${containerId}`
      );
      dispatch({
        type: ContainerActions.FETCH_CONTAINER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: ContainerActions.FETCH_CONTAINER_FAILED,
        payload: error,
      });
    }
  };

  const getContainers = async () => {
    dispatch({ type: ContainerActions.FETCH_CONTAINERS });
    try {
      const response = await axios.get("/containers/all");
      dispatch({
        type: ContainerActions.FETCH_CONTAINERS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: ContainerActions.FETCH_CONTAINERS_FAILED,
        payload: error,
      });
    }
  };

  const fetchContainersBySupplier = async (supplierId: string) => {
    dispatch({ type: ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER });
    try {
      const response = await axios.get(`/suppliers/${supplierId}/containers`);
      dispatch({
        type: ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER_FAILED,
        payload: error,
      });
    }
  };

  const createContainer = async (
    supplierId: string | null | undefined,
    body: any
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
    } catch (error: any) {
      dispatch({
        type: ContainerActions.CREATE_CONTAINER_FAILED,
        payload: error.response.data,
      });
    }
  };

  const updateContainer = async (
    supplierId: string,
    containerId: string,
    body: any
  ) => {
    dispatch({ type: ContainerActions.UPDATE_CONTAINER });
    try {
      const response = await axios.put(
        `/suppliers/${supplierId}/containers/${containerId}`,
        {
          ...body,
          telegraphic_transferred: moment(body.telegraphic_transferred).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          arrival_date_warehouse_ph: moment(
            body.arrival_date_warehouse_ph
          ).format("YYYY-MM-DD HH:mm:ss"),
          departure_date_from_japan: moment(
            body.departure_date_from_japan
          ).format("YYYY-MM-DD HH:mm:ss"),
          eta_to_ph: moment(body.eta_to_ph).format("YYYY-MM-DD HH:mm:ss"),
          sorting_date: moment(body.sorting_date).format("YYYY-MM-DD HH:mm:ss"),
          auction_date: moment(body.auction_date).format("YYYY-MM-DD HH:mm:ss"),
          payment_date: moment(body.payment_date).format("YYYY-MM-DD HH:mm:ss"),
          vanning_date: moment(body.vanning_date).format("YYYY-MM-DD HH:mm:ss"),
          devanning_date: moment(body.devanning_date).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
        }
      );
      dispatch({
        type: ContainerActions.UPDATE_CONTAINER_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      console.log({ error });
      dispatch({
        type: ContainerActions.UPDATE_CONTAINER_FAILED,
        payload: error,
      });
    }
  };

  return (
    <ContainerContext.Provider
      value={{
        ...state,
        fetchContainer,
        getContainers,
        fetchContainersBySupplier,
        createContainer,
        updateContainer,
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
