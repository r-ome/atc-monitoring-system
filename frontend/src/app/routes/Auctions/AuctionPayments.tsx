import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table } from "@components";
import { usePayments } from "@context";
import { useSession } from "../../hooks";
import { AuctionDetails } from "@types";

const AuctionPayments = () => {
  const params = useParams();
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [sessionAuction] = useSession<AuctionDetails | null>("auction", null);
  const {
    auctionTransactions,
    fetchAuctionTransactions,
    isLoading: isFetchingAuctionPayments,
  } = usePayments();

  useEffect(() => {
    if (sessionAuction) {
      setAuction(sessionAuction);
    }
  }, [sessionAuction]);

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      if (!auction || auction.auction_id !== parseInt(auctionId, 10)) {
        const fetchInitialData = async () => {
          await fetchAuctionTransactions(auctionId);
        };
        fetchInitialData();
      }
    }
  }, [params.auction_id, auction?.auction_id, fetchAuctionTransactions]);

  if (isFetchingAuctionPayments || !auctionTransactions) {
    return <div className="border p-2 flex justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="h-full">
        <div className="flex flex-col gap-2">
          <div className="w-full border p-4 h-full">
            <div className="flex justify-between items-center w-full p-2">
              <h1 className="text-3xl font-bold">Payments</h1>
            </div>
            <Table
              data={auctionTransactions?.payments || []}
              loading={isFetchingAuctionPayments}
              rowKeys={[
                "created_at",
                "bidder_number",
                "purpose",
                "amount_paid",
                "payment_type",
              ]}
              columnHeaders={[
                "date",
                "Bidder Number",
                "Purpose",
                "Amount Paid",
                "Payment Type",
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionPayments;
