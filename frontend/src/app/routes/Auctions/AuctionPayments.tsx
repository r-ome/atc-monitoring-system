import { useEffect, useState } from "react";
import moment from "moment";
import { useParams } from "react-router-dom";
import { usePayments } from "@context";
import { Button, Space, Table, Tooltip, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { formatNumberToCurrency } from "@lib/utils";
import { AuctionPayment } from "@types";

const AuctionPayments = () => {
  const params = useParams();
  const { auctionTransactions, fetchAuctionTransactions, isLoading } =
    usePayments();
  const [dataSource, setDataSource] = useState<AuctionPayment[]>(
    auctionTransactions?.payments || []
  );

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      const fetchInitialData = async () => {
        await fetchAuctionTransactions(auctionId);
      };
      fetchInitialData();
    }
  }, [params, fetchAuctionTransactions]);

  useEffect(() => {
    if (auctionTransactions?.payments) {
      const sortedPayments = auctionTransactions.payments.sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
      );

      setDataSource(sortedPayments);
    }
  }, [auctionTransactions?.payments, setDataSource]);

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <Typography.Title level={2}>Transactions</Typography.Title>

      <Table
        dataSource={dataSource}
        rowKey={(record) => record.payment_id}
        loading={isLoading}
        scroll={{ y: 400 }}
        columns={[
          {
            title: "Payment Date",
            dataIndex: "created_at",
            render: (val) =>
              moment(new Date(val)).format("MMMM DD, YYYY, HH:mm A"),
          },
          {
            title: "Bidder",
            dataIndex: "bidder_number",
          },
          {
            title: "Purpose",
            dataIndex: "purpose",
            filters: [
              { text: "REGISTRATION", value: "REGISTRATION" },
              { text: "REFUNDED", value: "REFUNDED" },
              { text: "PULL OUT", value: "PULL_OUT" },
            ],
            onFilter: (value, record) =>
              record.purpose.indexOf(value as string) === 0,
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
