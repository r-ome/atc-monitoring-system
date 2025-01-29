import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table } from "../../../components";
import { useAuction } from "../../../context";
import { AUCTIONS_403 } from "../errors";

const AuctionProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    auction,
    fetchAuctionDetails,
    isLoading: isFetchingAuctionDetails,
    errors,
  } = useAuction();

  useEffect(() => {
    const { auction_id: auctionId } = location.state.auction;
    if (!auction || auction.auction_id !== auctionId) {
      const fetchInitialData = async () => {
        await fetchAuctionDetails(auctionId);
      };
      fetchInitialData();
    }
  }, [location.state.auction.auction_id, auction]);

  useEffect(() => {
    const currentSessionAuction = sessionStorage.getItem("auction");
    if (auction) {
      if (currentSessionAuction) {
        let parsedSessionAuction = JSON.parse(currentSessionAuction);
        if (parsedSessionAuction.auction_id !== auction.auction_id) {
          sessionStorage.removeItem("auction");
          sessionStorage.setItem("auction", JSON.stringify(auction));
        }
      }
      sessionStorage.setItem("auction", JSON.stringify(auction));
    }
  }, [auction]);

  const renderProfileDetails = (auction: any) => {
    let auctionDetails = auction;
    let profileDetails = [];
    for (let key in auctionDetails) {
      let label = key;
      if (label === "auction_date") label = "Auction Date";
      label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
      profileDetails.push({ label, value: auctionDetails[key] });
    }

    return (
      <>
        {profileDetails.map((item, i) => {
          if (["auction id", "bidders"].includes(item.label.toLowerCase()))
            return;
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

  if (errors && errors.error === AUCTIONS_403) {
    return (
      <>
        <div className="w-full">
          <Button
            buttonType="secondary"
            onClick={() => navigate(-1)}
            className="text-blue-500"
          >
            Go Back
          </Button>
        </div>
        <div className="border p-2 rounded border-red-500 mb-10">
          <h1 className="text-red-500 text-xl flex justify-center">
            We're not able to find the what you're looking for...
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full">
        <Button
          buttonType="secondary"
          onClick={() => navigate(-1)}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>

      {!isFetchingAuctionDetails && auction ? (
        <div className="h-full">
          <div className="flex flex-grow gap-2">
            <div className="w-2/6 border rounded shadow-md p-4 h-full">
              <Button
                buttonType="secondary"
                onClick={() =>
                  navigate(`/auctions/${auction.auction_id}/payments`, {
                    state: { auction },
                  })
                }
                className="text-blue-500"
              >
                Payments
              </Button>
              <h1 className="text-3xl font-bold">{auction?.name}</h1>
              <div className="flex mt-4">
                <div className="flex-col w-full gap-4">
                  {renderProfileDetails(auction)}
                </div>
              </div>
            </div>

            <div className="w-5/6 border p-4 h-full">
              <div className="flex justify-end w-full p-2">
                <Button
                  buttonType="primary"
                  onClick={() =>
                    navigate(`/auctions/${auction.auction_id}/register-bidder`)
                  }
                >
                  Register Bidder
                </Button>
              </div>
              <Table
                data={auction?.bidders || []}
                loading={isFetchingAuctionDetails}
                rowKeys={[
                  "bidder_number",
                  "full_name",
                  "service_charge",
                  "registration_fee",
                ]}
                columnHeaders={[
                  "Bidder Number",
                  "Bidder Name",
                  "Service Charge",
                  "Registration Fee",
                ]}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="border p-2 flex justify-center">Loading...</div>
      )}
    </>
  );
};

export default AuctionProfile;
