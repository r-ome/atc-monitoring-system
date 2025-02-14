import { useEffect } from "react";
import { Bidder } from "@types";
import { Button, Table } from "@components";
import { useBidders } from "@context";
import { useNavigate } from "react-router-dom";
import RenderServerError from "../ServerCrashComponent";

const BidderList = () => {
  const navigate = useNavigate();
  const {
    bidders,
    fetchBidders,
    error: ErrorResponse,
    isLoading,
  } = useBidders();

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBidders();
    };
    fetchInitialData();
  }, [fetchBidders]);

  if (ErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ErrorResponse} />;
  }

  return (
    <div>
      <div className="flex justify-between my-2 items-center">
        <h1 className="text-3xl">Bidders</h1>
        <div>
          <Button
            buttonType="primary"
            onClick={() => navigate("/bidders/create")}
          >
            Create Bidder
          </Button>
        </div>
      </div>

      <Table
        data={bidders}
        loading={isLoading}
        onRowClick={(bidder: Bidder) =>
          navigate(`/bidders/${bidder.bidder_id}`, {
            state: { bidder },
          })
        }
        rowKeys={["bidder_number", "full_name", "created_at", "updated_at"]}
        columnHeaders={[
          "bidder number",
          "name",
          "Date Created",
          "Last Date Updated",
        ]}
      />
    </div>
  );
};

export default BidderList;
