import { useNavigate } from "react-router-dom";
import { Button, Table } from "../../../components";
import { useAuction } from "../../../context";
import { useSession } from "../../hooks";
import { AUCTIONS_501 } from "../errors";

const AuctionBidders = () => {
  const navigate = useNavigate();
  const [sessionAuction] = useSession<any>("auction", null);
  const {
    registeredBidders,
    isLoading: isFetchingRegisteredBidders,
    errors,
  } = useAuction();

  if (errors) {
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
      ) : (
        <div className="border p-2 flex justify-center">Loading...</div>
      )}
    </div>
  );
};

export default AuctionBidders;
