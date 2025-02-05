import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Table } from "../../../components";
import { usePayments } from "../../../context";
import { useSession } from "../../hooks";

const AuctionPayments = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [sessionAuction] = useSession<any>("auction", null);
  const {
    payments,
    fetchAuctionPayments,
    isLoading: isFetchingAuctionPayments,
  } = usePayments();

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      if (!auction || auction.auction_id !== auctionId) {
        const fetchInitialData = async () => {
          await fetchAuctionPayments(auctionId);
        };
        fetchInitialData();
      }
    }
    if (sessionAuction) {
      setAuction(sessionAuction);
    }
  }, [params.auction_id, fetchAuctionPayments]);

  return (
    <>
      <div className="h-full">
        <div className="flex flex-col gap-2">
          <div className="w-full border p-4 h-full">
            <div className="flex justify-between items-center w-full p-2">
              <h1 className="text-3xl font-bold">Payments</h1>
              <Button
                buttonType="primary"
                onClick={() =>
                  navigate(`/auctions/${auction.auction_id}/register-bidder`)
                }
              >
                Bidder Pullout
              </Button>
            </div>
            {!isFetchingAuctionPayments && payments ? (
              <Table
                data={payments?.payments || []}
                loading={isFetchingAuctionPayments}
                rowKeys={[
                  "created_at",
                  "bidder_number",
                  // "full_name",
                  "purpose",
                  "amount_paid",
                  "payment_type",
                ]}
                columnHeaders={[
                  "date",
                  "Bidder Number",
                  // "Bidder Name",
                  "Purpose",
                  "Amount",
                  "Payment Type",
                ]}
              />
            ) : (
              <div className="border p-2 flex justify-center">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionPayments;
