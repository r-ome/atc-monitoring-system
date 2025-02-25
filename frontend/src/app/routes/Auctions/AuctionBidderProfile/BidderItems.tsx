import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePayments, useAuction } from "@context";
import { BidderAuctionItem } from "@types";
import { Button, Skeleton, Space, Table, Tag, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { usePageLayoutProps } from "@layouts/PageLayout";
import PullOutModal from "./PullOutModal";

const BidderItems: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isPullOut, setIsPullOut] = useState<boolean>(false);
  const {
    payment: SuccessResponse,
    isLoading: isPayingBidderItems,
    error: ErrorResponse,
    resetPaymentState,
  } = usePayments();
  const { bidder, isLoading: isFetchingBidderItems } = useAuction();
  const { openNotification } = usePageLayoutProps();

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

      <PullOutModal
        bidder={bidder}
        open={isPullOut}
        onCancel={() => setIsPullOut(false)}
      />

      <Table
        rowKey={(rowKey) => rowKey.auction_inventory_id}
        dataSource={bidder?.items}
        loading={isFetchingBidderItems}
        columns={[
          {
            title: "Status",
            dataIndex: "status",
            width: "10%",
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
          { title: "Barcode", dataIndex: "barcode", width: "15%" },
          { title: "Control", dataIndex: "control", width: "15%" },
          { title: "Description", dataIndex: "description", width: "20%" },
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
