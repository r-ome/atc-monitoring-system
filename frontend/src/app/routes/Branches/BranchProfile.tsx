import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useBranches } from "@context";
import { usePageLayoutProps } from "@layouts";
import { Button, Card, Descriptions, Skeleton, Table } from "antd";

const BranchProfile = () => {
  const params = useParams();
  const { openNotification, setPageBreadCrumbs } = usePageLayoutProps();
  const {
    branch,
    fetchBranch,
    isLoading: isFetchingBranch,
    error: ErrorResponse,
  } = useBranches();

  useEffect(() => {
    if (branch) {
      setPageBreadCrumbs([
        { title: "Branches List", path: "branches" },
        { title: `${branch.name} Branch` },
      ]);
    }
  }, [branch, setPageBreadCrumbs]);

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
        <div className="flex flex-grow gap-2">
          <div className="w-2/6 h-full">
            <Card loading={isFetchingBranch}>
              <Descriptions
                size="small"
                layout="vertical"
                bordered
                extra={
                  <Button
                    type="primary"
                    onClick={() => {
                      openNotification("TO DO: EDIT Branch");
                    }}
                  >
                    Edit
                  </Button>
                }
                title={`${branch.name} Branch`}
                items={[
                  {
                    key: "1",
                    label: "Total Containers",
                    children: branch.containers.length,
                  },
                  {
                    key: "2",
                    label: "Date Created",
                    children: branch.created_at,
                  },
                ]}
              ></Descriptions>
            </Card>
          </div>

          <Card
            className="w-4/6 py-4 h-full"
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
              pagination={false}
              columns={[
                {
                  title: "Supplier Name",
                  render: (row) => row.supplier.name,
                },
                { title: "Barcode", dataIndex: "barcode" },
                { title: "Container Number", dataIndex: "container_num" },
              ]}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default BranchProfile;
