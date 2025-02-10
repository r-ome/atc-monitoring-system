import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Table } from "../../../components";
import { useAuction } from "../../../context";
import { useSession } from "../../hooks";
import { AUCTIONS_501 } from "../errors";

const AuctionBidderProfile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [sessionAuction] = useSession<any>("auction", null);
  const {
    bidder,
    fetchBidderAuctionProfile,
    isLoading: isFetchingBidderAuctionProfile,
    errors,
  } = useAuction();

  useEffect(() => {
    const { auction_id: auctionId, bidder_id: bidderId } = params;
    if (!bidder) {
      const fetchInitialData = async () => {
        await fetchBidderAuctionProfile(auctionId!, bidderId!);
      };
      fetchInitialData();
    }
  }, [params.auction_id, params.bidder_id]);

  const renderProfileDetails = (bidder: any) => {
    let bidderDetails = bidder;
    let profileDetails = [];
    for (let key in bidderDetails) {
      let label = key;
      label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
      profileDetails.push({ label, value: bidderDetails[key] });
    }

    return (
      <>
        {profileDetails
          .filter(
            (item) =>
              ![
                "bidder id",
                "auction bidders id",
                "already consumed",
                "bidder number",
                "items",
              ].includes(item.label.toLowerCase())
          )
          .map((item, i) => {
            return (
              <div key={i} className="flex justify-between items-center p-2">
                <div>{item.label}:</div>
                <div className="text-lg font-bold">{item.value}</div>
              </div>
            );
          })}
      </>
    );
  };

  if (errors || !bidder) {
    return (
      <div className="mt-8">
        {errors?.error === AUCTIONS_501 ? (
          <div className="border p-2 rounded border-red-500 mb-10">
            <h1 className="text-red-500 text-xl flex justify-center">
              Please take a look back later...
            </h1>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex h-full gap-2">
        <div className="w-2/6 h-fit border rounded p-4">
          <h1 className="text-3xl font-bold">Bidder {bidder.bidder_number}</h1>
          <div className="flex mt-4">
            <div className="flex-col w-full gap-4">
              {renderProfileDetails(bidder)}
            </div>
          </div>
        </div>
        <div className="w-4/6 border rounded p-4 h-full flex flex-col">
          <div className="flex justify-between mb-4">
            <h1 className="text-3xl font-bold">Bidder Items</h1>
            <Button
              buttonType="primary"
              onClick={
                () => alert("go to payments page")
                // navigate(`/auctions/${sessionAuction.auction_id}/register-bidder`)
              }
            >
              PULL OUT
            </Button>
          </div>
          {!isFetchingBidderAuctionProfile && bidder ? (
            <Table
              data={bidder?.items || []}
              loading={isFetchingBidderAuctionProfile}
              rowKeys={[
                "status",
                "barcode",
                "control",
                "description",
                // "manifest_number",
                "qty",
                "price",
              ]}
              columnHeaders={[
                "status",
                "Barcode",
                "Control",
                "Description",
                // "Manifest Number",
                "QTY",
                "price",
              ]}
            />
          ) : (
            <div className="border p-2 flex justify-center">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionBidderProfile;
