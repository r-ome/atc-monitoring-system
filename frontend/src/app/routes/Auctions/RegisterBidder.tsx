import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { useAuction, useBidders } from "@context";
import { Button, Input, Select } from "@components";
import {
  BaseBidder,
  AuctionDetails,
  RegisterBidderPayload,
  APIError,
} from "@types";
import { useSession } from "../../hooks";
import RenderServerError from "../ServerCrashComponent";
import { AUCTIONS_401, AUCTIONS_402, AUCTIONS_403 } from "../errors";

const RegisterBidder = () => {
  const methods = useForm<RegisterBidderPayload>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [auction] = useSession<AuctionDetails | null>("auction", null);
  const [unregisteredBidders, setUnregisteredBidders] = useState<BaseBidder[]>(
    []
  );
  const {
    bidders,
    fetchBidders,
    isLoading: isFetchingBidders,
    error: BidderErrorResponse,
  } = useBidders();
  const {
    registeredBidders,
    registerBidderAtAuction,
    registeredBidder: SuccessResponse,
    isLoading: isRegisteringBidder,
    error: AuctionErrorResponse,
  } = useAuction();

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
  }, [
    bidders,
    registeredBidders?.bidders,
    SuccessResponse,
    unregisteredBidders.length,
  ]);

  useEffect(() => {
    if (!AuctionErrorResponse && SuccessResponse) {
      methods.reset();
      setIsSuccess(true);
    }

    if (AuctionErrorResponse) {
      setIsSuccess(false);
    }

    return () => {
      setIsSuccess(false);
    };
  }, [AuctionErrorResponse, SuccessResponse, methods]);

  const handleSubmitRegisterBidder = methods.handleSubmit(async (data) => {
    if (auction) {
      await registerBidderAtAuction(auction?.auction_id, data);
    }
  });

  const ValidationError: React.FC<APIError> = ({ error }) => {
    let ErrorMessage = null;
    switch (error) {
      case AUCTIONS_401:
        ErrorMessage = "Please double check your inputs!";
        break;
      case AUCTIONS_402:
        ErrorMessage = "Bidder already registered!";
        break;
      case AUCTIONS_403:
        ErrorMessage = "Please double check the bidder if already registered!";
        break;
    }

    if ([AUCTIONS_401, AUCTIONS_402, AUCTIONS_403].includes(error)) {
      return (
        <h1 className="text-red-500 border py-2 border-red-500 mb-4 text-xl flex flex-col items-center justify-center">
          <div className="mb-2">{ErrorMessage}</div>
        </h1>
      );
    }

    return null;
  };

  if (BidderErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...BidderErrorResponse} />;
  }

  if (isRegisteringBidder || isFetchingBidders || !auction) {
    return <div className="text-3xl flex justify-center">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-center items-center my-4">
        <h1 className="text-3xl">Register Bidder</h1>
      </div>

      <div className="block p-10 border rounded-lg shadow-lg">
        <FormProvider {...methods}>
          {AuctionErrorResponse && (
            <ValidationError {...AuctionErrorResponse} />
          )}
          {!unregisteredBidders.length && (
            <div className="border p-2 flex flex-col gap-4 items-center w-full rounded border-red-500">
              <div className="text-red-500 text-xl">
                No bidders to register. Please go to the Bidders Page and create
                a Bidder.
              </div>

              <Link
                to={`/auctions/${auction.auction_id}`}
                className="text-blue-500"
              >
                Go back to Bidders Page
              </Link>
            </div>
          )}
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
              disabled={!unregisteredBidders.length}
              label="Registration Fee:"
              type="number"
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
                disabled={!unregisteredBidders.length}
                buttonType="primary"
                type="submit"
                className="w-full h-12"
              >
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default RegisterBidder;
