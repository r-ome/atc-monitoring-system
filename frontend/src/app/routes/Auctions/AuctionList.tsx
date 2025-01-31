import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Auction } from "../../../types";
import { Modal, Button, Table } from "../../../components";
import { useAuction } from "../../../context";
import { AUCTIONS_501 } from "../errors";

const AuctionList = () => {
  const navigate = useNavigate();
  const { auctions, isLoading, getAuctions, createAuction, errors } =
    useAuction();
  const [showConfirmationModal, setConfirmationModal] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      await getAuctions();
    };

    fetchInitialData();
  }, []);

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
    <div>
      <div className="flex justify-between my-2 items-center">
        <h1 className="text-3xl">Auction</h1>
        <div>
          <Button
            buttonType="primary"
            onClick={() => setConfirmationModal(!showConfirmationModal)}
          >
            Create Auction
          </Button>
        </div>
      </div>

      <Table
        data={auctions || []}
        loading={isLoading}
        onRowClick={(auction: Auction) =>
          navigate(`/auctions/${auction.auction_id}`, {
            state: { auction },
          })
        }
        rowKeys={["created_at", "number_of_bidders"]}
        columnHeaders={["Auction Date", "Number of Bidders"]}
      />

      <Modal
        isOpen={showConfirmationModal}
        title="Are you sure?"
        setShowModal={setConfirmationModal}
      >
        <div className="flex gap-2 justify-between">
          <Button
            className="w-1/2"
            onClick={async () => {
              await createAuction();
              setConfirmationModal(false);
            }}
          >
            Yes
          </Button>
          <Button
            className="w-1/2 border"
            buttonType="secondary"
            onClick={() => setConfirmationModal(false)}
          >
            No
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AuctionList;
