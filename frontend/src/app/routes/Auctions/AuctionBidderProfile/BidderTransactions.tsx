import moment from "moment";
import { useNavigate } from "react-router-dom";
import { usePayments } from "@context";
import { BidderAuctionTransaction } from "@types";
import { Button, Space, Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { formatNumberToCurrency } from "@lib/utils";

const BidderTransactions: React.FC = () => {
  const navigate = useNavigate();
  const { bidderTransactions, isLoading } = usePayments();
  return (
    <>
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Bidder Transactions</h1>
      </div>

      <Table
        rowKey={(rowKey) => rowKey.payment_id}
        dataSource={bidderTransactions}
        loading={isLoading}
        columns={[
          {
            title: "Date",
            dataIndex: "created_at",
            render: (val) =>
              moment(new Date(val)).format("MMMM DD, YYYY hh:mm:ssA"),
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
            title: "Purpose",
            dataIndex: "purpose",
            render: (val) => val.replace("_", " "),
          },
          { title: "Receipt Number", dataIndex: "receipt_number" },
          { title: "Items", dataIndex: "total_items" },
          {
            title: "Action",
            key: "action",
            render: (_, transaction: BidderAuctionTransaction) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Transaction">
                    <Button
                      onClick={() =>
                        navigate(`transactions/${transaction.payment_id}`)
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
    </>
  );
};

export default BidderTransactions;
