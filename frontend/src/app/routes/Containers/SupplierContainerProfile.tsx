import { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { useContainers, useInventories } from "@context";
import { useBreadcrumbs } from "../../hooks";
import { Inventory } from "@types";
import { usePageLayoutProps } from "@layouts";
import {
  Button,
  Card,
  Descriptions,
  Input,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { CONTAINERS_403, INVENTORIES_403 } from "../errors";
import { formatNumberToCurrency } from "@lib/utils";

const SupplierContainerProfile = () => {
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
  const [dataSource, setDataSource] = useState<Inventory[]>(
    inventoriesByContainer || []
  );
  const [searchValue, setSearchValue] = useState<string>("");
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
    const { container_id: containerId } = params;
    if (containerId) {
      const fetchInitialData = async () => {
        await fetchContainer(containerId);
        await fetchInventoriesByContainer(containerId);
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

  const formatDate = (date: string) =>
    moment(new Date(date)).format("MMMM DD, YYYY");

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
                title={
                  <>
                    <Tag
                      color={`${
                        container.auction_or_sell === "AUCTION"
                          ? "green"
                          : "blue"
                      }`}
                    >
                      {container.auction_or_sell}
                    </Tag>
                    Container {container.barcode}
                  </>
                }
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
                    label: (
                      <>
                        Total{" "}
                        <span className="font-bold text-green-500">SOLD</span>{" "}
                        items Price
                      </>
                    ),
                    span: 2,
                    children: formatNumberToCurrency(
                      container.total_sold_item_price
                    ),
                  },
                  {
                    key: "21",
                    label: (
                      <>
                        <span className="text-green-500 font-bold">SOLD</span>{" "}
                        items
                      </>
                    ),
                    span: 2,
                    children: container.sold_items,
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
                    children: formatDate(container.departure_date_from_japan),
                  },
                  {
                    key: "8",
                    label: "ETA to PH",
                    span: 1,
                    children: formatDate(container.eta_to_ph),
                  },
                  {
                    key: "9",
                    label: "Arrival date to PH Warehouse",
                    span: 4,
                    children: formatDate(container.arrival_date_warehouse_ph),
                  },
                  {
                    key: "10",
                    label: "Sorting Date",
                    span: 2,
                    children: formatDate(container.sorting_date),
                  },
                  {
                    key: "11",
                    label: "Auction Date",
                    span: 2,
                    children: formatDate(container.auction_date),
                  },
                  {
                    key: "12",
                    label: "Payment Date",
                    span: 2,
                    children: formatDate(container.payment_date),
                  },
                  {
                    key: "13",
                    label: "Telegraphic Transferred",
                    span: 2,
                    children: formatDate(container.telegraphic_transferred),
                  },
                  {
                    key: "14",
                    label: "Vanning Date",
                    span: 2,
                    children: formatDate(container.vanning_date),
                  },
                  {
                    key: "15",
                    label: "Devanning Date",
                    span: 2,
                    children: formatDate(container.devanning_date),
                  },
                  {
                    key: "17",
                    label: "Gross Weight",
                    span: 2,
                    children: container.gross_weight,
                  },
                  {
                    key: "19",
                    label: "Date Added",
                    span: 4,
                    children: formatDate(container.created_at),
                  },
                ]}
              ></Descriptions>
            </Card>
          </div>

          <Card
            className="w-4/6 py-4 max-h-[875px]"
            title={
              <div className="flex justify-between items-center w-full p-2">
                <h1 className="text-3xl font-bold">
                  Inventories ({inventoriesByContainer.length} items)
                </h1>
                <div className="flex justify-end gap-2">
                  <Input
                    placeholder="Search by Barcode, Control or Bidder"
                    value={searchValue}
                    className="w-3/6"
                    onChange={(e) => {
                      const currentValue = e.target.value;
                      setSearchValue(currentValue);
                      const filteredData = inventoriesByContainer.filter(
                        (item) =>
                          item.barcode.includes(currentValue) ||
                          item.control.includes(currentValue) ||
                          item.description.includes(
                            currentValue.toUpperCase()
                          ) ||
                          item.price
                            .toString()
                            .includes(currentValue.toUpperCase())
                      );
                      setDataSource(filteredData);
                    }}
                  />
                  <Button
                    type="primary"
                    onClick={() => navigate("inventory/create")}
                  >
                    Add Inventory
                  </Button>
                </div>
              </div>
            }
          >
            <Table
              loading={isFetchingInventories}
              rowKey={(row) => row.inventory_id}
              dataSource={searchValue ? dataSource : inventoriesByContainer}
              columns={[
                {
                  title: "Status",
                  dataIndex: "status",
                  width: "10%",
                  filters: [
                    { text: "REBID", value: "REBID" },
                    { text: "SOLD", value: "SOLD" },
                    { text: "VOID", value: "VOID" },
                    { text: "UNSOLD", value: "UNSOLD" },
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
                  render: (val) => <>{val ? val : 0}</>,
                },
                {
                  title: "Action",
                  key: "action",
                  width: "10%",
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

export default SupplierContainerProfile;
