import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuction } from "@context";
import { Button, Input, Space, Table, Tag, Tooltip, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Monitoring as MonitoringType } from "@types";

const MonitoringPage = () => {
  const navigate = useNavigate();
  const {
    monitoring,
    registeredBidders,
    isLoading: isFetchingMonitoring,
  } = useAuction();
  const [dataSource, setDataSource] = useState<MonitoringType[]>(monitoring);
  const [searchValue, setSearchValue] = useState<string>("");

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
                  item.control_number.includes(currentValue) ||
                  item.bidder.bidder_number.includes(currentValue) ||
                  item.description.includes(currentValue.toUpperCase()) ||
                  item.auction_status.includes(currentValue.toUpperCase())
              );
              setDataSource(filteredData);
            }}
          />
          <Button
            color="blue"
            variant="outlined"
            onClick={() => navigate(`add-on`)}
          >
            Additional Item
          </Button>

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
              { text: "SOLD", value: "SOLD" },
              { text: "UNSOLD", value: "UNSOLD" },
            ],
            onFilter: (value, record) =>
              record.inventory_status.indexOf(value as string) === 0 ||
              record.auction_status.indexOf(value as string) === 0,
            render: (item, record) => (
              <>
                <Tag
                  className={`${
                    item === "SOLD" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {item}
                </Tag>
                <Tag
                  className={`${
                    record.auction_status === "PAID"
                      ? "text-green-500"
                      : "text-red-500"
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
            dataIndex: "control_number",
            sortDirections: ["ascend", "descend"],
            width: "8%",
            sorter: (a, b) => a.control_number.localeCompare(b.control_number),
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
          { title: "PRICE", dataIndex: "price", width: "5%" },
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
