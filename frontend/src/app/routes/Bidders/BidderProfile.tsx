import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table } from "../../../components";
import { useBidderRequirement, useBidders } from "../../../context";

const BidderProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bidder, isLoading: isFetchingBidder, fetchBidder } = useBidders();

  useEffect(() => {
    const { bidder_id: bidderId } = location.state.bidder;
    if (!bidder || bidder.bidder_id !== bidderId) {
      const fetchInitialData = async () => {
        await fetchBidder(bidderId);
      };
      fetchInitialData();
    }
  }, [location.state.bidder, bidder]);

  useEffect(() => {
    const currentSessionBidder = sessionStorage.getItem("bidder");
    if (bidder) {
      if (currentSessionBidder) {
        let parsedSessionBidder = JSON.parse(currentSessionBidder);
        if (parsedSessionBidder.supplier_id !== bidder.bidder_id) {
          sessionStorage.removeItem("bidder");
          sessionStorage.setItem("bidder", JSON.stringify(bidder));
        }
      }
      sessionStorage.setItem("bidder", JSON.stringify(bidder));
    }
  }, [bidder]);

  const renderProfileDetails = (bidder: any) => {
    let bidderDetails = bidder;
    let profileDetails = [];
    for (let key in bidderDetails) {
      let label = key;
      if (label === "created_at") label = "Date created";
      if (label === "updated_at") label = "Last updated at";
      label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
      profileDetails.push({ label, value: bidderDetails[key] });
    }

    return (
      <>
        {profileDetails.map((item, i) => {
          if (["bidder id", "requirements"].includes(item.label.toLowerCase()))
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

      {!isFetchingBidder && bidder ? (
        <div className="h-full">
          <div className="flex flex-grow gap-2">
            <div className="w-2/6 border rounded shadow-md p-4 h-full">
              <h1 className="text-3xl font-bold">{bidder?.full_name}</h1>
              <div className="flex mt-4">
                <div className="flex-col w-full gap-4">
                  {renderProfileDetails(bidder)}
                </div>
              </div>
            </div>

            <div className="w-4/6 border p-4 h-full">
              <div className="flex justify-end w-full p-2">
                <Button
                  buttonType="primary"
                  onClick={() =>
                    navigate("/bidders/requirement", { state: { bidder } })
                  }
                >
                  Add Bidder Requirement
                </Button>
              </div>
              <Table
                data={bidder.requirements || []}
                loading={isFetchingBidder}
                rowKeys={["name", "validity_date"]}
                columnHeaders={["Requirement Name", "Valid Until"]}
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

export default BidderProfile;
