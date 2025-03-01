import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { RegisterUserPayload } from "@types";
import { useUsers } from "@context";
import { RHFInput, RHFSelect, RHFInputPassword } from "@components";
import { Button, Card, Input, Typography } from "antd";
import { usePageLayoutProps } from "@layouts";
import { USERS_401, USERS_402 } from "../errors";

const CreateUser = () => {
  const navigate = useNavigate();
  const methods = useForm<RegisterUserPayload>();
  const {
    user: SuccessResponse,
    isLoading,
    error: ErrorResponse,
    registerUser,
    resetUser,
  } = useUsers();
  const { openNotification, setPageBreadCrumbs } = usePageLayoutProps();
  const [doesPasswordMatch, setDoesPasswordMatch] = useState<boolean>();

  useEffect(() => {
    setPageBreadCrumbs([
      { title: "Users List", path: "/users" },
      { title: "Register" },
    ]);
  }, [setPageBreadCrumbs]);

  useEffect(() => {
    if (!isLoading) {
      if (SuccessResponse) {
        methods.reset();
        openNotification("Successfully Registerd User!");
      }

      if (ErrorResponse) {
        let message = "Server Error";
        if (ErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }

        if (ErrorResponse.error === USERS_401) {
          message = "Please double check your inputs!";
        }

        if (ErrorResponse.error === USERS_402) {
          methods.setError("username", {
            type: "string",
            message: "username already exist!",
          });
        }
        openNotification(message, "error", "Server Error");
      }

      if (SuccessResponse) {
        methods.reset();
        openNotification("Successfully Registered User!");
        resetUser();
      }
    }
  }, [
    ErrorResponse,
    SuccessResponse,
    methods,
    isLoading,
    openNotification,
    resetUser,
  ]);

  const handleSubmit = methods.handleSubmit(async (data) => {
    await registerUser({
      name: data.name,
      username: data.username,
      password: data.password,
      role: data.role,
    });
  });

  return (
    <Card className="py-4" title={<h1 className="text-3xl">Register User</h1>}>
      <form
        id="register_user"
        className="flex flex-col gap-4 w-2/4"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* TEMPORARILY REMOVED "ADMIN" ROLE */}
        <div>
          <Typography.Title level={5}>Roles:</Typography.Title>
          <RHFSelect
            showSearch
            control={methods.control}
            name="role"
            placeholder="Select a Role"
            filterOption={(input: string, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={["CASHIER", "ENCODER"].map((val) => ({
              label: val,
              value: val,
            }))}
            rules={{ required: "This field is required!" }}
          />
        </div>
        <div>
          <Typography.Title level={5}>Employee Name:</Typography.Title>
          <RHFInput
            control={methods.control}
            name="name"
            disabled={isLoading}
            placeholder="Employee Name"
            onChange={(e) =>
              methods.setValue("name", e.target.value.toUpperCase())
            }
            rules={{
              required: "Employee name is required!",
              pattern: {
                value: /^[a-zA-Z0-9Ññ\- ]+$/,
                message: "Invalid characters!",
              },
            }}
          />
        </div>
        <div>
          <Typography.Title level={5}>Employee Username:</Typography.Title>
          <RHFInput
            control={methods.control}
            name="username"
            disabled={isLoading}
            placeholder="Username"
            onChange={(e) =>
              methods.setValue("username", e.target.value.toUpperCase().trim())
            }
            rules={{
              required: "Employee username is required!",
              pattern: {
                value: /^[a-zA-Z0-9Ññ\- ]+$/,
                message: "Invalid characters!",
              },
            }}
          />
        </div>
        <div>
          <Typography.Title level={5}>Password:</Typography.Title>
          <RHFInputPassword
            control={methods.control}
            name="password"
            disabled={isLoading}
            placeholder="Password"
            rules={{
              required: "Password is required!",
              pattern: {
                value: /^[a-zA-Z0-9Ññ\- ]+$/,
                message: "Invalid characters!",
              },
              minLength: {
                value: 8,
                message: "Minimum of 8 characters",
              },
            }}
          />
        </div>
        <div>
          <Typography.Title level={5}>Confirm Password:</Typography.Title>
          <Input.Password
            name="confirmPassword"
            disabled={isLoading}
            status={
              !doesPasswordMatch && doesPasswordMatch !== undefined
                ? "error"
                : ""
            }
            placeholder="Confirm New Password"
            onChange={(e) => {
              const password = methods.getValues("password");
              const confirmPassword = e.target.value;
              if (confirmPassword) {
                if (confirmPassword !== password) {
                  setDoesPasswordMatch(false);
                } else {
                  setDoesPasswordMatch(undefined);
                }
              } else {
                setDoesPasswordMatch(true);
              }
            }}
          />
          {!doesPasswordMatch && doesPasswordMatch !== undefined ? (
            <span className="text-red-500">Passwords doesn't match</span>
          ) : null}
        </div>

        <div className="flex gap-2 w-full justify-end">
          <Button onClick={() => navigate("/users")} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            type="primary"
            htmlType="submit"
            disabled={!doesPasswordMatch && doesPasswordMatch !== undefined}
            loading={isLoading}
          >
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateUser;
