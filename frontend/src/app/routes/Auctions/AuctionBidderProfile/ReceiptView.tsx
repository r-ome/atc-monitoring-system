import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, ProfileDetails, Table } from "@components";
import { useAuction, usePayments } from "@context";
import { AuctionInventory } from "@types";
import ItemProfile from "./ItemProfile";
import RenderServerError from "../../ServerCrashComponent";

const ReceiptView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [auctionInventory, setAuctionInventory] =
    useState<AuctionInventory | null>(null);
  const {
    paymentDetails,
    fetchPaymentDetails,
    isLoading: isFetchingPayments,
    error: ErrorResponse,
  } = usePayments();
  const { cancelItem, cancelItemResponse } = useAuction();

  useEffect(() => {
    const { auction_id: auctionId, payment_id: paymentId } = params;
    if (auctionId && paymentId) {
      const fetchInitialData = async () => {
        await fetchPaymentDetails(auctionId, paymentId);
      };
      fetchInitialData();
    }
  }, [params, fetchPaymentDetails]);

  // TO DO
  // handle cancel item
  // useEffect(() => {

  // }, [cancelItemResponse])

  if (isFetchingPayments || !paymentDetails) {
    return <div className="text-3xl flex justify-center">Loading...</div>;
  }

  if (ErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ErrorResponse} />;
  }

  return (
    <div className="w-full">
      <div className="flex h-full gap-2">
        <div className="w-2/6 h-fit border rounded p-4">
          <div className="flex justify-between gap-4">
            <Button
              buttonType="secondary"
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              buttonType="primary"
              className="text-blue-500 cursor-pointer"
              onClick={() => console.log("PRINT RECEIPT")}
            >
              Print Receipt
            </Button>
          </div>

          <div className="flex mt-4">
            <div className="flex-col w-full gap-4">
              <ProfileDetails
                title={`Receipt Number: ${paymentDetails.receipt_number}`}
                profile={paymentDetails}
                excludedProperties={[
                  "payment_id",
                  "purpose",
                  "already_consumed",
                  "auction_inventories",
                ]}
              />
            </div>
          </div>
        </div>

        <div className="w-5/6 border rounded p-4 h-full flex flex-col">
          {auctionInventory ? (
            <ItemProfile
              auctionInventory={auctionInventory}
              setAuctionInventory={setAuctionInventory}
            />
          ) : (
            <Table
              data={paymentDetails.auction_inventories}
              loading={isFetchingPayments}
              onRowClick={(row: AuctionInventory) => setAuctionInventory(row)}
              rowKeys={[
                "barcode_number",
                "control_number",
                "description",
                "qty",
                "price",
              ]}
              columnHeaders={[
                "Barcode",
                "control #",
                "Description",
                "qty",
                "price",
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
