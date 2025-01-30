import { useEffect, useState } from "react";
import { Bidder } from "../../../types";
import { Button, Table } from "../../../components";
import { useBidders } from "../../../context";
import { useNavigate } from "react-router-dom";

const BidderList = () => {
  const navigate = useNavigate();
  const {
    bidders,
    fetchBidders,
    error,
    isLoading: isFetchingBidders,
  } = useBidders();

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBidders();
    };
    fetchInitialData();
  }, []);

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
