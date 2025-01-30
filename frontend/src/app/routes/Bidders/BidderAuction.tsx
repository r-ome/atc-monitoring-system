import { useEffect, useState } from "react";
import { Modal, Input, Button, Table } from "../../../components";
import { useAuction, useBidders } from "../../../context";
import { useNavigate, useLocation } from "react-router-dom";
import { formatNumberToCurrency } from "../../../lib/utils";
import moment from "moment";

const BidderAuction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auctionItems, isLoading, getAuctionItems } = useBidders();
  const { payment, isLoading: isPaymentLoading, payBidderItems } = useAuction();
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(auctionItems.totalBalance);

  useEffect(() => {
    const fetchBidderAuctionItems = async () => {
      await getAuctionItems(location.state.auctionId, location.state.bidderId);
    };

    fetchBidderAuctionItems();
  }, []);

  useEffect(() => {
    if (payment && !isPaymentLoading) {
      setShowPaymentModal(false);
    }
  }, [payment, isPaymentLoading]);

  useEffect(() => {
    setAmount(auctionItems.totalBalance);
  }, [auctionItems.totalBalance]);

  const handleSubmitPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const unpaidItems = auctionItems.data
      .filter((item) => item.auction_status === "UNPAID")
      .map((item) => item.inventory_id);
    const auctionId = location.state.auctionId;
    const bidderId = location.state.bidderId;
    await payBidderItems(auctionId, bidderId, amount, unpaidItems);
  };

  return (
    <div>
      <div className="w-full">
        <Button
          buttonType="secondary"
          onClick={() => navigate(-1)}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>

      <div className="flex justify-between my-2 items-center">
        <h1 className="text-3xl">
          {moment(auctionItems?.auction).format("MMMM DD, YYYY")} <br />
          <span className="font-bold">
            {auctionItems.bidderNumber} - {auctionItems.bidderName}
          </span>{" "}
          <br />
          BALANCE:{" "}
          <span
            className={`font-bold ${
              auctionItems.totalBalance > 0 ? "text-red-500" : ""
            } `}
          >
            {formatNumberToCurrency(auctionItems.totalBalance)}
          </span>
          <br />
          PAID ITEMS: {auctionItems.paidItems}
          <br />
          UNPAID ITEMS: {auctionItems.unpaidItems}
        </h1>
        <div>
          <Button
            buttonType="primary"
            className="w-40"
            onClick={() => setShowPaymentModal(true)}
            disabled={!auctionItems.unpaidItems}
          >
            PAY
          </Button>
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold p-2 mb-2"></div>
        <Table
          data={auctionItems?.data || []}
          loading={isLoading}
          columnHeaders={[
            "barcode",
            "control number",
            "description",
            "price",
            "qty",
            "status",
          ]}
          rowKeys={[
            "barcode_number",
            "control_number",
            "description",
            "price",
            "qty",
            "auction_status",
          ]}
        ></Table>
      </div>

      <Modal
        isOpen={showPaymentModal}
        title="ARE YOU SURE?"
        setShowModal={() => setShowPaymentModal(false)}
      >
        <>
          <form id="payment" onSubmit={handleSubmitPayment}>
            <div className="h-full w-full font-bold text-3xl">
              <div className="">
                {auctionItems.bidderNumber} - {auctionItems.bidderName}
              </div>
              <div className="my-4">
                No. of items: {auctionItems.unpaidItems}
              </div>
              <div className="my-4">
                Amount to Pay:{" "}
                {formatNumberToCurrency(auctionItems.totalBalance)}
              </div>
              <br />

              <Input
                id="amount"
                name="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                placeholder="Amount"
                label="Amount:"
              />
            </div>

            <div className="flex justify-between gap-2">
              <Button
                buttonType="secondary"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button
                buttonType="primary"
                type="submit"
                className="w-32"
                disabled={!amount}
              >
                Pay
              </Button>
            </div>
          </form>
        </>
      </Modal>
    </div>
  );
};

export default BidderAuction;
