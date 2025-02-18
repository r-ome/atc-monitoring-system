import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BaseSupplier } from "../../../types";
import { useSuppliers } from "@context/SupplierProvider/SupplierContext";
import { usePageLayoutProps } from "@layouts";
import RenderServerError from "../ServerCrashComponent";
import { Button, Space, Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const Suppliers = () => {
  const navigate = useNavigate();
  const { setPageBreadCrumbs } = usePageLayoutProps();
  const { error, suppliers, fetchSuppliers, resetSupplier } = useSuppliers();

  useEffect(() => {
    resetSupplier();
    setPageBreadCrumbs([{ title: "Suppliers List", path: "/suppliers" }]);
  }, [setPageBreadCrumbs, resetSupplier]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSuppliers();
    };
    fetchInitialData();
  }, [fetchSuppliers]);

  if (error?.httpStatus === 500) {
    return <RenderServerError {...error} />;
  }

  return (
    <div>
      <div className="flex my-2">
        <Button
          type="primary"
          size="large"
          onClick={() => navigate(`/suppliers/create`)}
        >
          Create Supplier
        </Button>
      </div>

      <Table
        rowKey={(record) => record.supplier_id}
        dataSource={suppliers}
        columns={[
          {
            title: "Name",
            dataIndex: "name",
          },
          {
            title: "Supplier Code",
            dataIndex: "supplier_code",
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
            render: (_, supplier: BaseSupplier) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Supplier">
                    <Button
                      onClick={() =>
                        navigate(`/suppliers/${supplier.supplier_id}`, {
                          state: { supplier },
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
    </div>
  );
};

export default Suppliers;
