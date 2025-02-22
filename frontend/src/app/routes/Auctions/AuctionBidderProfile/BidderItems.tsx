import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatNumberToCurrency } from "@lib/utils";
import { usePayments, useAuction } from "@context";
import { BidderAuctionItem, BidderAuctionProfile } from "@types";
import {
  Button,
  Descriptions,
  Modal,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { usePageLayoutProps } from "@layouts/PageLayout";

const BidderItems: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isPullOut, setIsPullOut] = useState<boolean>(false);
  const {
    payment: SuccessResponse,
    isLoading: isPayingBidderItems,
    payBidderItems,
    error: ErrorResponse,
    resetPaymentState,
  } = usePayments();
  const { bidder, isLoading: isFetchingBidderItems } = useAuction();
  const { openNotification } = usePageLayoutProps();

  const handlePullOutItems = async () => {
    const { auction_id: auctionId } = params;
    if (bidder) {
      const { auction_bidders_id: auctionBiddersId } = bidder;
      const inventoryIds = bidder?.items
        .filter((item: any) => item.status === "UNPAID")
        .map((item: any) => item.auction_inventory_id);
      if (auctionId) {
        await payBidderItems(auctionId, auctionBiddersId, inventoryIds);
      }
    }
  };

  useEffect(() => {
    if (ErrorResponse && !isPayingBidderItems) {
      openNotification("Error with Payment", "error", "Error");
    }

    if (SuccessResponse && !isPayingBidderItems) {
      openNotification("Successfully handled Payment!");
      setIsPullOut(false);
      resetPaymentState();
    }
  }, [
    ErrorResponse,
    SuccessResponse,
    isPayingBidderItems,
    openNotification,
    resetPaymentState,
    setIsPullOut,
  ]);

  if (!bidder) return <Skeleton />;

  const renderDescriptionItems = (bidder: BidderAuctionProfile) => {
    const items = [
      {
        label: "Total Number of Items",
        children: `${bidder.total_unpaid_items} items`,
        span: 3,
      },
      {
        label: "Total Item Price",
        children: formatNumberToCurrency(bidder.total_unpaid_items_price),
        span: 3,
      },
      {
        label: "Registration Fee",
        children: formatNumberToCurrency(bidder.registration_fee),
        span: 3,
      },
      {
        label: "Service Charge",
        children: bidder.service_charge,
        span: 3,
      },
      {
        label: "Total",
        children: (
          <Typography.Title className="font-bold" level={5}>
            {formatNumberToCurrency(bidder.balance)}
          </Typography.Title>
        ),
        span: 3,
      },
    ];

    return bidder.already_consumed
      ? [...items.slice(0, 2), ...items.slice(2 + 1)]
      : items;
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Bidder Items</h1>

        <div className="flex gap-2">
          {parseInt(bidder.total_unpaid_items, 10) ? (
            <Button type="primary" onClick={() => setIsPullOut(!isPullOut)}>
              Pull Out
            </Button>
          ) : null}

          {parseInt(bidder.total_unpaid_items, 10) ? (
            <Button
              variant="outlined"
              color="cyan"
              onClick={() =>
                navigate("/auctions/receipt", {
                  state: { bidder, items: bidder.items },
                })
              }
            >
              View Receipt
            </Button>
          ) : null}
        </div>
      </div>

      <Modal
        open={isPullOut}
        onCancel={() => setIsPullOut(false)}
        onOk={handlePullOutItems}
        confirmLoading={isPayingBidderItems}
        okText="CONFIRM PULLOUT"
        title={<Typography.Title level={3}>COMPUTATION</Typography.Title>}
        width={1000}
        className="w-full"
      >
        <div className="mb-4 bg-gray-100 p-2 rounded">
          <pre className="text-sm">
            Total = Total Item Price + (Total Item Price x Service Charge){" "}
            {bidder.already_consumed ? "" : "- Registration Fee"}
          </pre>
          <pre className="text-sm my-2">
            Total = {formatNumberToCurrency(bidder.total_unpaid_items_price)} +
            ({formatNumberToCurrency(bidder.total_unpaid_items_price)} x{" "}
            {bidder.service_charge}){" "}
            {bidder.already_consumed ? "" : `- ${bidder.registration_fee}`}
          </pre>
          <pre className="text-sm my-2">
            Total = {formatNumberToCurrency(bidder.total_unpaid_items_price)} +{" "}
            {formatNumberToCurrency(
              (parseInt(bidder.total_unpaid_items_price, 10) *
                parseInt(bidder.service_charge, 10)) /
                100
            )}{" "}
            {bidder.already_consumed ? "" : `- ${bidder.registration_fee}`}
          </pre>
          <pre className="text-sm">
            Total = {formatNumberToCurrency(bidder?.balance)}
          </pre>
        </div>

        <Typography.Title level={3}>Breakdown</Typography.Title>
        <Descriptions
          bordered
          size="default"
          items={renderDescriptionItems(bidder)}
        ></Descriptions>
      </Modal>

      <Table
        rowKey={(rowKey) => rowKey.auction_inventory_id}
        dataSource={bidder?.items}
        loading={isFetchingBidderItems}
        columns={[
          {
            title: "Status",
            dataIndex: "status",
            render: (item) => (
              <Tag color={item === "PAID" ? "green" : "red"} bordered={false}>
                {item}
              </Tag>
            ),
          },
          { title: "Barcode", dataIndex: "barcode" },
          { title: "Control", dataIndex: "control" },
          { title: "Description", dataIndex: "description" },
          { title: "QTY", dataIndex: "qty" },
          { title: "Price", dataIndex: "price" },
          {
            title: "Action",
            key: "action",
            render: (_, auctionItem: BidderAuctionItem) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Item">
                    <Button
                      onClick={() =>
                        navigate(
                          `/auctions/${params.auction_id}/auction-item/${auctionItem.auction_inventory_id}`
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
    </>
  );
};

export default BidderItems;
