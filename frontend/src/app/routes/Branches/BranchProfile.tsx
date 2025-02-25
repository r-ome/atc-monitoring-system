import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBranches } from "@context";
import { usePageLayoutProps } from "@layouts";
import { Button, Card, Skeleton, Statistic, Table } from "antd";
import { useBreadcrumbs } from "app/hooks";
import {
  ShopOutlined,
  CalendarOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import UpdateBranchModal from "./UpdateBranchModal";

const BranchProfile = () => {
  const params = useParams();
  const { openNotification } = usePageLayoutProps();
  const {
    branch,
    fetchBranch,
    isLoading: isFetchingBranch,
    error: ErrorResponse,
  } = useBranches();
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    if (branch) {
      setBreadcrumb({ title: `${branch.name} Branch`, level: 2 });
    }
  }, [branch, setBreadcrumb]);

  useEffect(() => {
    const { branch_id: branchId } = params;
    if (branchId) {
      const fetchInitialData = async () => {
        await fetchBranch(branchId);
      };
      fetchInitialData();
    }
  }, [params, fetchBranch]);

  useEffect(() => {
    if (!isFetchingBranch) {
      if (ErrorResponse && ErrorResponse.httpStatus === 500) {
        openNotification(
          "There might be problems in the server. Please contact your admin.",
          "error",
          "Server Error"
        );
      }
    }
  }, [ErrorResponse, isFetchingBranch, openNotification]);

  if (!branch) return <Skeleton />;

  return (
    <>
      <div className="h-full">
        <div className="flex flex-col gap-2">
          <div className="h-full flex justify-between w-full gap-2">
            {[
              {
                title: "Branch Name",
                value: `${branch.name} Branch`,
                prefix: <ShopOutlined />,
                action: (
                  <div className="w-1/6 flex justify-end">
                    <Button
                      type="primary"
                      onClick={() => setOpenEditModal(true)}
                    >
                      Edit Branch
                    </Button>
                  </div>
                ),
              },
              {
                title: "Total Containers",
                value: `${branch.containers.length} containers`,
                prefix: <BuildOutlined />,
              },
              {
                title: "Date Created",
                value: branch.created_at,
                prefix: <CalendarOutlined />,
              },
            ].map((item, i) => (
              <Card key={i} variant="borderless" className="flex-1">
                <div className="flex">
                  <div className="w-full">
                    <Statistic
                      title={item.title}
                      value={item.value}
                      prefix={item.prefix}
                    />
                  </div>
                  {item.action ? item.action : null}
                </div>
              </Card>
            ))}
          </div>

          <Card
            className="w-full py-4 h-full"
            title={
              <div className="flex justify-between items-center w-full p-2">
                <h1 className="text-3xl font-bold">Containers</h1>
              </div>
            }
          >
            <Table
              bordered
              loading={isFetchingBranch}
              rowKey={(row) => row.container_id}
              dataSource={branch.containers}
              className="h-[600px]"
              pagination={{
                position: ["topRight"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              scroll={{ y: 500 }}
              columns={[
                {
                  title: "Supplier Name",
                  render: (row) => row.supplier.name,
                },
                { title: "Barcode", dataIndex: "barcode" },
              ]}
            />
          </Card>
        </div>
      </div>

      <UpdateBranchModal
        branch={branch}
        open={openEditModal}
        handleCancel={() => setOpenEditModal(false)}
      />
    </>
  );
};

export default BranchProfile;
