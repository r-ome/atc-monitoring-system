import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Table, ProfileDetails } from "@components";
import { useBidders } from "@context";
import { useSession } from "../../hooks";
import { Bidder } from "@types";

const BidderProfile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { bidder, isLoading: isFetchingBidder, fetchBidder } = useBidders();
  const [sessionBidder, setSessionBidder] = useSession<Bidder | null>(
    "bidder",
    null
  );

  useEffect(() => {
    const { bidder_id: bidderId } = params;
    if (bidderId) {
      const fetchInitialData = async () => {
        await fetchBidder(bidderId);
      };
      fetchInitialData();
    }

    if (bidder) {
      if (sessionBidder) {
        if (sessionBidder.bidder_id !== bidder.bidder_id) {
          setSessionBidder(bidder);
          return;
        }
      }
      setSessionBidder(bidder);
    }
  }, [params.bidder_id, fetchBidder, bidder?.bidder_id]);

  if (isFetchingBidder || !bidder) {
    return <div className="border p-2 flex justify-center">Loading...</div>;
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

      <div className="h-full">
        <div className="flex flex-grow gap-2">
          <div className="w-2/6 border rounded shadow-md p-4 h-full">
            <ProfileDetails
              title={`${bidder?.bidder_number} - ${bidder?.full_name}`}
              profile={bidder}
              excludedProperties={["bidder_id", "requirements", "updated_at"]}
              renamedProperties={{ created_at: "Date Joined" }}
            />
          </div>

          <div className="w-4/6 border p-4 h-full">
            <div className="flex justify-between items-center w-full p-2">
              <h1 className="text-3xl font-bold">Requirements</h1>
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
              data={bidder?.requirements}
              loading={isFetchingBidder}
              rowKeys={["name", "validity_date"]}
              columnHeaders={["Requirement Name", "Valid Until"]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BidderProfile;
