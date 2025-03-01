import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, Card, notification, Typography } from "antd";
import { RHFInput, RHFInputPassword } from "@components";
import { useAuth } from "@context";
import { LoginPayload } from "@types";
import { USERS_401, SERVER_ERROR_MESSAGE } from "../errors";

const LoginPage = () => {
  const navigate = useNavigate();
  const methods = useForm<LoginPayload>();
  const [api, contextHolder] = notification.useNotification();
  const { login, user, error: ErrorResponse, isLoading } = useAuth();

  const handleSubmit = methods.handleSubmit(async (data) => {
    await login(data);
  });

  const openNotification = useCallback(
    (
      description: string,
      type: "success" | "error",
      message: string = "Success!"
    ) =>
      api[type]({
        message,
        description,
        placement: "topRight",
      }),
    [api]
  );

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        if (ErrorResponse.httpStatus === 500) {
          openNotification(SERVER_ERROR_MESSAGE, "error", "Error");
        }

        if (ErrorResponse.error === USERS_401) {
          openNotification(
            "The username or password is incorrect",
            "error",
            "Error"
          );
          const error = {
            type: "string",
            message: "Username or password is incorrect",
          };
          methods.setError("username", error);
          methods.setError("password", error);
        }
      }

      if (user) {
        openNotification("Successfully logged in!", "success", "Success");
        setTimeout(() => {
          navigate("/auctions");
        }, 500);
      }
    }
  }, [ErrorResponse, isLoading, methods, openNotification, navigate, user]);

  return (
    <div className="flex justify-center items-center h-screen">
      {contextHolder}
      <Card title="ATC Login" className="w-1/6">
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <div>
            <Typography.Text>Username: </Typography.Text>
            <RHFInput
              control={methods.control}
              name="username"
              placeholder="Username"
              rules={{ required: "This field is required!" }}
              disabled={isLoading}
            ></RHFInput>
          </div>
          <div>
            <Typography.Text>Password</Typography.Text>
            <RHFInputPassword
              control={methods.control}
              name="password"
              placeholder="Password"
              disabled={isLoading}
              rules={{ required: "This field is required!" }}
            ></RHFInputPassword>
          </div>
          <div>
            <Button
              type="primary"
              className="w-full"
              htmlType="submit"
              loading={isLoading}
            >
              Login
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
