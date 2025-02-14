import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, ProfileDetails } from "@components";
import { useAuction, usePayments } from "@context";
import TransactionsTable from "./TransactionsTable";
import BidderItems from "./BidderItems";
import RenderServerError from "../../ServerCrashComponent";

const AuctionBidderProfile = () => {
  const params = useParams();
  const [isTransactionsView, setIsTransactionsView] = useState<boolean>(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] =
    useState<boolean>(false);
  const {
    bidder,
    fetchBidderAuctionProfile,
    error: AuctionErrorResponse,
  } = useAuction();
  const { payment, resetPaymentState, fetchBidderAuctionTransactions } =
    usePayments();

  useEffect(() => {
    const { auction_id: auctionId, bidder_id: bidderId } = params;

    if (bidderId && auctionId) {
      if (!bidder || bidder.bidder_id !== parseInt(bidderId, 10)) {
        const fetchInitialData = async () => {
          await fetchBidderAuctionProfile(auctionId, bidderId);
        };
        console.log("what");
        fetchInitialData();
      }
    }
  }, [params.bidder_id, params.auction_id, fetchBidderAuctionProfile]);

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (bidder && auctionId) {
      const fetchInitialData = async () => {
        await fetchBidderAuctionTransactions(
          auctionId,
          bidder.auction_bidders_id
        );
      };
      console.log("here");
      fetchInitialData();
    }
  }, []);

  useEffect(() => {
    const { auction_id: auctionId, bidder_id: bidderId } = params;
    if (bidderId && auctionId) {
      const fetchInitialData = async () => {
        await fetchBidderAuctionProfile(auctionId, bidderId);
      };

      if (payment) {
        resetPaymentState();
        fetchInitialData();
        setIsPaymentSuccessful(true);
      }
    }
  }, [payment, fetchBidderAuctionProfile]);

  if (AuctionErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...AuctionErrorResponse} />;
  }

  if (!bidder) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex h-full gap-2">
        <div className="w-2/6 h-fit border rounded p-4">
          <div>
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => setIsTransactionsView(!isTransactionsView)}
            >
              {!isTransactionsView ? "View Transactions" : "View Items"}
            </span>
          </div>
          <div className="flex mt-4">
            <div className="flex-col w-full gap-4">
              <ProfileDetails
                title={`Bidder ${bidder?.bidder_number}`}
                profile={bidder}
                excludedProperties={[
                  "auction_bidders_id",
                  "bidder_id",
                  "already_consumed",
                  "bidder_number",
                  "items",
                ]}
              />
            </div>
          </div>
        </div>
        <div className="w-5/6 border rounded p-4 h-full flex flex-col">
          {isTransactionsView ? <TransactionsTable /> : <BidderItems />}
        </div>
      </div>
      <Modal
        isOpen={isPaymentSuccessful}
        title="Payment Successful!"
        setShowModal={setIsPaymentSuccessful}
      ></Modal>
    </div>
  );
};

export default AuctionBidderProfile;
