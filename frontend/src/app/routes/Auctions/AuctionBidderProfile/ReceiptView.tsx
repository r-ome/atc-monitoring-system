import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePayments } from "@context";
import { AuctionInventory } from "@types";
import { Button, Card, Descriptions, Space, Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { formatNumberToCurrency } from "@lib/utils";
import { useBreadcrumbs } from "app/hooks";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReceiptDocument from "./OfficialReceiptPage/ReceiptDocument";

const ReceiptView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const {
    paymentDetails,
    fetchPaymentDetails,
    isLoading: isFetchingPayments,
  } = usePayments();
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    if (!paymentDetails) return;
    setBreadcrumb({
      title: `Transaction`,
      path: `transactions/${paymentDetails.payment_id}`,
      level: 4,
    });
  }, [paymentDetails, setBreadcrumb]);

  useEffect(() => {
    const { auction_id: auctionId, payment_id: paymentId } = params;
    if (auctionId && paymentId) {
      const fetchInitialData = async () => {
        await fetchPaymentDetails(auctionId, paymentId);
      };
      fetchInitialData();
    }
  }, [params, fetchPaymentDetails]);

  if (!paymentDetails) return null;

  return (
    <div className="w-full">
      <div className="flex h-full gap-2">
        <div className="w-2/6">
          <Card>
            <Descriptions
              size="small"
              layout="vertical"
              bordered
              extra={
                paymentDetails.purpose === "PULL_OUT" ? (
                  <div className="flex gap-4">
                    <div>
                      <PDFDownloadLink
                        document={
                          <ReceiptDocument
                            bidder={paymentDetails}
                            items={paymentDetails.auction_inventories}
                          />
                        }
                        fileName="Test"
                      >
                        {({ loading }) => (
                          <Button type="primary" loading={loading}>
                            Print Receipt
                          </Button>
                        )}
                      </PDFDownloadLink>
                    </div>
                    <div>
                      {/* shit. */}
                      <Button
                        variant="outlined"
                        color="cyan"
                        onClick={() =>
                          navigate("/auctions/receipt", {
                            state: {
                              bidder: paymentDetails,
                              items: paymentDetails.auction_inventories,
                            },
                          })
                        }
                      >
                        View Receipt
                      </Button>
                    </div>
                  </div>
                ) : null
              }
              title={`${paymentDetails.receipt_number}`}
              items={[
                {
                  key: "2",
                  label: "Full Name",
                  span: 3,
                  children: `${paymentDetails.full_name}`,
                },
                {
                  key: "2",
                  label: "Purpose",
                  span: 3,
                  children: `${paymentDetails.purpose.replace("_", " ")}`,
                },
                {
                  key: "1",
                  label: "Amount Paid",
                  span: 3,
                  children: formatNumberToCurrency(paymentDetails.amount_paid),
                },
                {
                  key: "3",
                  label: "Payment Date",
                  span: 3,
                  children: paymentDetails.created_at,
                },
              ]}
            ></Descriptions>
          </Card>
        </div>
        {paymentDetails.auction_inventories ? (
          <div className="w-4/6">
            <Card title={`Receipt ${paymentDetails.receipt_number} items`}>
              <Table
                dataSource={paymentDetails.auction_inventories}
                loading={isFetchingPayments}
                columns={[
                  {
                    title: "Status",
                    dataIndex: "auction_status",
                    render: (item) => (
                      <span
                        className={`${
                          item === "PAID" ? "text-green-500" : " text-red-500"
                        }`}
                      >
                        {item}
                      </span>
                    ),
                  },
                  { title: "Barcode", dataIndex: "barcode" },
                  { title: "Control", dataIndex: "control" },
                  { title: "Description", dataIndex: "description" },
                  { title: "QTY", dataIndex: "qty" },
                  {
                    title: "Price",
                    dataIndex: "price",
                    render: (item) => formatNumberToCurrency(item),
                  },
                  {
                    title: "Action",
                    key: "action",
                    render: (_, transaction: AuctionInventory) => {
                      return (
                        <Space size="middle">
                          <Tooltip placement="top" title="View Item">
                            <Button
                              onClick={() =>
                                navigate(
                                  `/auctions/${params.auction_id}/auction-item/${transaction.auction_inventory_id}`
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
        ) : null}
      </div>
    </div>
  );
};

export default ReceiptView;
