import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { usePageLayoutProps } from "@layouts";
import { SERVER_ERROR_MESSAGE } from "../errors";
import { Input, Modal, Skeleton, Typography } from "antd";
import { RHFInput, RHFInputPassword } from "@components";
import { useUsers } from "@context";
import { User, ResetPasswordPayload } from "@types";

interface ResetPasswordModalProps {
  open: boolean;
  user: User | null;
  onCancel: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  user,
  onCancel,
}) => {
  const methods = useForm<ResetPasswordPayload>({
    defaultValues: { username: user?.username, new_password: "" },
  });
  const {
    resetPassword,
    user: SuccessResponse,
    isLoading,
    error: ErrorResponse,
    resetUser,
  } = useUsers();
  const { openNotification } = usePageLayoutProps();
  const [doesPasswordMatch, setDoesPasswordMatch] = useState<boolean>();

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        if (ErrorResponse?.httpStatus === 500) {
          openNotification(SERVER_ERROR_MESSAGE, "error", "Server Error");
        }
      }

      if (SuccessResponse) {
        openNotification("Successfully reset user password!");
        resetUser();
      }
    }
  }, [isLoading, ErrorResponse, openNotification, SuccessResponse, resetUser]);

  const handleResetPassword = methods.handleSubmit(async (data) => {
    await resetPassword(data);
  });

  if (!user) return <Skeleton />;

  return (
    <>
      <Modal
        open={open}
        onCancel={onCancel}
        onOk={handleResetPassword}
        okButtonProps={{ disabled: doesPasswordMatch }}
        title={`Reset ${user.name}'s Password`}
        confirmLoading={isLoading}
      >
        <form
          id="reset_password"
          className="flex flex-col gap-4 w-full"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <Typography.Title level={5}>Username:</Typography.Title>
            <RHFInput
              control={methods.control}
              name="username"
              disabled={true}
              placeholder="Username"
              onChange={(e) =>
                methods.setValue(
                  "username",
                  e.target.value.toUpperCase().trim()
                )
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
            <Typography.Title level={5}>New Password:</Typography.Title>
            <RHFInputPassword
              control={methods.control}
              name="new_password"
              disabled={isLoading}
              placeholder="New Password"
              rules={{
                required: "Password is required!",
                pattern: {
                  value: /^[a-zA-Z0-9Ññ\- ]+$/,
                  message: "Invalid characters!",
                },
                minLength: {
                  value: 8,
                  message: "Minimum of 8 characters!",
                },
              }}
            />
          </div>
          <div>
            <Typography.Title level={5}>Confirm New Password:</Typography.Title>
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
                const password = methods.getValues("new_password");
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
        </form>
      </Modal>
    </>
  );
};

export default ResetPasswordModal;
