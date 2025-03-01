import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSuppliers } from "@context/SupplierProvider/SupplierContext";
import { useContainers } from "@context/ContainerProvider/ContainerContext";
import { BaseContainer } from "@types";
import { usePageLayoutProps } from "@layouts/PageLayout";
import {
  Button,
  Card,
  Descriptions,
  Skeleton,
  Space,
  Table,
  Tooltip,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { SUPPLIERS_403 } from "../errors";
import { useBreadcrumbs } from "app/hooks";

const SupplierProfile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const {
    supplier,
    fetchSupplier,
    isLoading: isFetchingSupplier,
    error: SupplierErrorResponse,
    resetSupplier,
  } = useSuppliers();
  const {
    containersBySupplier,
    fetchContainersBySupplier,
    isLoading: isFetchingContainers,
    error: ContainerErrorResponse,
    resetContainer,
  } = useContainers();
  const { setBreadcrumb } = useBreadcrumbs();
  const { openNotification } = usePageLayoutProps();

  useEffect(() => {
    resetContainer();
    if (supplier) {
      setBreadcrumb({
        title: `${supplier.name}'s Profile`,
        path: `/${supplier.supplier_id}`,
        level: 2,
      });
    }
  }, [supplier, setBreadcrumb, resetContainer]);

  useEffect(() => {
    const { supplier_id: supplierId } = params;
    if (supplierId) {
      const fetchInitialData = async () => {
        await fetchSupplier(supplierId);
        await fetchContainersBySupplier(supplierId);
      };
      fetchInitialData();
    }
  }, [supplier?.supplier_id, fetchSupplier, fetchContainersBySupplier, params]);

  useEffect(() => {
    if (!isFetchingSupplier) {
      if (SupplierErrorResponse) {
        let message = "Server Error";
        if (SupplierErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }

        if (SupplierErrorResponse.error === SUPPLIERS_403) {
          message =
            "Supplier does not exist. Please go back to list and choose another one";
        }

        openNotification(message, "error", "Server Error");
        resetSupplier();
      }
    }
  }, [
    SupplierErrorResponse,
    isFetchingSupplier,
    openNotification,
    resetSupplier,
  ]);

  useEffect(() => {
    if (!isFetchingContainers) {
      if (ContainerErrorResponse) {
        if (ContainerErrorResponse.httpStatus === 500) {
          openNotification(
            "There might be problems in the server. Please contact your admin.",
            "error",
            "Server Error"
          );
        }

        resetContainer();
      }
    }
  }, [
    ContainerErrorResponse,
    isFetchingContainers,
    openNotification,
    resetContainer,
  ]);

  if (!supplier) return <Skeleton />;

  return (
    <>
      <div className="h-full">
        <div className="flex flex-grow gap-2">
          <div className="w-2/6 h-full">
            <Card loading={isFetchingSupplier}>
              <Descriptions
                size="small"
                layout="vertical"
                bordered
                extra={
                  <Button
                    type="primary"
                    onClick={() => {
                      openNotification("TO DO: EDIT Supplier");
                    }}
                  >
                    Edit
                  </Button>
                }
                title={supplier.name}
                items={[
                  {
                    key: "1",
                    label: "Code",
                    span: 1,
                    children: supplier.supplier_code,
                  },
                  {
                    key: "2",
                    label: "Containers",
                    span: 1,
                    children: supplier.num_of_containers,
                  },
                  {
                    key: "3",
                    label: "Shipper",
                    span: 1,
                    children: supplier.shipper,
                  },
                  {
                    key: "4",
                    label: "Date Added",
                    span: 3,
                    children: supplier.created_at,
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
                <Button
                  type="primary"
                  onClick={() => navigate("containers/create")}
                >
                  Add Container
                </Button>
              </div>
            }
          >
            <Table
              bordered
              loading={isFetchingContainers}
              rowKey={(row) => row.container_id}
              dataSource={containersBySupplier}
              pagination={false}
              columns={[
                {
                  title: "Barcode",
                  dataIndex: "barcode",
                },
                {
                  title: "Branch",
                  dataIndex: "branch",
                  render: (val, item) => item.branch.name,
                },
                { title: "Number of Items", dataIndex: "num_of_items" },

                {
                  title: "Action",
                  key: "action",
                  render: (_, container: BaseContainer) => {
                    return (
                      <Space size="middle">
                        <Tooltip placement="top" title="View Container">
                          <Button
                            onClick={() =>
                              navigate(`containers/${container.container_id}`, {
                                state: { container },
                              })
                            }
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
          </Card>
        </div>
      </div>
    </>
  );
};

export default SupplierProfile;
