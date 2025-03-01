import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePayments, useAuction } from "@context";
import { BidderAuctionItem } from "@types";
import { Button, Input, Skeleton, Space, Table, Tag, Tooltip } from "antd";
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
  const [nextReceiptNumber, setNextReceiptNumber] = useState<string>("1");
  const [dataSource, setDataSource] = useState<BidderAuctionItem[]>(
    bidder?.items || []
  );
  const [searchValue, setSearchValue] = useState<string>("");

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

  useEffect(() => {
    if (!bidder) return;
    let receiptNumber = bidder.receipt_number.split("-");
    if (receiptNumber.length === 1) {
      setNextReceiptNumber(bidder.receipt_number);
    } else {
      setNextReceiptNumber(
        [receiptNumber[0], parseInt(receiptNumber[1], 10) + 1].join("-")
      );
    }
  }, [bidder]);

  if (!bidder) return <Skeleton />;

  return (
    <>
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Bidder Items</h1>

        <div className="flex gap-2">
          <Input
            placeholder="Search by Barcode, Control or Bidder"
            value={searchValue}
            className="w-full"
            onChange={(e) => {
              const currentValue = e.target.value;
              setSearchValue(currentValue);
              const filteredData = bidder.items.filter(
                (item) =>
                  item.barcode.includes(currentValue) ||
                  item.control.includes(currentValue) ||
                  item.description.includes(currentValue.toUpperCase()) ||
                  item.qty.includes(currentValue.toUpperCase()) ||
                  item.price.toString().includes(currentValue.toUpperCase())
              );
              setDataSource(filteredData);
            }}
          />

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
                  state: {
                    action: "invoice",
                    bidder: { ...bidder, receipt_number: nextReceiptNumber },
                    items: bidder.items.filter(
                      (item) => item.status === "UNPAID"
                    ),
                  },
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
        dataSource={searchValue ? dataSource : bidder.items}
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
          {
            title: "Price",
            dataIndex: "price",
            render: (price) => price.toLocaleString(),
          },
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
