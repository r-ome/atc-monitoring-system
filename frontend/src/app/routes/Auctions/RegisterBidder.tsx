import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuction, useBidders } from "../../../context";
import { Button, Input, Select } from "../../../components";
import { Bidder } from "../../../types";
import { AUCTIONS_402, AUCTIONS_501 } from "../errors";

const RegisterBidder = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const methods = useForm();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [auction, setAuction] = useState<any>(null);
  const {
    bidders,
    fetchBidders,
    isLoading: isFetchingBidders,
    error: hasBidderErrors,
  } = useBidders();
  const { registerBidderAtAuction, registeredBidder, isLoading, errors } =
    useAuction();
  const [unregisteredBidders, setUnregisteredBidders] = useState<Bidder[]>([]);

  useEffect(() => {
    if (auction && auction?.bidders) {
      if (bidders.length && !unregisteredBidders.length) {
        const registeredBidders = auction.bidders.map(
          (item: Bidder) => item.bidder_id
        );

        const unregisteredBiddersList = bidders.filter(
          (bidder) => !registeredBidders.includes(bidder.bidder_id)
        );
        setUnregisteredBidders(unregisteredBiddersList);
      }
    }
  }, [bidders]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBidders();
    };
    fetchInitialData();

    let sessionAuction = sessionStorage.getItem("auction");
    if (sessionAuction) {
      setAuction(JSON.parse(sessionAuction));
    }
  }, []);

  useEffect(() => {
    if (!errors && !isLoading && registeredBidder) {
      methods.reset();
      setHasError(false);
      setIsSuccess(true);
    }

    if (errors) {
      setIsSuccess(false);
      setHasError(true);
    }
  }, [errors, isLoading]);

  useEffect(() => {
    setHasError(false);
    setIsSuccess(false);
  }, [location.key]);

  const handleSubmitRegisterBidder = methods.handleSubmit(async (data) => {
    await registerBidderAtAuction(auction.auction_id, data);
  });

  return (
    <div>
      <div className="w-full">
        <Button
          buttonType="secondary"
          onClick={() => navigate(-1)}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>
      <div className="flex justify-between my-2">
        <h1 className="text-3xl">Register Bidder</h1>
      </div>

      <div className="block p-10 border rounded-lg shadow-lg">
        {isLoading && isFetchingBidders ? (
          <div className="text-3xl flex justify-center">Loading...</div>
        ) : (
          <FormProvider {...methods}>
            {hasError ? (
              <h1 className="text-red-500 text-xl flex justify-center">
                {errors?.error === AUCTIONS_501 ? (
                  <>Please take a look back later...</>
                ) : null}
                {errors?.error === AUCTIONS_402 ? (
                  <>Bidder already registered!</>
                ) : null}
              </h1>
            ) : null}

            {isSuccess ? (
              <h1 className="text-green-500 text-xl flex justify-center">
                Successfully Registered Bidder!
              </h1>
            ) : null}

            {!unregisteredBidders.length ? (
              <div className="border p-2 rounded border-red-500">
                <h1 className="text-red-500 text-xl flex justify-center">
                  No bidders to register. Please go to the Bidders Page and
                  create a Bidder.
                </h1>
              </div>
            ) : (
              <form
                id="register_bidder"
                onSubmit={(e) => e.preventDefault()}
                noValidate
                autoComplete="off"
              >
                <Select
                  id="bidder_id"
                  name="bidder_id"
                  label="Bidder:"
                  disabled={!unregisteredBidders.length}
                  options={unregisteredBidders.map((bidder) => ({
                    value: bidder?.bidder_id.toString(),
                    label: `${bidder.bidder_number} - ${bidder.full_name}`,
                  }))}
                  validations={{
                    required: { value: true, message: "Bidder is required" },
                  }}
                />

                <Input
                  id="service_charge"
                  name="service_charge"
                  placeholder="Service Charge"
                  label="Service Charge:"
                  disabled={!unregisteredBidders.length}
                  type="number"
                  validations={{
                    required: {
                      value: true,
                      message: "Service Charge is required",
                    },
                  }}
                />

                <Input
                  id="registration_fee"
                  name="registration_fee"
                  placeholder="Registration Fee"
                  label="Registration Fee:"
                  type="number"
                  disabled={!unregisteredBidders.length}
                  validations={{
                    required: {
                      value: true,
                      message: "Registration Fee is required",
                    },
                  }}
                />

                <div className="flex">
                  <Button
                    onClick={handleSubmitRegisterBidder}
                    buttonType="primary"
                    type="submit"
                    className="w-full h-12"
                    disabled={!unregisteredBidders.length}
                  >
                    Save
                  </Button>
                </div>
              </form>
            )}
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default RegisterBidder;
