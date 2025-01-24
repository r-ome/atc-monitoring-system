import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Input,
  Table,
  Modal,
  DatePicker,
  Tabs,
  TabContent,
} from "../../../components";
import { ErrorState } from "../../../types";
import { formatNumberToCurrency } from "../../../lib/utils";
import { useAuction } from "../../../context";

const AuctionInventory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorState, setErrorState] = useState<ErrorState>();
  const [inventory, setInventory] = useState(location.state.inventory);
  //   const [bidder, setBidder] = useState(location.state.bidder);
  //   const [formState, setFormState] = useState({
  //     first_name: bidder.first_name,
  //     middle_name: bidder.middle_name,
  //     last_name: bidder.last_name,
  //     service_charge: bidder.service_charge,
  //     bidder_number: bidder.bidder_number,
  //     old_number: bidder.old_number,
  //   });

  const {
    isLoading,
    inventory: inventoryDetails,
    cancelItem,
    error,
  } = useAuction();

  useEffect(() => {
    if (inventoryDetails) {
      setInventory(inventoryDetails);
    }
  }, [inventoryDetails]);

  //   useEffect(() => {
  //     if (error && error.code === 400) {
  //       setErrorState(error.errors[0]);
  //     }

  //     if (requirementsError && requirementsError.code === 400) {
  //       setErrorState(requirementsError.errors[0]);
  //     }

  //     if (!isLoading && !error) {
  //       setShowUpdateBidderModal(false);
  //     }

  //     if (!isRequirementsLoading && !requirementsError) {
  //       setAddRequirementModal(false);
  //     }
  //   }, [error, isLoading, isRequirementsLoading, requirementsError]);

  console.log(inventory);

  const handleCancelItem = async (auctionId: number, inventoryId: number) => {
    console.log({ auctionId, inventoryId });
    await cancelItem(auctionId, inventoryId);
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

      <div className="border rounded h-full p-4">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl">
              Barcode Number: {inventory.barcode_number}
            </h1>
            <h1 className="text-2xl">
              Control Number: {inventory.control_number}
            </h1>
            <h1 className="text-2xl">Description: {inventory.description}</h1>
            {inventory.item_status === "SOLD" ? (
              <>
                <h1 className="text-2xl">
                  Item Status: {inventory.item_status}
                </h1>
                <h1 className="text-2xl">Auction Status: {inventory.status}</h1>
                <h1 className="text-2xl">Quantity: {inventory.qty}</h1>
                <h1 className="text-2xl">
                  Sold to Bidder number: {inventory.bidder_number}
                </h1>
                <h1 className="text-2xl">
                  Price: {formatNumberToCurrency(inventory.price)}
                </h1>
              </>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                handleCancelItem(inventory.auction_id, inventory.inventory_id);
              }}
              disabled={inventory.status === "CANCELLED"}
            >
              Cancel Item
            </Button>
            <Button>Refund Item</Button>
            <Button>Reduce Price</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionInventory;
