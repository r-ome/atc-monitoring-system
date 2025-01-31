import { createContext, useCallback, useContext, useReducer } from "react";
import axios from "axios";
import { Payment } from "../../types";
import * as PaymentActions from "./action";

interface PaymentState {
  payment: Payment | null;
  payments: any;
  isLoading: boolean;
  errors: any;
}

interface PaymentContextType extends PaymentState {
  fetchAuctionPayments: (auctionId: string) => Promise<void>;
}

export type PaymentAction =
  | { type: "FETCH_AUCTION_PAYMENT" }
  | { type: "FETCH_AUCTION_PAYMENT_SUCCESS"; payload: { data: any } }
  | { type: "FETCH_AUCTION_PAYMENT_FAILED"; payload: { error: any } };

const initialState: PaymentState = {
  isLoading: false,
  payments: {},
  payment: null,
  errors: null,
};

const PaymentContext = createContext<PaymentContextType>({
  ...initialState,
  fetchAuctionPayments: async () => {},
});

const paymentsReducer = (state: PaymentState, action: PaymentAction) => {
  switch (action.type) {
    case PaymentActions.FETCH_AUCTION_PAYMENT:
      return { ...state, isLoading: true };
    case PaymentActions.FETCH_AUCTION_PAYMENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        payments: action.payload.data,
      };
    case PaymentActions.FETCH_AUCTION_PAYMENT_FAILED:
      return { ...state, isLoading: false, errors: action.payload };
  }
};

export const PaymentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(paymentsReducer, initialState);

  const fetchAuctionPayments = useCallback(async (auctionId: string) => {
    dispatch({ type: PaymentActions.FETCH_AUCTION_PAYMENT });
    try {
      const response = await axios.get(`/auctions/${auctionId}/payments`);
      dispatch({
        type: PaymentActions.FETCH_AUCTION_PAYMENT_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: PaymentActions.FETCH_AUCTION_PAYMENT_FAILED,
        payload: error.payload,
      });
    }
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        ...state,
        fetchAuctionPayments,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayments must be used within a PaymentProvider");
  }
  return context;
};
