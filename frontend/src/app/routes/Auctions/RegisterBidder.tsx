import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { useAuction, useBidders } from "../../../context";
import { Button, Input, Select } from "../../../components";
import { Bidder } from "../../../types";
import { AUCTIONS_402, AUCTIONS_501, BIDDERS_501 } from "../errors";
import { useSession } from "../../hooks";

const RegisterBidder = () => {
  const methods = useForm();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [auction] = useSession<any>("auction", null);
  const {
    bidders,
    fetchBidders,
    isLoading: isFetchingBidders,
    errors: hasBidderErrors,
  } = useBidders();
  const {
    registeredBidders,
    registerBidderAtAuction,
    registeredBidder,
    isLoading,
    errors,
  } = useAuction();
  const [unregisteredBidders, setUnregisteredBidders] = useState<Bidder[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBidders();
    };
    fetchInitialData();
  }, [fetchBidders]);

  useEffect(() => {
    if (bidders && registeredBidders?.bidders) {
      if (bidders.length && !unregisteredBidders.length) {
        const unregisteredBiddersList = bidders.filter(
          (bidder) =>
            !registeredBidders?.bidders
              .map((item) => item.bidder_id)
              .includes(bidder.bidder_id)
        );

        setUnregisteredBidders(unregisteredBiddersList);
      }
    }
  }, [bidders]);

  useEffect(() => {
    if (!isLoading) {
      if (!errors && registeredBidder) {
        methods.reset();
        setHasError(false);
        setIsSuccess(true);
      }

      if (errors) {
        setIsSuccess(false);
        setHasError(true);
      }
    }

    return () => {
      setHasError(false);
      setIsSuccess(false);
    };
  }, [errors, isLoading, methods, registeredBidder?.auction_bidders_id]);

  const handleSubmitRegisterBidder = methods.handleSubmit(async (data) => {
    await registerBidderAtAuction(auction?.auction_id, data);
  });

  if (hasBidderErrors) {
    return (
      <div className="mt-8">
        {hasBidderErrors?.error === BIDDERS_501 ? (
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
      <div className="flex justify-center items-center my-4">
        <h1 className="text-3xl">Register Bidder</h1>
      </div>

      {!unregisteredBidders.length ? (
        <div className="border p-2 flex flex-col gap-4 items-center w-full rounded border-red-500">
          <div className="text-red-500 text-xl">
            No bidders to register. Please go to the Bidders Page and create a
            Bidder.
          </div>

          <Link to={`/auctions/${auction.auction_id}`}>
            Go back to Bidders Page
          </Link>
        </div>
      ) : (
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
            </FormProvider>
          )}
        </div>
      )}
    </div>
  );
};

export default RegisterBidder;
