import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseSupplier } from "../../../types";
import { useSuppliers } from "@context/SupplierProvider/SupplierContext";
import { usePageLayoutProps } from "@layouts";
import { Button, Input, Space, Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useBreadcrumbs } from "app/hooks";

const Suppliers = () => {
  const navigate = useNavigate();
  const { openNotification } = usePageLayoutProps();
  const {
    suppliers,
    isLoading,
    error: ErrorResponse,
    fetchSuppliers,
    resetSupplier,
  } = useSuppliers();
  const [searchValue, setSearchValue] = useState<string>("");
  const [dataSource, setDataSource] = useState<BaseSupplier[]>(suppliers);
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    resetSupplier();
    setBreadcrumb({ title: "Suppliers List", path: "/suppliers", level: 1 });
  }, [setBreadcrumb, resetSupplier]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSuppliers();
    };
    fetchInitialData();
  }, [fetchSuppliers]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse && ErrorResponse.httpStatus === 500) {
        openNotification(
          "There might be problems in the server. Please contact your admin.",
          "error",
          "Server Error"
        );
        resetSupplier();
      }
    }
  }, [ErrorResponse, resetSupplier, isLoading, openNotification]);

  return (
    <div>
      <div className="flex justify-between my-2">
        <div>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate(`/suppliers/create`)}
          >
            Create Supplier
          </Button>
        </div>
        <div className="w-2/6 my-2">
          <Input
            placeholder="Search by Supplier Name or Code"
            value={searchValue}
            onChange={(e) => {
              const currentValue = e.target.value;
              setSearchValue(currentValue);
              const filteredData = suppliers.filter(
                (item) =>
                  item.supplier_code
                    .toUpperCase()
                    .includes(currentValue.toUpperCase()) ||
                  item.name.toUpperCase().includes(currentValue.toUpperCase())
              );
              setDataSource(filteredData);
            }}
          />
        </div>
      </div>

      <Table
        loading={isLoading}
        rowKey={(record) => record.supplier_id}
        dataSource={searchValue ? dataSource : suppliers}
        className="h-[600px]"
        pagination={{
          position: ["topRight"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
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
            title: "Total Containers",
            dataIndex: "total_containers",
          },
          {
            title: "Date Created",
            dataIndex: "created_at",
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
