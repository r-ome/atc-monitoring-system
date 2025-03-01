import { useEffect, useState } from "react";
import moment from "moment";
import { BaseBidder } from "@types";
import { useBidders } from "@context";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input, Space, Table, Tag, Tooltip, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { usePageLayoutProps } from "@layouts";
import { formatNumberToCurrency } from "@lib/utils";
import { useBreadcrumbs } from "app/hooks";

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
  const { openNotification } = usePageLayoutProps();
  const [dataSource, setDataSource] = useState<BaseBidder[]>(bidders);
  const [searchValue, setSearchValue] = useState<string>("");
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    resetCreateBidderResponse();
    setBreadcrumb({ title: "Bidders List", path: "/bidders", level: 1 });
  }, [setBreadcrumb, resetCreateBidderResponse]);

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

                let filteredData = [];

                filteredData = bidders.filter(
                  (bidder) =>
                    bidder.bidder_number.includes(currentValue) ||
                    bidder.full_name.includes(currentValue.toUpperCase()) ||
                    bidder.status.includes(currentValue.toUpperCase())
                );

                if (currentValue.toUpperCase() === "UNPAID") {
                  filteredData = bidders.filter(
                    (bidder) => !!bidder.has_balance
                  );
                }

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
            width: "10%",
            sorter: (a, b) =>
              parseInt(b.bidder_number, 10) - parseInt(a.bidder_number, 10),
          },
          {
            title: "Full Name",
            dataIndex: "full_name",
            width: "25%",
            sortDirections: ["ascend", "descend"],
            sorter: (a, b) => a.full_name.localeCompare(b.full_name),
          },
          {
            title: "Status",
            dataIndex: "status",
            width: "15%",
            filters: [
              { text: "BANNED", value: "BANNED" },
              { text: "ACTIVE", value: "ACTIVE" },
              { text: "INACTIVE", value: "INACTIVE" },
              { text: "UNPAID", value: "UNPAID" },
            ],
            onFilter: (value, record) => {
              if (value === "UNPAID") {
                return record.has_balance !== null;
              } else {
                return record.status.indexOf(value as string) === 0;
              }
            },
            render: (item, record) => {
              let color = "green";
              if (item === "BANNED") color = "red";
              if (item === "INACTIVE") color = "orange";
              return (
                <>
                  <Tag color={color}>{item}</Tag>
                  {record?.has_balance ? (
                    <Tooltip
                      title={`Bidder still has ${formatNumberToCurrency(
                        record?.has_balance?.balance
                      )} UNPAID balance from ${moment(
                        record?.has_balance?.auction_date
                      ).format("MMMM DD, YYYY")}`}
                    >
                      <Tag color="red">UNPAID</Tag>
                    </Tooltip>
                  ) : null}
                </>
              );
            },
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
            render: (value) => moment(value).format("MMMM DD, YYYY"),
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
