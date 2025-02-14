import { useNavigate } from "react-router-dom";
import { Button, Table } from "@components";
import { useAuction } from "@context";
import { useSession } from "../../hooks";
import RenderServerError from "../ServerCrashComponent";

const AuctionBidders = () => {
  const navigate = useNavigate();
  const [sessionAuction] = useSession<any>("auction", null);
  const {
    registeredBidders,
    isLoading: isFetchingRegisteredBidders,
    error,
  } = useAuction();

  if (error?.httpStatus === 500) {
    return <RenderServerError {...error} />;
  }

  return (
    <div className="w-full border p-4 h-full">
      <div className="flex justify-between items-center w-full p-2">
        <h1 className="text-3xl font-bold">Registered Bidders</h1>
        <Button
          buttonType="primary"
          onClick={() =>
            navigate(`/auctions/${sessionAuction.auction_id}/register-bidder`)
          }
        >
          Register Bidder
        </Button>
      </div>

      {!isFetchingRegisteredBidders && registeredBidders?.bidders ? (
        <Table
          data={registeredBidders?.bidders || []}
          loading={isFetchingRegisteredBidders}
          onRowClick={(bidder) => {
            navigate(
              `/auctions/${sessionAuction.auction_id}/bidders/${bidder.bidder_id}`
            );
          }}
          rowKeys={[
            "bidder_number",
            "full_name",
            "service_charge",
            "registration_fee",
            "total_no_items",
            "balance",
          ]}
          columnHeaders={[
            "Bidder Number",
            "Bidder Name",
            "Service Charge",
            "Registration Fee",
            "Number of items",
            "balance",
          ]}
        />
      ) : (
        <div className="border p-2 flex justify-center">Loading...</div>
      )}
    </div>
  );
};

export default AuctionBidders;
