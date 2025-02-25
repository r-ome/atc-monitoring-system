import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Typography, Checkbox, Descriptions } from "antd";
import { formatNumberToCurrency } from "@lib/utils";
import { BidderAuctionProfile } from "@types";
import { RHFInputNumber } from "@components";
import { useParams } from "react-router-dom";
import { usePayments } from "@context";

interface PullOutModalProps {
  open: boolean;
  bidder: BidderAuctionProfile;
  onCancel: () => void;
}

const PullOutModal: React.FC<PullOutModalProps> = ({
  open,
  onCancel,
  bidder,
}) => {
  const params = useParams();
  const methods = useForm();
  const { isLoading: isPayingBidderItems, payBidderItems } = usePayments();
  const [isPartialPayment, setIsPartialPayment] = useState<boolean>(false);

  const handlePullOutItems = methods.handleSubmit(async (data) => {
    const { auction_id: auctionId } = params;
    if (bidder) {
      const { auction_bidders_id: auctionBiddersId } = bidder;
      const inventoryIds = bidder?.items
        .filter((item: any) => item.status === "UNPAID")
        .map((item: any) => item.auction_inventory_id);
      if (auctionId) {
        await payBidderItems(
          auctionId,
          auctionBiddersId,
          inventoryIds,
          data.amount_paid
        );
      }
    }
  });

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
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handlePullOutItems}
      confirmLoading={isPayingBidderItems}
      okText="CONFIRM PULLOUT"
      title={<Typography.Title level={3}>COMPUTATION</Typography.Title>}
      width={1000}
      className="w-full"
    >
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-4 bg-gray-100 p-2 rounded">
            <pre className="text-sm">
              Total = Total Item Price + (Total Item Price x Service Charge){" "}
              {bidder.already_consumed ? "" : "- Registration Fee"}
            </pre>
            <pre className="text-sm my-2">
              Total = {formatNumberToCurrency(bidder.total_unpaid_items_price)}{" "}
              + ({formatNumberToCurrency(bidder.total_unpaid_items_price)} x{" "}
              {bidder.service_charge}){" "}
              {bidder.already_consumed ? "" : `- ${bidder.registration_fee}`}
            </pre>
            <pre className="text-sm my-2">
              Total = {formatNumberToCurrency(bidder.total_unpaid_items_price)}{" "}
              +{" "}
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
        </div>

        <div>
          <Typography.Title level={3}>Breakdown</Typography.Title>
          <Descriptions
            bordered
            size="default"
            items={renderDescriptionItems(bidder)}
          ></Descriptions>
        </div>

        {bidder.balance > 0 ? (
          <div className="flex flex-col gap-4">
            <Checkbox onChange={() => setIsPartialPayment(!isPartialPayment)}>
              Partial Payment
            </Checkbox>
            {isPartialPayment ? (
              <div className="w-1/3">
                <Typography.Title level={5}>Amount Paid</Typography.Title>
                <RHFInputNumber
                  control={methods.control}
                  controls={false}
                  addonBefore="₱"
                  addonAfter=".00"
                  name="amount_paid"
                  placeholder="Amount Paid"
                  rules={{
                    required: isPartialPayment
                      ? "This field is required"
                      : false,
                  }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default PullOutModal;
