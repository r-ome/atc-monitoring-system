import { useEffect, useState } from "react";
import { Bidder } from "../../../types";
import { Modal, Input, Button, Table } from "../../../components";
import { useBidders } from "../../../context";
import { useNavigate } from "react-router-dom";

const BidderList = () => {
  const navigate = useNavigate();
  const [showCreateBidderModal, setShowCreateBidderModal] =
    useState<boolean>(false);
  const { bidders, getBidders, error, isLoading, createBidder } = useBidders();
  const [errorState, setErrorState] = useState<
    undefined | null | { field: string; message: string }
  >(null);

  useEffect(() => {
    if (error && error.code === 400) {
      setErrorState(error.errors[0]);
    }

    if (!isLoading && !error) {
      setShowCreateBidderModal(false);
    }
  }, [error, isLoading]);

  useEffect(() => {
    getBidders();
  }, []);

  const handleSubmitCreateBidder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    createBidder(formData);
    if (isLoading) {
      setShowCreateBidderModal(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between my-2 items-center">
        <h1 className="text-3xl">Bidders</h1>
        <div>
          <Button
            buttonType="primary"
            onClick={() => setShowCreateBidderModal(!showCreateBidderModal)}
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
        rowKeys={[
          "bidder_number",
          "old_number",
          "first_name",
          "middle_name",
          "last_name",
          "service_charge",
          "created_at",
          "updated_at",
        ]}
        columnHeaders={[
          "bidder number",
          "old number",
          "first name",
          "middle Name",
          "last name",
          "service charge",
          "Date Created",
          "Last Date Updated",
        ]}
      />

      <Modal
        isOpen={showCreateBidderModal}
        title="Create Bidder"
        setShowModal={() => setShowCreateBidderModal(false)}
      >
        <>
          <form id="create_bidder" onSubmit={handleSubmitCreateBidder}>
            <Input
              id="first_name"
              name="first_name"
              placeholder="First Name"
              label="First Name:"
              error={errorState}
            />
            <Input
              id="middle_name"
              name="middle_name"
              placeholder="Middle Name"
              label="Middle Name: "
              error={errorState}
            />
            <Input
              id="last_name"
              name="last_name"
              placeholder="Last Name"
              label="Last Name: "
              error={errorState}
            />
            <Input
              id="service_charge"
              name="service_charge"
              type="number"
              placeholder="Service Charge"
              label="Service Charge:"
              error={errorState}
            />
            <Input
              id="bidder_number"
              name="bidder_number"
              type="number"
              placeholder="Bidder Number"
              label="Bidder Number:"
              error={errorState}
            />
            <Input
              id="old_number"
              name="old_number"
              placeholder="Old Bidder Number"
              label="Old Bidder Number:"
              error={errorState}
            />
            <div className="flex justify-end gap-2">
              <Button
                buttonType="secondary"
                onClick={() => setShowCreateBidderModal(false)}
              >
                Cancel
              </Button>
              <Button buttonType="primary" type="submit" className="w-24">
                Save
              </Button>
            </div>
          </form>
        </>
      </Modal>
    </div>
  );
};

export default BidderList;
