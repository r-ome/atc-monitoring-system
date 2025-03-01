import { useParams } from "react-router-dom";
import { Button, ProfileDetails } from "@components";
import { AuctionInventory } from "@types";

interface ItemProfileProps {
  auctionInventory: AuctionInventory;
  setAuctionInventory: React.Dispatch<
    React.SetStateAction<AuctionInventory | null>
  >;
}
const ItemProfile: React.FC<ItemProfileProps> = ({
  auctionInventory,
  setAuctionInventory,
}) => {
  const params = useParams();
  // const { cancelItem } = useAuction();

  const handleCancelItem = async (auctionInventoryId: number) => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      // await cancelItem(parseInt(auctionId, 2), auctionInventoryId);
    }
  };

  if (auctionInventory) {
    return (
      <div className="flex flex-col">
        <div className="flex w-2/6">
          <Button onClick={() => setAuctionInventory(null)}>Go Back</Button>
        </div>
        <div className="flex mt-4 gap-4">
          <div className="w-2/6 border rounded p-4">
            <ProfileDetails
              title={auctionInventory?.barcode}
              profile={auctionInventory}
              excludedProperties={["inventory_id", "auction_inventory_id"]}
              renamedProperties={{ qty: "QTY", auction_status: "Status" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            {auctionInventory.auction_status !== "CANCELLED" ? (
              <>
                <Button
                  onClick={() =>
                    handleCancelItem(auctionInventory.auction_inventory_id)
                  }
                >
                  Cancel Item
                </Button>
                <Button>Reassign Item</Button>
                {auctionInventory.auction_status === "PAID" ? (
                  <Button>Refund Item</Button>
                ) : (
                  <Button>Less Item Price</Button>
                )}
              </>
            ) : (
              <Button>Reassign Item</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ItemProfile;
