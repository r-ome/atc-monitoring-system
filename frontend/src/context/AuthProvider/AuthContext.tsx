import { createContext, useEffect, useContext, useReducer } from "react";
import axios, { isAxiosError } from "axios";
import { LoginPayload, User, APIError } from "@types";
import * as AuthActions from "./actions";

interface AuthState {
  user?: User | null;
  isLoading: boolean;
  error?: APIError;
}

interface AuthStateContextType extends AuthState {
  login: (body: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export type AuthAction =
  | { type: "LOGIN_USER" }
  | { type: "LOGIN_USER_SUCCESS"; payload: { data: User } }
  | { type: "LOGIN_USER_FAILED"; payload: APIError }
  | { type: "LOGOUT_USER" }
  | { type: "LOGOUT_USER_SUCCESS"; payload: { data: User | null } }
  | { type: "LOGOUT_USER_FAILED"; payload: APIError }
  | { type: "SET_CURRENT_USER"; payload: { data: User | null | undefined } };

const initialState = {
  user: undefined,
  isLoading: false,
  error: undefined,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AuthActions.LOGIN_USER:
    case AuthActions.LOGOUT_USER:
      return { ...state, isLoading: true };

    case AuthActions.LOGIN_USER_SUCCESS:
      return { ...state, isLoading: false, user: action.payload.data };

    case AuthActions.LOGOUT_USER_SUCCESS:
      return { ...state, isLoading: false, user: null };

    case AuthActions.LOGOUT_USER_FAILED:
    case AuthActions.LOGIN_USER_FAILED:
      return { ...state, isLoading: false, error: action.payload };

    case AuthActions.SET_CURRENT_USER:
      return {
        ...state,
        isLoading: false,
        error: undefined,
        user: action.payload.data,
      };
  }
};

const AuthContext = createContext<AuthStateContextType>({
  ...initialState,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const fetchInitialUser = async () => {
      try {
        const response = await axios.get(`/users/me`);
        dispatch({
          type: AuthActions.SET_CURRENT_USER,
          payload: response.data,
        });
      } catch (error) {
        dispatch({
          type: AuthActions.SET_CURRENT_USER,
          payload: { data: null },
        });
      }
    };

    if (!state.user) {
      fetchInitialUser();
    }
  }, [state.user]);

  const login = async ({ username, password }: LoginPayload) => {
    dispatch({ type: AuthActions.LOGIN_USER });
    try {
      const response = await axios.post(`/login`, { username, password });
      dispatch({
        type: AuthActions.LOGIN_USER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuthActions.LOGIN_USER_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  const logout = async () => {
    dispatch({ type: AuthActions.LOGOUT_USER });
    try {
      await axios.post("/logout");
      dispatch({ type: AuthActions.SET_CURRENT_USER, payload: { data: null } });
      dispatch({
        type: AuthActions.LOGOUT_USER_SUCCESS,
        payload: { data: null },
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        dispatch({
          type: AuthActions.LOGOUT_USER_FAILED,
          payload: error.response.data,
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
