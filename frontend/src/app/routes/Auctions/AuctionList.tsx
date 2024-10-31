import { useState, useEffect } from "react";
import { Auction } from "../../../types";
import { Modal, Input, Button, Table } from "../../../components";
import { useAuction } from "../../../context";
import { useNavigate } from "react-router-dom";

const AuctionList = () => {
  const navigate = useNavigate();
  const { auctions, isLoading, getAuctions, createAuction, error } =
    useAuction();
  const [showCreateAuctionModal, setShowCreateAuctionModal] =
    useState<boolean>(false);

  useEffect(() => {
    getAuctions();
  }, []);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
    if (!isLoading && !error) {
      setShowCreateAuctionModal(false);
    }
  }, [error, isLoading]);

  return (
    <div>
      <div className="flex justify-between my-2 items-center">
        <h1 className="text-3xl">Auction</h1>
        <div>
          <Button
            buttonType="primary"
            onClick={() => setShowCreateAuctionModal(!showCreateAuctionModal)}
          >
            Create Auction
          </Button>
        </div>
      </div>

      <Table
        data={auctions}
        loading={isLoading}
        onRowClick={(auction: Auction) =>
          navigate(`/auctions/${auction.auction_id}`, {
            state: { auction },
          })
        }
        rowKeys={["created_at", "bidder_count", "item_count", "total_sales"]}
        columnHeaders={["Auction", "bidder count", "items count", "total"]}
      />

      <Modal
        isOpen={showCreateAuctionModal}
        title="Are you sure?"
        setShowModal={setShowCreateAuctionModal}
      >
        <div className="flex gap-2 justify-between">
          <Button className="w-1/2" onClick={async () => await createAuction()}>
            Yes
          </Button>
          <Button
            className="w-1/2 border"
            buttonType="secondary"
            onClick={() => setShowCreateAuctionModal(false)}
          >
            No
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AuctionList;
