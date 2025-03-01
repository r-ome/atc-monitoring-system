import { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { usePageLayoutProps } from "@layouts";
import { SERVER_ERROR_MESSAGE } from "../errors";
import { Button, Space, Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useUsers } from "@context";
import { User } from "@types";
import ResetPasswordModal from "./ResetPasswordModal";

const UsersList = () => {
  const navigate = useNavigate();
  const { fetchUsers, isLoading, users, error: ErrorResponse } = useUsers();
  const { openNotification } = usePageLayoutProps();
  const [resetModal, setResetModal] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchUsers();
    };

    fetchInitialData();
  }, [fetchUsers]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        if (ErrorResponse?.httpStatus === 500) {
          openNotification(SERVER_ERROR_MESSAGE, "error", "Server Error");
        }
      }
    }
  }, [isLoading, ErrorResponse, openNotification]);

  return (
    <>
      <div className="flex my-2">
        <Button
          type="primary"
          size="large"
          onClick={() => navigate(`/users/create`)}
        >
          Register User
        </Button>
      </div>

      <Table
        loading={isLoading}
        rowKey={(user) => user.user_id}
        dataSource={users}
        columns={[
          {
            title: "Name",
            dataIndex: "name",
          },
          {
            title: "Username",
            dataIndex: "username",
          },
          {
            title: "Role",
            dataIndex: "role",
            render: (value) => value.replace("_", " "),
          },
          {
            title: "Registered At",
            dataIndex: "created_at",
            render: (value) => moment(new Date(value)).format("MMMM DD, YYYY"),
          },
          {
            title: "Last Updated At",
            dataIndex: "updated_at",
            render: (value) =>
              moment(new Date(value)).format("MMMM DD, YYYY hh:mmA"),
          },
          {
            title: "Action",
            key: "action",
            render: (_, user: User) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="Reset Password">
                    <Button onClick={() => setResetModal({ open: true, user })}>
                      <EyeOutlined />
                    </Button>
                  </Tooltip>
                </Space>
              );
            },
          },
        ]}
      />

      {resetModal.open ? (
        <ResetPasswordModal
          open={resetModal.open}
          user={resetModal.user}
          onCancel={() => setResetModal({ open: false, user: null })}
        />
      ) : null}
    </>
  );
};

export default UsersList;
