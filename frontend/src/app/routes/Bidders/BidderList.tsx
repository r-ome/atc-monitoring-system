import { useEffect } from "react";
import { Bidder } from "../../../types";
import { Button, Table } from "../../../components";
import { useBidders } from "../../../context";
import { useNavigate } from "react-router-dom";
import { BIDDERS_501 } from "../errors";

const BidderList = () => {
  const navigate = useNavigate();
  const {
    bidders,
    fetchBidders,
    errors,
    isLoading: isFetchingBidders,
  } = useBidders();

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBidders();
    };
    fetchInitialData();
  }, [fetchBidders]);

  if (errors) {
    return (
      <>
        {errors?.error === BIDDERS_501 ? (
          <div className="border p-2 rounded border-red-500 mb-10">
            <h1 className="text-red-500 text-xl flex justify-center">
              Please take a look back later...
            </h1>
          </div>
        ) : null}
      </>
    );
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
        data={bidders || []}
        loading={isFetchingBidders}
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
