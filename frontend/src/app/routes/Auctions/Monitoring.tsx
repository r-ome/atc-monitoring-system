import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuction, useAuth } from "@context";
import {
  Button,
  Input,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Monitoring as MonitoringType } from "@types";

const MonitoringPage = () => {
  const navigate = useNavigate();
  const {
    monitoring,
    registeredBidders,
    isLoading: isFetchingMonitoring,
  } = useAuction();
  const { user } = useAuth();
  const [dataSource, setDataSource] = useState<MonitoringType[]>(monitoring);
  const [searchValue, setSearchValue] = useState<string>("");

  if (user === null) return <Skeleton />;

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex justify-between items-center">
        <Typography.Title level={2}>Monitoring</Typography.Title>

        <div className="flex items-center justify-end gap-4 w-3/6">
          <div className="w-1/6 justify-end flex">
            <Typography.Text strong>
              {searchValue ? dataSource.length : monitoring.length} Items
            </Typography.Text>
          </div>
          <Input
            placeholder="Search by Barcode, Control or Bidder"
            value={searchValue}
            className="w-3/6"
            onChange={(e) => {
              const currentValue = e.target.value;
              setSearchValue(currentValue);
              const filteredData = monitoring.filter(
                (item) =>
                  item.barcode.includes(currentValue) ||
                  item.control.includes(currentValue) ||
                  item.bidder.bidder_number.includes(currentValue) ||
                  item.description.includes(currentValue.toUpperCase()) ||
                  item.qty.includes(currentValue.toUpperCase()) ||
                  item.price.toString().includes(currentValue.toUpperCase()) ||
                  item.auction_status.includes(currentValue.toUpperCase())
              );
              setDataSource(filteredData);
            }}
          />

          {user && !["ENCODER"].includes(user.role) ? (
            <Button
              color="blue"
              variant="outlined"
              onClick={() => navigate(`add-on`)}
            >
              Additional Item
            </Button>
          ) : null}

          <Button type="primary" onClick={() => navigate(`encode`)}>
            Encode
          </Button>
        </div>
      </div>

      <Table
        rowKey={(rowKey) => rowKey.auction_inventory_id}
        dataSource={searchValue ? dataSource : monitoring}
        loading={isFetchingMonitoring}
        scroll={{ y: 400 }}
        columns={[
          {
            title: "STATUS",
            dataIndex: "inventory_status",
            width: "12%",
            filters: [
              { text: "REBID", value: "REBID" },
              { text: "CANCELLED", value: "CANCELLED" },
              { text: "UNPAID", value: "UNPAID" },
              { text: "PAID", value: "PAID" },
              { text: "SOLD", value: "SOLD" },
              { text: "UNSOLD", value: "UNSOLD" },
            ],
            onFilter: (value, record) =>
              record.inventory_status.indexOf(value as string) === 0 ||
              record.auction_status.indexOf(value as string) === 0,
            render: (item, record) => (
              <>
                <Tag color={`${item === "SOLD" ? "green" : "red"}`}>{item}</Tag>
                <Tag
                  color={`${
                    record.auction_status === "PAID" ? "green" : "red"
                  }`}
                >
                  {record.auction_status}
                </Tag>
              </>
            ),
          },
          { title: "BARCODE", dataIndex: "barcode", width: "8%" },
          {
            title: "CONTROL",
            dataIndex: "control",
            sortDirections: ["ascend", "descend"],
            width: "8%",
            sorter: (a, b) => a.control.localeCompare(b.control),
          },
          { title: "DESCRIPTION", dataIndex: "description", width: "15%" },
          {
            title: "BIDDER",
            width: "8%",
            filters: registeredBidders?.bidders
              .map((item) => ({
                text: item.bidder_number,
                value: item.bidder_number,
              }))
              .sort((a, b) => a.text.localeCompare(b.text)),
            onFilter: (value, record) =>
              record.bidder.bidder_number.indexOf(value as string) === 0,
            render: (_, row) => row.bidder.bidder_number,
          },
          { title: "QTY", dataIndex: "qty", width: "5%" },
          {
            title: "PRICE",
            dataIndex: "price",
            width: "5%",
            sortDirections: ["ascend", "descend"],
            sorter: (a, b) => a.price - b.price,
            render: (price: number) => price.toLocaleString(),
          },
          {
            title: "Manifest",
            dataIndex: "manifest_number",
            width: "5%",
            filters: [
              ...monitoring
                .map((item) => ({
                  text: item.manifest_number,
                  value: item.manifest_number,
                }))
                .filter(
                  (item, index, arr) =>
                    arr.findIndex((v) => v.text === item.text) === index
                )
                .sort((a, b) => a.text.localeCompare(b.text)),
              // { text: "ADD ON", value: "ADD" }, DEFER; TO DO UPDATE "ADD" to "ADD ON"
            ],
            onFilter: (value, record) =>
              record.manifest_number.indexOf(value as string) === 0,
            render: (item) => item.replace("_", " "),
          },
          {
            title: "",
            key: "action",
            width: "5%",
            render: (_, monitoring: MonitoringType) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Item">
                    <Button
                      onClick={() =>
                        navigate(
                          `auction-item/${monitoring.auction_inventory_id}`
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
    </div>
  );
};

export default MonitoringPage;
