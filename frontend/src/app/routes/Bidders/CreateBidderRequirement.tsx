import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Input, Button, DatePicker } from "@components";
import { useBidderRequirement } from "@context";
import { Bidder, BidderRequirementPayload } from "@types";
import { useSession } from "../../hooks";

const CreateBidderRequirement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm<BidderRequirementPayload>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [bidder, setBidder] = useState<Bidder | null>(null);
  const [sessionBidder] = useSession<Bidder | null>("bidder", null);
  const { createBidderRequirement, requirement, isLoading, error } =
    useBidderRequirement();

  useEffect(() => {
    if (sessionBidder && sessionBidder.bidder_id !== bidder?.bidder_id) {
      setBidder(sessionBidder);
    }
  }, [sessionBidder, bidder]);

  useEffect(() => {
    if (error) {
      setIsSuccess(false);
      methods.setError("name", {
        type: "string",
        message: "Invalid Requirement Type!",
      });
    }

    if (!error && !isLoading && bidder && requirement) {
      methods.reset();
      setIsSuccess(true);
    }
  }, [error, isLoading, methods, bidder, requirement]);

  useEffect(() => {
    setIsSuccess(false);
  }, [location.key]);

  const handleSubmitCreateBidderRequirement = methods.handleSubmit(
    async (data) => {
      if (bidder) {
        await createBidderRequirement(bidder.bidder_id, data);
      }
    }
  );

  if (isLoading) {
    return <div className="text-3xl flex justify-center">Loading...</div>;
  }

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
        <h1 className="text-3xl">Add Bidder Requirement</h1>
      </div>

      <div className="block p-10 border rounded-lg shadow-lg">
        <FormProvider {...methods}>
          {isSuccess ? (
            <h1 className="text-green-500 text-xl flex justify-center">
              Successfully Added Bidder Requirement!
            </h1>
          ) : null}
          <form
            id="create_bidder_requirement"
            onSubmit={(e) => e.preventDefault()}
            noValidate
            autoComplete="off"
          >
            <Input
              id="name"
              name="name"
              placeholder="Requirement Type"
              label="Requirement Type: "
            />
            <DatePicker
              id="validity_date"
              name="validity_date"
              label="Validit Until:"
              validations={{
                required: { value: true, message: "required" },
              }}
            />

            <div className="flex">
              <Button
                onClick={handleSubmitCreateBidderRequirement}
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

export default CreateBidderRequirement;
