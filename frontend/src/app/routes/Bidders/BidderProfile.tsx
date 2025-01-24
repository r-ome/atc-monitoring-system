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
import { useBidders, useBidderRequirement } from "../../../context";
import { ErrorState } from "../../../types";

const BidderProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    error,
    isLoading,
    bidderAuctions,
    payments: bidderPaymentHistory,
    bidder: fetchedBidder,
    getBidder,
    getBidderAuctions,
    updateBidder,
    getBidderPaymentHistory,
  } = useBidders();
  const {
    addBidderRequirement,
    getBidderRequirements,
    requirements,
    isLoading: isRequirementsLoading,
    error: requirementsError,
  } = useBidderRequirement();
  const [errorState, setErrorState] = useState<ErrorState>();
  const [bidder, setBidder] = useState(location.state.bidder);
  const [formState, setFormState] = useState({
    first_name: bidder.first_name,
    middle_name: bidder.middle_name,
    last_name: bidder.last_name,
    service_charge: bidder.service_charge,
    bidder_number: bidder.bidder_number,
    old_number: bidder.old_number,
  });

  useEffect(() => {
    const fetchBidderRequirements = async () => {
      await getBidderRequirements(bidder.bidder_id);
    };
    const fetchBidderAuctions = async () => {
      await getBidderAuctions(bidder.bidder_id);
    };
    const fetchBidderPaymentHistory = async () => {
      await getBidderPaymentHistory(bidder.bidder_id);
    };
    fetchBidderRequirements();
    fetchBidderAuctions();
    fetchBidderPaymentHistory();
  }, [bidder.bidder_id, location.state.bidder.bidder_id]);

  useEffect(() => {
    if (fetchedBidder) {
      setBidder(fetchedBidder);
      setFormState({
        first_name: bidder.first_name,
        middle_name: bidder.middle_name,
        last_name: bidder.last_name,
        service_charge: bidder.service_charge,
        bidder_number: bidder.bidder_number,
        old_number: bidder.old_number,
      });
    } else {
      const fetchBidder = async () => {
        await getBidder(bidder.bidder_id);
      };
      fetchBidder();
    }
  }, [fetchedBidder, bidder.bidder_id]);

  const [showUpdateBidderModal, setShowUpdateBidderModal] =
    useState<boolean>(false);

  const [showAddRequirementModal, setAddRequirementModal] =
    useState<boolean>(false);

  useEffect(() => {
    if (error && error.code === 400) {
      setErrorState(error.errors[0]);
    }

    if (requirementsError && requirementsError.code === 400) {
      setErrorState(requirementsError.errors[0]);
    }

    if (!isLoading && !error) {
      setShowUpdateBidderModal(false);
    }

    if (!isRequirementsLoading && !requirementsError) {
      setAddRequirementModal(false);
    }
  }, [error, isLoading, isRequirementsLoading, requirementsError]);

  const [validityDate, setValidityDate] = useState<Date | null>(new Date());

  const handleUpdateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleUpdateBidder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateBidder(bidder.bidder_id, formState);
  };

  const handleSubmitRequirement = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addBidderRequirement(bidder.bidder_id, formData);
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
            <h1 className="text-2xl">Bidder Number: {bidder.bidder_number}</h1>
            <h1 className="text-2xl">
              {bidder.first_name} {bidder.middle_name} {bidder.last_name}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              className="text-blue-500 w-20"
              onClick={() => {
                setShowUpdateBidderModal(true);
              }}
            >
              Edit
            </Button>
          </div>
        </div>

        <div>
          <Tabs
            tabs={[
              { page: "requirements", label: "Requirements" },
              { page: "auctions", label: "Auctions Joined" },
              { page: "payments", label: "Payments History" },
            ]}
            tabContent={({ current }) => (
              <>
                <TabContent current={current} tabCategory="requirements">
                  <div>
                    <div className="flex justify-end w-full h-10 my-2">
                      <Button
                        className="text-blue-500 w-40"
                        onClick={() => {
                          setAddRequirementModal(true);
                        }}
                      >
                        Add Requirements
                      </Button>
                    </div>
                    <div className="rounded mt-4 overflow-auto">
                      <Table
                        data={requirements}
                        loading={isLoading}
                        rowKeys={[
                          "name",
                          "validity_date",
                          "created_at",
                          "updated_at",
                        ]}
                        columnHeaders={[
                          "requirement",
                          "valid until",
                          "date uploaded",
                          "Last Date updated",
                        ]}
                      />
                    </div>
                  </div>
                </TabContent>
                <TabContent current={current} tabCategory="auctions">
                  <div className="rounded mt-4 overflow-auto">
                    <Table
                      data={bidderAuctions}
                      loading={isLoading}
                      onRowClick={(bidderAuction) => {
                        navigate(
                          `/bidders/${bidderAuction.bidder_id}/auction/${bidderAuction.auction_id}`,
                          {
                            state: {
                              bidderId: bidderAuction.bidder_id,
                              auctionId: bidderAuction.auction_id,
                            },
                          }
                        );
                      }}
                      rowKeys={[
                        "created_at",
                        "service_charge",
                        "total_items",
                        "total_price",
                      ]}
                      columnHeaders={[
                        "auction",
                        "service charge",
                        "total items",
                        "total price",
                      ]}
                    />
                  </div>
                </TabContent>
                <TabContent current={current} tabCategory="payments">
                  <div className="rounded mt-4 overflow-auto">
                    <Table
                      data={bidderPaymentHistory}
                      loading={isLoading}
                      rowKeys={[
                        "created_at",
                        "purpose",
                        "payment",
                        "payment_type",
                        "receipt_number",
                      ]}
                      columnHeaders={[
                        "Date",
                        "Purpose",
                        "Amount",
                        "type",
                        "Receipt Number",
                      ]}
                    />
                  </div>
                </TabContent>
              </>
            )}
          ></Tabs>
        </div>

        <Modal
          isOpen={showUpdateBidderModal}
          title="Update Bidder"
          setShowModal={() => setShowUpdateBidderModal(false)}
        >
          <>
            <form id="update_bidder" onSubmit={handleUpdateBidder}>
              <Input
                id="first_name"
                name="first_name"
                placeholder="First Name"
                label="First Name:"
                value={formState.first_name || ""}
                onChange={handleUpdateField}
                error={errorState}
              />
              <Input
                id="middle_name"
                name="middle_name"
                placeholder="Middle Name"
                label="Middle Name: "
                value={formState.middle_name || ""}
                onChange={handleUpdateField}
                error={errorState}
              />
              <Input
                id="last_name"
                name="last_name"
                placeholder="Last Name"
                label="Last Name: "
                value={formState.last_name || ""}
                onChange={handleUpdateField}
                error={errorState}
              />
              <Input
                id="bidder_number"
                name="bidder_number"
                placeholder="Bidder Number"
                label="Bidder Number:"
                value={formState.bidder_number || ""}
                onChange={handleUpdateField}
                error={errorState}
              />
              <Input
                id="service_charge"
                name="service_charge"
                placeholder="Service Chage"
                value={formState.service_charge || ""}
                onChange={handleUpdateField}
                label="Service Charge: "
                error={errorState}
              />
              <div className="flex justify-end gap-2">
                <Button
                  buttonType="secondary"
                  onClick={() => setShowUpdateBidderModal(false)}
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

        <Modal
          isOpen={showAddRequirementModal}
          title="Add Requirement"
          setShowModal={() => setShowUpdateBidderModal(false)}
        >
          <>
            <form id="add_requirement" onSubmit={handleSubmitRequirement}>
              <div>
                <Input
                  id="name"
                  name="name"
                  placeholder="Document Name"
                  label="Document Name:"
                  error={errorState}
                />
              </div>
              <div className="flex flex-col mb-2">
                <label>Validity Date:</label>
                <DatePicker
                  selected={validityDate}
                  id="validity_date"
                  name="validity_date"
                  onChange={(date) => setValidityDate(date)}
                  disabled={isLoading}
                  className="border rounded pl-2 cursor-pointer w-full h-11"
                  error={errorState}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  buttonType="secondary"
                  onClick={() => setAddRequirementModal(false)}
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
    </>
  );
};

export default BidderProfile;
