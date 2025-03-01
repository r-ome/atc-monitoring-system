import { createContext, useCallback, useContext, useReducer } from "react";
import axios, { isAxiosError } from "axios";
import { User, APIError } from "@types";
import * as UsersActions from "./actions";
import { RegisterUserPayload, ResetPasswordPayload } from "@types";

interface UsersState {
  user: User | null;
  users: User[];
  isLoading: boolean;
  error?: APIError;
}

interface UsersStateContextType extends UsersState {
  fetchUsers: () => Promise<void>;
  registerUser: (body: RegisterUserPayload) => Promise<void>;
  resetPassword: (body: ResetPasswordPayload) => Promise<void>;
  resetUser: () => void;
}

export type AuthAction =
  | { type: "RESET_USER" }
  | { type: "FETCH_USERS" }
  | { type: "FETCH_USERS_SUCCESS"; payload: { data: User[] } }
  | { type: "FETCH_USERS_FAILED"; payload: APIError }
  | { type: "REGISTER_USER" }
  | { type: "REGISTER_USER_SUCCESS"; payload: { data: User } }
  | { type: "REGISTER_USER_FAILED"; payload: APIError }
  | { type: "RESET_PASSWORD" }
  | { type: "RESET_PASSWORD_SUCCESS"; payload: { data: User } }
  | { type: "RESET_PASSWORD_FAILED"; payload: APIError };

const initialState = {
  user: null,
  users: [],
  isLoading: false,
  error: undefined,
};

const usersReducer = (state: UsersState, action: AuthAction): UsersState => {
  switch (action.type) {
    case UsersActions.FETCH_USERS:
    case UsersActions.RESET_PASSWORD:
    case UsersActions.REGISTER_USER:
      return { ...state, isLoading: true };

    case UsersActions.FETCH_USERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        users: action.payload.data,
        error: undefined,
      };

    case UsersActions.RESET_PASSWORD_SUCCESS:
    case UsersActions.REGISTER_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.data,
        error: undefined,
      };

    case UsersActions.RESET_PASSWORD_FAILED:
    case UsersActions.FETCH_USERS_FAILED:
    case UsersActions.REGISTER_USER_FAILED:
      return { ...state, isLoading: false, error: action.payload };

    case UsersActions.RESET_USER:
      return { ...state, isLoading: false, user: null, error: undefined };
  }
};

const UsersContext = createContext<UsersStateContextType>({
  ...initialState,
  fetchUsers: async () => {},
  registerUser: async () => {},
  resetPassword: async () => {},
  resetUser: () => {},
});

export const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(usersReducer, initialState);

  const fetchUsers = useCallback(async () => {
    dispatch({ type: UsersActions.FETCH_USERS });
    try {
      const response = await axios.get(`/users`);
      dispatch({
        type: UsersActions.FETCH_USERS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: UsersActions.FETCH_USERS_FAILED,
          payload: error.response?.data,
        });
      }
    }
  }, []);

  const registerUser = async (body: RegisterUserPayload) => {
    dispatch({ type: UsersActions.REGISTER_USER });
    try {
      const response = await axios.post("/users", body);

      dispatch({
        type: UsersActions.REGISTER_USER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: UsersActions.REGISTER_USER_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const resetPassword = async (body: ResetPasswordPayload) => {
    dispatch({ type: UsersActions.RESET_PASSWORD });
    try {
      const response = await axios.post("/users/reset-password", body);
      dispatch({
        type: UsersActions.RESET_PASSWORD_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: UsersActions.RESET_PASSWORD_FAILED,
          payload: error.response?.data,
        });
      }
    }
  };

  const resetUser = useCallback(
    () => dispatch({ type: UsersActions.RESET_USER }),
    []
  );
  return (
    <UsersContext.Provider
      value={{ ...state, fetchUsers, registerUser, resetPassword, resetUser }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
};
