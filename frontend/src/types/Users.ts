export type UserRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "ADMIN"
  | "CASHIER"
  | "ENCODER";

export type User = {
  user_id: string;
  name: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type RegisterUserPayload = {
  name: string;
  username: string;
  password: string;
  role: UserRole;
  confirmPassword?: string;
};

export type ResetPasswordPayload = {
  username: string;
  new_password: string;
};
