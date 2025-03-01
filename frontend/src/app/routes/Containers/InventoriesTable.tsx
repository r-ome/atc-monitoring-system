import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Inventory } from "@types";
import { Button, Input, Space, Table, Tag, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useInventories } from "@context";
import { usePageLayoutProps } from "@layouts/PageLayout";

interface IntenvoriesTableProps {}

const InventoriesTable: React.FC<IntenvoriesTableProps> = () => {
  const navigate = useNavigate();
  const params = useParams();
  const {
    inventoriesByContainer,
    fetchInventoriesByContainer,
    isLoading: isFetchingInventories,
    error: InventoryErrorResponse,
  } = useInventories();
  const { openNotification } = usePageLayoutProps();

  const [dataSource, setDataSource] = useState<Inventory[]>(
    inventoriesByContainer
  );
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    const { container_id: containerId } = params;
    if (containerId) {
      const fetchInitialData = async () => {
        await fetchInventoriesByContainer(containerId);
      };
      fetchInitialData();
    }
  }, [params, fetchInventoriesByContainer]);

  useEffect(() => {
    if (!isFetchingInventories) {
      if (InventoryErrorResponse) {
        if (InventoryErrorResponse.httpStatus === 500) {
          openNotification(
            "There might be problems in the server. Please contact your admin.",
            "error",
            "Server Error"
          );
        }
      }
    }
  }, [isFetchingInventories, InventoryErrorResponse, openNotification]);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex justify-between">
        <div className="w-1/5">
          <Input
            placeholder="Search by Barcode, Control, Description"
            value={searchValue}
            onChange={(e) => {
              const currentValue = e.target.value;
              setSearchValue(currentValue);

              let filteredData = [];

              filteredData = inventoriesByContainer.filter(
                (inventory) =>
                  inventory.barcode.includes(currentValue) ||
                  inventory.control.includes(currentValue.toUpperCase()) ||
                  inventory.description.includes(currentValue.toUpperCase()) ||
                  inventory.status.includes(currentValue.toUpperCase())
              );

              setDataSource(filteredData);
            }}
          />
        </div>
        <div>
          <Button
            type="primary"
            onClick={() =>
              navigate(`/containers/${params?.container_id}/inventory/create`)
            }
          >
            Add Inventory
          </Button>
        </div>
      </div>

      <Table
        bordered
        loading={isFetchingInventories}
        rowKey={(row) => row.inventory_id}
        dataSource={searchValue ? dataSource : inventoriesByContainer}
        scroll={{ y: 700 }}
        columns={[
          {
            title: "Status",
            dataIndex: "status",
            width: "10%",
            filters: [
              { text: "REBID", value: "REBID" },
              { text: "UNSOLD", value: "UNSOLD" },
              { text: "SOLD", value: "SOLD" },
              { text: "VOID", value: "VOID" },
            ],
            onFilter: (value, record) =>
              record.status.indexOf(value as string) === 0,
            render: (item) => {
              let color = "green";
              if (item === "SOLD") color = "green";
              if (["UNSOLD", "VOID"].includes(item)) color = "red";
              if (item === "REBID") color = "orange";

              return (
                <Tag color={color} bordered={false}>
                  {item}
                </Tag>
              );
            },
          },
          {
            title: "Barcode",
            dataIndex: "barcode",
            width: "15%",
          },
          {
            title: "Control Number",
            dataIndex: "control",
            width: "15%",
            render: (val) => <>{val ? val : "NO CONTROL"}</>,
          },
          {
            title: "Description",
            dataIndex: "description",
            width: "35%",
          },
          {
            title: "Price",
            dataIndex: "price",
            width: "15%",
            render: (val) => <>{val ? val.toLocaleString() : 0}</>,
          },
          {
            title: "Action",
            key: "action",
            render: (_, inventory: Inventory) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Container">
                    <Button
                      onClick={() =>
                        navigate(`/inventories/${inventory.inventory_id}`, {
                          state: { inventory },
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

export default InventoriesTable;
