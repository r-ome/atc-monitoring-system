import { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { usePayments } from "@context";
import { AuctionInventory } from "@types";
import { Button, Card, Descriptions, Space, Table, Tag, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { formatNumberToCurrency } from "@lib/utils";
import { useBreadcrumbs } from "app/hooks";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BidderInvoiceDocument from "./OfficialReceiptPage/BidderInvoiceDocument";
import BidderRefundDocument from "./RefundReceiptPage/RefundDocument";
import RefundRegistrationModal from "./RefundRegistrationModal";
import SettlePaymentModal from "./SettlePaymentModal";

const BidderTransaction = () => {
  const params = useParams();
  const navigate = useNavigate();
  const {
    paymentDetails,
    bidderTransactions,
    fetchPaymentDetails,
    fetchBidderAuctionTransactions,
    isLoading: isFetchingPayments,
  } = usePayments();
  const [isRefundRegistrationModalOpen, setRefundRegistrationModalOpen] =
    useState<boolean>(false);
  const [settlePaymentModal, setSettlePaymentModal] = useState<boolean>(false);
  const [isPaymentSettlted, setIsPaymentSettled] = useState<boolean>(false);
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

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId && paymentDetails) {
      const fetchInitialData = async () => {
        await fetchBidderAuctionTransactions(
          auctionId,
          paymentDetails?.auction_bidders_id
        );
      };
      fetchInitialData();
    }
  }, [fetchBidderAuctionTransactions, paymentDetails, params]);

  useEffect(() => {
    if (!bidderTransactions.length || !paymentDetails) return;

    const settled = bidderTransactions.find(
      (transaction) =>
        transaction.receipt_number === paymentDetails.receipt_number &&
        transaction.purpose === "PULL_OUT"
    );

    setIsPaymentSettled(!!settled);
  }, [bidderTransactions, paymentDetails]);

  if (!paymentDetails || !bidderTransactions.length) return null;

  // const Document =
  //   paymentDetails.purpose === "REFUNDED" ? (
  //     <BidderRefundDocument
  //       bidder={paymentDetails}
  //       items={paymentDetails.auction_inventories}
  //     />
  //   ) : (

  //   );

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
                <>
                  {paymentDetails.purpose === "PULL_OUT" ||
                  (isPaymentSettlted &&
                    paymentDetails.purpose !== "REGISTRATION") ? (
                    <div className="flex gap-4">
                      {paymentDetails.purpose !== "REFUNDED" ? (
                        <PDFDownloadLink
                          fileName="Test"
                          document={
                            <BidderRefundDocument
                              bidder={paymentDetails}
                              items={paymentDetails.auction_inventories}
                            />
                          }
                        >
                          {({ loading }) => (
                            <Button type="primary" loading={loading}>
                              Print Receipt
                            </Button>
                          )}
                        </PDFDownloadLink>
                      ) : (
                        <PDFDownloadLink
                          fileName="Test"
                          document={
                            <BidderInvoiceDocument
                              bidder={paymentDetails}
                              items={paymentDetails.auction_inventories}
                            />
                          }
                        >
                          {({ loading }) => (
                            <Button type="primary" loading={loading}>
                              Print Receipt
                            </Button>
                          )}
                        </PDFDownloadLink>
                      )}

                      <div>
                        <Button
                          variant="outlined"
                          color="cyan"
                          onClick={() =>
                            navigate("/auctions/receipt", {
                              state: {
                                action:
                                  paymentDetails.purpose === "REFUNDED"
                                    ? "refund"
                                    : "invoice",
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
                  ) : null}

                  {paymentDetails.purpose === "REGISTRATION" &&
                  !paymentDetails.already_consumed ? (
                    <Button
                      color="red"
                      variant="outlined"
                      onClick={() => setRefundRegistrationModalOpen(true)}
                    >
                      REFUND Registration Fee
                    </Button>
                  ) : null}

                  {paymentDetails.purpose === "PARTIAL" &&
                  !isPaymentSettlted ? (
                    <Button
                      color="orange"
                      variant="outlined"
                      onClick={() => setSettlePaymentModal(true)}
                    >
                      Settle Payment
                    </Button>
                  ) : null}
                </>
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
                  children: moment(
                    new Date(paymentDetails.payment_date)
                  ).format("MMMM DD, YYYY HH:mm:ssA"),
                },
              ]}
            ></Descriptions>
          </Card>
        </div>

        {paymentDetails.auction_inventories ? (
          <div className="w-4/6">
            <Card title={`Receipt ${paymentDetails.receipt_number} items`}>
              <Table
                rowKey={(row) => row.auction_inventory_id}
                dataSource={paymentDetails.auction_inventories}
                loading={isFetchingPayments}
                columns={[
                  {
                    title: "Status",
                    dataIndex: "auction_status",
                    render: (item) => {
                      let color = "green";
                      if (item === "PAID") color = "green";
                      if (item === "PARTIAL") color = "orange";
                      if (["CANCELLED", "UNPAID"].includes(item)) color = "red";
                      return (
                        <Tag color={color} bordered={false}>
                          {item}
                        </Tag>
                      );
                    },
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

      {isRefundRegistrationModalOpen ? (
        <RefundRegistrationModal
          open={isRefundRegistrationModalOpen}
          onCancel={() => setRefundRegistrationModalOpen(false)}
          paymentDetails={paymentDetails}
        />
      ) : null}

      {settlePaymentModal ? (
        <SettlePaymentModal
          open={settlePaymentModal}
          onCancel={() => setSettlePaymentModal(false)}
          paymentDetails={paymentDetails}
        />
      ) : null}
    </div>
  );
};

export default BidderTransaction;
