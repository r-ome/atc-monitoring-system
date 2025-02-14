import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Table } from "@components";
import { convertToNumber, formatNumberToCurrency } from "@lib/utils";
import { usePayments, useAuction } from "@context";

const BidderItems: React.FC = () => {
  const params = useParams();
  const [isPullOut, setIsPullOut] = useState<boolean>(false);
  const { isLoading: isPayingBidderItems, payBidderItems } = usePayments();
  const { bidder, isLoading } = useAuction();

  const handlePullOutItems = async () => {
    const { auction_id: auctionId } = params;
    if (bidder) {
      const { auction_bidders_id: auctionBiddersId } = bidder;
      const inventoryIds = bidder?.items
        .filter((item: any) => item.status === "UNPAID")
        .map((item: any) => item.auction_inventory_id);
      if (auctionId) {
        if (bidder) {
          await payBidderItems(auctionId, auctionBiddersId, inventoryIds);
        }
      }
    }
  };

  const renderPullOutTable = (bidder: any) => {
    const total = { label: "Total", value: bidder.balance };
    let tableData = [
      { label: "Total Items", value: bidder.total_unpaid_items + " items" },
      { label: "Total Item Price", value: bidder.total_unpaid_items_price },
      { label: "Service Charge", value: bidder.service_charge },
    ];

    if (!bidder.already_consumed) {
      const registration = {
        label: "Registration Fee",
        value: bidder.registration_fee,
      };
      tableData = [...tableData, registration, total];
    } else {
      tableData = [...tableData, total];
    }

    return tableData.map((item: any, i: number) => (
      <tr
        key={i}
        className={`text-2xl ${
          item.label === "Registration Fee"
            ? bidder.already_consumed
              ? "line-through"
              : ""
            : ""
        }`}
      >
        <td className="border flex justify-end pr-2">{item.label}</td>
        <td className="border border-gray-300 pl-4">{item.value}</td>
      </tr>
    ));
  };

  if (isPayingBidderItems || !bidder) {
    return <div className="border p-2 flex justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Bidder Items</h1>

        {parseInt(bidder.total_unpaid_items, 10) ? (
          <Button buttonType="primary" onClick={() => setIsPullOut(!isPullOut)}>
            {isPullOut ? "View Items" : "PULL OUT"}
          </Button>
        ) : null}
      </div>

      {isPullOut ? (
        <div>
          <div className="text-xl mb-2">Computation:</div>
          <div className="mb-4 bg-gray-100 p-2 rounded">
            <pre className="text-sm">
              Total = Total Item Price + (Total Item Price * Service Charge){" "}
              {bidder.already_consumed ? "" : "- Registration Fee"}
            </pre>
            <pre className="text-sm my-2">
              Total = {bidder.total_unpaid_items_price} + (
              {bidder.total_unpaid_items_price} * {bidder.service_charge}){" "}
              {bidder.already_consumed ? "" : `- ${bidder.registration_fee}`}
            </pre>
            <pre className="text-sm my-2">
              Total = {bidder.total_unpaid_items_price} +{" "}
              {formatNumberToCurrency(
                (convertToNumber(bidder.total_unpaid_items_price) *
                  convertToNumber(bidder.service_charge)) /
                  100
              )}{" "}
              {bidder.already_consumed ? "" : `- ${bidder.registration_fee}`}
            </pre>
            <pre className="text-sm">Total = {bidder?.balance}</pre>
          </div>
          <table className="border-separate border w-full border-gray-400">
            <tbody>{renderPullOutTable(bidder)}</tbody>
          </table>
          <div className="flex justify-center pt-4">
            <Button onClick={handlePullOutItems}>CONFIRM PULL OUT</Button>
          </div>
        </div>
      ) : (
        <Table
          data={
            bidder?.items.sort((a: any, b: any) => {
              return +new Date(b.updated_at) - +new Date(a.updated_at);
            }) || []
          }
          loading={isLoading}
          hasCount
          rowKeys={[
            "status",
            "barcode",
            "control",
            "description",
            "qty",
            "price",
          ]}
          columnHeaders={[
            "status",
            "Barcode",
            "Control",
            "Description",
            "QTY",
            "price",
          ]}
        />
      )}
    </>
  );
};

export default BidderItems;
