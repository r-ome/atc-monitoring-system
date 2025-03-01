import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuction } from "@context";
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
import RegisterBidderModal from "./RegisterBidder";
import { EyeOutlined } from "@ant-design/icons";
import { formatNumberToCurrency } from "@lib/utils";
import { RegisterBidderResponse } from "@types";

const AuctionBidders = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [isRegisterModalOpen, setIsRegisterModalOpen] =
    useState<boolean>(false);
  const { registeredBidders } = useAuction();
  const [dataSource, setDataSource] = useState<RegisterBidderResponse[]>(
    registeredBidders?.bidders || []
  );
  const [searchValue, setSearchValue] = useState<string>("");

  if (!registeredBidders) return <Skeleton />;

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex justify-between items-center">
        <Typography.Title level={2}>Registered Bidders</Typography.Title>

        <div className="flex gap-4">
          <Input
            placeholder="Search by Bidder or Full Name"
            value={searchValue}
            onChange={(e) => {
              const currentValue = e.target.value;
              setSearchValue(currentValue);
              const filteredData = registeredBidders.bidders.filter(
                (item) =>
                  item.bidder_number.includes(currentValue) ||
                  item.full_name.includes(currentValue.toUpperCase())
              );
              setDataSource(filteredData);
            }}
          />
          <Button type="primary" onClick={() => setIsRegisterModalOpen(true)}>
            Register Bidder
          </Button>
        </div>
      </div>

      <Table
        rowKey={(record) => record.bidder_id}
        dataSource={searchValue ? dataSource : registeredBidders.bidders}
        scroll={{ y: 400 }}
        columns={[
          {
            title: "Bidder Number",
            dataIndex: "bidder_number",
            width: "15%",
            render: (value, record) => {
              return (
                <div className="flex gap-2">
                  {record?.remarks ? (
                    <Tag color="red">{record?.remarks}</Tag>
                  ) : null}
                  {value}
                </div>
              );
            },
          },
          {
            title: "Full Name",
            dataIndex: "full_name",
          },
          {
            title: "Service Charge",
            dataIndex: "service_charge",
            render: (item) => <span>{item}%</span>,
          },
          {
            title: "Registration Fee",
            dataIndex: "registration_fee",
            render: (item) => formatNumberToCurrency(item),
          },
          {
            title: "Total Items",
            dataIndex: "total_items",
          },
          {
            title: "Balance",
            dataIndex: "balance",
            filters: [{ text: "Has Balance", value: "greater" }],
            onFilter: (value, record) => {
              if (value === "greater") {
                return record.balance > 0;
              } else {
                return record.balance < 0;
              }
            },
            render: (item) => (
              <span
                className={`${
                  parseInt(item, 10) > 0 ? "text-red-500" : "text-green-500"
                }`}
              >
                {item < 0
                  ? `(${formatNumberToCurrency(
                      item.toString().replace("-", "")
                    )})`
                  : formatNumberToCurrency(item)}
              </span>
            ),
          },
          {
            title: "Action",
            key: "action",
            render: (_, bidder) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Bidder">
                    <Button
                      onClick={() =>
                        navigate(
                          `/auctions/${params.auction_id}/bidders/${bidder.bidder_id}`
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

      <RegisterBidderModal
        open={isRegisterModalOpen}
        onCancel={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};

export default AuctionBidders;
