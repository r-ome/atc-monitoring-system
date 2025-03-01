import { useNavigate } from "react-router-dom";
import { BaseBranch } from "@types";
import { useBranches } from "@context";
import { Tooltip, Space, Button, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { usePageLayoutProps } from "@layouts";
import { useBreadcrumbs } from "app/hooks";

const BranchList = () => {
  const navigate = useNavigate();
  const {
    fetchBranches,
    branches,
    isLoading,
    error: ErrorResponse,
    resetBranchResponse,
  } = useBranches();
  const { openNotification } = usePageLayoutProps();
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    resetBranchResponse();
    setBreadcrumb({ title: "Branches List", path: "/branches", level: 1 });
  }, [setBreadcrumb, resetBranchResponse]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBranches();
    };
    fetchInitialData();
  }, [fetchBranches]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse && ErrorResponse.httpStatus === 500) {
        openNotification(
          "There might be problems in the server. Please contact your admin.",
          "error",
          "Server Error"
        );
      }
    }
  }, [ErrorResponse, isLoading, openNotification]);

  return (
    <div>
      <div className="flex my-2">
        <Button
          type="primary"
          size="large"
          onClick={() => navigate(`/branches/create`)}
        >
          Create Branch
        </Button>
      </div>

      <Table
        loading={isLoading}
        rowKey={(record) => record.branch_id}
        dataSource={branches}
        columns={[
          {
            title: "Branch Name",
            dataIndex: "name",
          },
          {
            title: "Date Created",
            dataIndex: "created_at",
          },
          {
            title: "Last Date Updated",
            dataIndex: "updated_at",
          },
          {
            title: "Action",
            key: "action",
            render: (_, branch: BaseBranch) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Branch">
                    <Button
                      onClick={() => navigate(`/branches/${branch.branch_id}`)}
                    >
                      <EyeOutlined />
                    </Button>
                  </Tooltip>
                </Space>
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default BranchList;
