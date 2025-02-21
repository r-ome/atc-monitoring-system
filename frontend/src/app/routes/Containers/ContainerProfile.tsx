import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useContainers, useInventories } from "@context";
import { useBreadcrumbs } from "../../hooks";
import { Inventory } from "@types";
import { usePageLayoutProps } from "@layouts";
import {
  Button,
  Card,
  Descriptions,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { CONTAINERS_403, INVENTORIES_403 } from "../errors";
import { formatNumberToCurrency } from "@lib/utils";

const ContainerProfile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const {
    container,
    fetchContainer,
    isLoading: isFetchingContainer,
    error: ContainerErrorResponse,
    resetContainer,
  } = useContainers();
  const {
    resetInventory,
    inventoriesByContainer,
    fetchInventoriesByContainer,
    isLoading: isFetchingInventories,
    error: InventoryErrorResponse,
  } = useInventories();
  const { openNotification } = usePageLayoutProps();
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    resetInventory();
    if (!container) return;
    setBreadcrumb({
      title: container.barcode,
      path: `/containers/${container.container_id}`,
      level: 3,
    });
  }, [container, setBreadcrumb, resetInventory]);

  useEffect(() => {
    const { container_id: containerId, supplier_id: supplierId } = params;
    if (supplierId && containerId) {
      const fetchInitialData = async () => {
        await fetchContainer(supplierId, containerId);
        await fetchInventoriesByContainer(supplierId, containerId);
      };
      fetchInitialData();
    }
  }, [params, fetchContainer, fetchInventoriesByContainer]);

  useEffect(() => {
    if (!isFetchingContainer) {
      if (ContainerErrorResponse) {
        let message = "Server Error";
        if (ContainerErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }

        if (ContainerErrorResponse.error === CONTAINERS_403) {
          message =
            "Container does not exist. Please go back to list and choose another one";
        }
        openNotification(message, "error", "Server Error");
        resetContainer();
      }
    }
  }, [
    ContainerErrorResponse,
    isFetchingContainer,
    openNotification,
    resetContainer,
  ]);

  useEffect(() => {
    if (!isFetchingInventories) {
      if (InventoryErrorResponse) {
        let message = "Server Error";
        if (InventoryErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }

        if (InventoryErrorResponse.error === INVENTORIES_403) {
          message =
            "Container does not exist. Please go back to list and choose another one";
        }
        openNotification(message, "error", "Server Error");
        resetInventory();
      }
    }
  }, [
    InventoryErrorResponse,
    isFetchingInventories,
    openNotification,
    resetInventory,
  ]);

  if (!container) return <Skeleton />;

  return (
    <>
      <div className="h-full">
        <div className="flex flex-grow gap-2">
          <div className="w-2/6 h-full">
            <Card loading={isFetchingContainer}>
              <Descriptions
                size="small"
                layout="vertical"
                bordered
                column={4}
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
                title={`Container ${container.barcode}`}
                items={[
                  {
                    key: "1",
                    label: "Container Number",
                    span: 2,
                    children: container.container_num,
                  },
                  {
                    key: "6",
                    label: "Number of Items",
                    span: 2,
                    children: container.num_of_items,
                  },
                  {
                    key: "20",
                    label: "Total SOLD items",
                    span: 4,
                    children: formatNumberToCurrency(
                      container.total_sold_item_price
                    ),
                  },
                  {
                    key: "16",
                    label: "Invoice Number",
                    span: 2,
                    children: container.invoice_num,
                  },
                  {
                    key: "2",
                    label: "Bill of Lading Number",
                    span: 2,
                    children: container.bill_of_lading_number,
                  },
                  {
                    key: "3",
                    label: "Port of landing",
                    span: 2,
                    children: container.port_of_landing,
                  },
                  {
                    key: "4",
                    label: "Carrier",
                    children: container.carrier,
                  },
                  {
                    key: "5",
                    label: "Vessel",
                    children: container.vessel,
                  },
                  {
                    key: "7",
                    label: "Departure Date From Japan",
                    span: 3,
                    children: container.departure_date_from_japan,
                  },
                  {
                    key: "8",
                    label: "ETA to PH",
                    span: 1,
                    children: container.eta_to_ph,
                  },
                  {
                    key: "9",
                    label: "Arrival date to PH Warehouse",
                    span: 4,
                    children: container.arrival_date_warehouse_ph,
                  },
                  {
                    key: "10",
                    label: "Sorting Date",
                    span: 2,
                    children: container.sorting_date,
                  },
                  {
                    key: "11",
                    label: "Auction Date",
                    span: 2,
                    children: container.auction_date,
                  },
                  {
                    key: "12",
                    label: "Payment Date",
                    span: 2,
                    children: container.payment_date,
                  },
                  {
                    key: "13",
                    label: "Telegraphic Transferred",
                    span: 2,
                    children: container.telegraphic_transferred,
                  },
                  {
                    key: "14",
                    label: "Vanning Date",
                    span: 2,
                    children: container.vanning_date,
                  },
                  {
                    key: "15",
                    label: "Devanning Date",
                    span: 2,
                    children: container.devanning_date,
                  },
                  {
                    key: "17",
                    label: "Gross Weight",
                    span: 2,
                    children: container.gross_weight,
                  },
                  {
                    key: "18",
                    label: "AUCTION or SELL",
                    span: 2,
                    children: container.auction_or_sell,
                  },
                  {
                    key: "19",
                    label: "Date Added",
                    span: 4,
                    children: container.created_at,
                  },
                ]}
              ></Descriptions>
            </Card>
          </div>

          <Card
            className="w-4/6 py-4 h-full"
            title={
              <div className="flex justify-between items-center w-full p-2">
                <h1 className="text-3xl font-bold">Inventories</h1>
                <Button
                  type="primary"
                  onClick={() => navigate("inventory/create")}
                >
                  Add Inventory
                </Button>
              </div>
            }
          >
            <Table
              bordered
              loading={isFetchingInventories}
              rowKey={(row) => row.inventory_id}
              dataSource={inventoriesByContainer}
              pagination={false}
              columns={[
                {
                  title: "Barcode",
                  dataIndex: "barcode",
                },
                { title: "Description", dataIndex: "description" },
                { title: "Control Number", dataIndex: "control_number" },
                {
                  title: "Status",
                  dataIndex: "status",
                  render: (item) => (
                    <Tag
                      color={item === "SOLD" ? "green" : "red"}
                      bordered={false}
                    >
                      {item}
                    </Tag>
                  ),
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_, inventory: Inventory) => {
                    return (
                      <Space size="middle">
                        <Tooltip placement="top" title="View item">
                          <Button
                            onClick={() =>
                              navigate(
                                `/suppliers/${params.supplier_id}/containers/${params.container_id}/inventory/${inventory.inventory_id}`
                              )
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

export default ContainerProfile;
