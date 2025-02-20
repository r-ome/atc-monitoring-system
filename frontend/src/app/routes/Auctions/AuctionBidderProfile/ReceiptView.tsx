import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePayments } from "@context";
import { AuctionInventory } from "@types";
import { Button, Card, Descriptions, Space, Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { BreadcrumbsType, usePageLayoutProps } from "@layouts/PageLayout";
import { formatNumberToCurrency } from "@lib/utils";
import { useSession } from "app/hooks";

const ReceiptView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const {
    paymentDetails,
    fetchPaymentDetails,
    isLoading: isFetchingPayments,
  } = usePayments();
  const { pageBreadcrumbs, setPageBreadCrumbs } = usePageLayoutProps();
  const [breadcrumbsSession] = useSession<BreadcrumbsType[]>(
    "breadcrumbs",
    pageBreadcrumbs
  );

  useEffect(() => {
    if (!breadcrumbsSession) return;
    if (breadcrumbsSession) {
      setPageBreadCrumbs(breadcrumbsSession);
    }
  }, [setPageBreadCrumbs, breadcrumbsSession]);

  useEffect(() => {
    if (!paymentDetails) return;
    setPageBreadCrumbs((prevBreadcrumbs) => {
      const newBreadcrumb = {
        title: `Transaction`,
        path: `transactions/${paymentDetails.payment_id}`,
      };
      const doesExist = prevBreadcrumbs.find(
        (item) => item.title === newBreadcrumb.title
      );
      if (doesExist) {
        return prevBreadcrumbs;
      }

      const updatedBreadcrumbs = [
        ...prevBreadcrumbs.filter((item) => item.title !== newBreadcrumb.title),
        newBreadcrumb,
      ];
      return updatedBreadcrumbs;
    });
  }, [paymentDetails, setPageBreadCrumbs]);

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
                  <Button type="primary" onClick={() => alert("PRINT RECEIPT")}>
                    Print Receipt
                  </Button>
                ) : null
              }
              title={`Receipt Number: ${paymentDetails.receipt_number}`}
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
                  { title: "Barcode", dataIndex: "barcode_number" },
                  { title: "Control", dataIndex: "control_number" },
                  { title: "Description", dataIndex: "description" },
                  { title: "QTY", dataIndex: "qty" },
                  { title: "Price", dataIndex: "price" },
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
