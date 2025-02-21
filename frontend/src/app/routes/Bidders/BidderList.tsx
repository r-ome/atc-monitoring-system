import { useEffect, useState } from "react";
import { BaseBidder } from "@types";
import { useBidders } from "@context";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input, Space, Table, Tooltip, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { usePageLayoutProps } from "@layouts";
import { formatNumberToCurrency } from "@lib/utils";

const BidderList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    bidders,
    fetchBidders,
    error: ErrorResponse,
    isLoading,
    resetCreateBidderResponse,
  } = useBidders();
  const { openNotification, setPageBreadCrumbs } = usePageLayoutProps();
  const [dataSource, setDataSource] = useState<BaseBidder[]>(bidders);
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    resetCreateBidderResponse();
    setPageBreadCrumbs([{ title: "Bidders List", path: "/bidders" }]);
  }, [setPageBreadCrumbs, resetCreateBidderResponse]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBidders();
    };
    fetchInitialData();
  }, [fetchBidders, location.key]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse && ErrorResponse.httpStatus === 500) {
        openNotification(
          "There might be problems in the server. Please contact your admin.",
          "error",
          "Server Error"
        );
      }
    }
  }, [isLoading, ErrorResponse, openNotification]);

  return (
    <div>
      <div className="flex justify-between my-2">
        <div>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("create")}
          >
            Create Bidder
          </Button>
        </div>
        <div className="w-2/6 my-2 flex gap-4 items-center ">
          <div className="w-2/6 flex justify-end">
            <Typography.Text strong>
              {searchValue ? dataSource.length : bidders.length} Bidders
            </Typography.Text>
          </div>
          <div className="w-4/6">
            <Input
              placeholder="Search by Bidder Number or Name"
              value={searchValue}
              onChange={(e) => {
                const currentValue = e.target.value;
                setSearchValue(currentValue);
                const filteredData = bidders.filter(
                  (item) =>
                    item.bidder_number.includes(currentValue) ||
                    item.full_name.includes(currentValue.toUpperCase())
                );
                setDataSource(filteredData);
              }}
            />
          </div>
        </div>
      </div>

      <Table
        rowKey={(record) => record.bidder_id}
        dataSource={searchValue ? dataSource : bidders}
        columns={[
          {
            title: "Bidder Number",
            dataIndex: "bidder_number",
            width: "15%",
            sorter: (a, b) =>
              parseInt(b.bidder_number, 10) - parseInt(a.bidder_number, 10),
          },
          {
            title: "Full Name",
            dataIndex: "full_name",
            width: "20%",
            sortDirections: ["ascend", "descend"],
            sorter: (a, b) => a.full_name.localeCompare(b.full_name),
          },
          {
            title: "Status",
            dataIndex: "status",
            filters: [
              { text: "BANNED", value: "BANNED" },
              { text: "ACTIVE", value: "ACTIVE" },
              { text: "INACTIVE", value: "INACTIVE" },
            ],
            onFilter: (value, record) =>
              record.status.indexOf(value as string) === 0,
            render: (item) => (
              <span
                className={`${
                  item === "BANNED" ? "text-red-500" : "text-green-500"
                }`}
              >
                {item}
              </span>
            ),
          },
          {
            title: "Registration Fee",
            dataIndex: "registration_fee",
            render: (item) => (item ? formatNumberToCurrency(item) : 0),
          },
          {
            title: "Service Charge",
            dataIndex: "service_charge",
            filters: [
              { text: "Greater than or equal to 10%", value: "greater" },
              { text: "Less than 10%", value: "less" },
            ],
            onFilter: (value, record: any) =>
              value === "less"
                ? record.service_charge < 10
                : record.service_charge >= 10,
            render: (item) => (item ? `${item}%` : "0%"),
          },
          {
            title: "Date Joined",
            dataIndex: "created_at",
            width: "20%",
          },
          {
            title: "Action",
            key: "action",
            width: "10%",
            render: (_, bidder: BaseBidder) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Bidder">
                    <Button
                      onClick={() =>
                        navigate(`/bidders/${bidder.bidder_id}/profile`)
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

export default BidderList;
