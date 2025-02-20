import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePayments } from "@context";
import { Button, Space, Table, Tooltip, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { formatNumberToCurrency } from "@lib/utils";

const AuctionPayments = () => {
  const params = useParams();
  const { auctionTransactions, fetchAuctionTransactions, isLoading } =
    usePayments();

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      const fetchInitialData = async () => {
        await fetchAuctionTransactions(auctionId);
      };
      fetchInitialData();
    }
  }, [params, fetchAuctionTransactions]);

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <Typography.Title level={2}>Transactions</Typography.Title>

      <Table
        dataSource={auctionTransactions?.payments || []}
        rowKey={(record) => record.payment_id}
        loading={isLoading}
        columns={[
          {
            title: "Payment Date",
            dataIndex: "created_at",
          },
          {
            title: "Bidder",
            dataIndex: "bidder_number",
          },
          {
            title: "Purpose",
            dataIndex: "purpose",
            render: (item) => item.replace("_", " "),
          },
          {
            title: "Amount Paid",
            dataIndex: "amount_paid",
            render: (item) => (
              <span
                className={`${
                  parseInt(item, 10) < 0 ? "text-red-500" : "text-green-500"
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
            title: "Payment Type",
            dataIndex: "payment_type",
          },
          {
            title: "Action",
            key: "action",
            render: (transaction) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Transaction">
                    <Button onClick={() => alert("GO TO TRANSACTION DETAILS")}>
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

export default AuctionPayments;
