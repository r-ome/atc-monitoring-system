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
  getContainers: () => void;
  fetchContainersBySupplier: (id: string) => Promise<void>;
  createContainer: (
    supplierId: string | null | undefined,
    formData: FormData
  ) => void;
  updateContainer: (supplierId: string, containerId: string, body: any) => void;
}

export type ContainerAction =
  | { type: "FETCH_CONTAINERS" }
  | { type: "FETCH_CONTAINERS_BY_SUPPLIER" }
  | { type: "CREATE_CONTAINER" }
  | { type: "UPDATE_CONTAINER" }
  | {
      type: "FETCH_CONTAINERS_SUCCESS";
      payload: { status: "success"; data: Container[] };
    }
  | {
      type: "FETCH_CONTAINERS_BY_SUPPLIER_SUCCESS";
      payload: { status: "success"; data: ContainersBySupplier };
    }
  | { type: "CREATE_CONTAINER_SUCCESS"; payload: Container }
  | { type: "UPDATE_CONTAINER_SUCCESS"; payload: Container }
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
  getContainers: () => {},
  fetchContainersBySupplier: async () => {},
  createContainer: () => {},
  updateContainer: () => {},
});

const containerReducer = (state: ContainerState, action: ContainerAction) => {
  switch (action.type) {
    case ContainerActions.FETCH_CONTAINERS:
    case ContainerActions.FETCH_CONTAINERS_BY_SUPPLIER:
    case ContainerActions.CREATE_CONTAINER:
    case ContainerActions.UPDATE_CONTAINER:
      return { ...state, isLoading: true };

    case ContainerActions.FETCH_CONTAINERS_SUCCESS:
      return { ...state, isLoading: false, containers: action.payload.data };
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
        containers: [...state.containers, action.payload],
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
    formData: FormData
  ) => {
    dispatch({ type: ContainerActions.CREATE_CONTAINER });
    try {
      const response = await axios.post(`/suppliers/${supplierId}/containers`, {
        container_num: formData.get("container_num"),
        bill_of_lading_number: formData.get("bill_of_lading_number"),
        port_of_landing: formData.get("port_of_landing"),
        carrier: formData.get("carrier"),
        vessel: formData.get("vessel"),
        invoice_num: formData.get("invoice_num"),
        gross_weight: formData.get("gross_weight"),
        auction_or_sell: (
          formData.get("auction_or_sell") as string
        ).toUpperCase(),
        branch_id: formData.get("branch_id"),
        telegraphic_transferred: moment(
          formData.get("telegraphic_transferred")?.toString()
        ).format("YYYY-MM-DD HH:mm:ss"),
        arrival_date_warehouse_ph: moment(
          formData.get("arrival_date_warehouse_ph")?.toString()
        ).format("YYYY-MM-DD HH:mm:ss"),
        departure_date_from_japan: moment(
          formData.get("departure_date_from_japan")?.toString()
        ).format("YYYY-MM-DD HH:mm:ss"),
        eta_to_ph: moment(formData.get("eta_to_ph")?.toString()).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        sorting_date: moment(formData.get("sorting_date")?.toString()).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        auction_date: moment(formData.get("auction_date")?.toString()).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        payment_date: moment(formData.get("payment_date")?.toString()).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        vanning_date: moment(formData.get("vanning_date")?.toString()).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        devanning_date: moment(
          formData.get("devanning_date")?.toString()
        ).format("YYYY-MM-DD HH:mm:ss"),
      });

      dispatch({
        type: ContainerActions.CREATE_CONTAINER_SUCCESS,
        payload: response.data.data,
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
