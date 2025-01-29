import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Input, Button, DatePicker } from "../../../components";
import { useBidders } from "../../../context/BidderProvider/BidderContext";
import { SUPPLIERS_501 } from "../errors";
import { useBidderRequirement } from "../../../context/RequirementProvider/RequirementContext";

const CreateBidderRequirement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [bidder, setBidder] = useState<null | { bidder_id: string }>(null);
  const { createBidderRequirement, isLoading, error } = useBidderRequirement();

  useEffect(() => {
    let sessionBidder = sessionStorage.getItem("bidder");
    if (sessionBidder) {
      setBidder(JSON.parse(sessionBidder));
    }
  }, []);

  useEffect(() => {
    if (!error && !isLoading && bidder) {
      methods.reset();
      setHasError(false);
      setIsSuccess(true);
    }

    if (error) {
      setIsSuccess(false);
      setHasError(true);
    }
  }, [error, isLoading]);

  useEffect(() => {
    setHasError(false);
    setIsSuccess(false);
  }, [location.key]);

  const handleSubmitCreateBidderRequirement = methods.handleSubmit(
    async (data) => {
      await createBidderRequirement(bidder?.bidder_id!, data);
    }
  );

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
        {isLoading ? (
          <div className="text-3xl flex justify-center">Loading...</div>
        ) : (
          <FormProvider {...methods}>
            {hasError ? (
              <h1 className="text-red-500 text-xl flex justify-center">
                {error?.error === SUPPLIERS_501 ? (
                  <>Please take a look back later...</>
                ) : null}
              </h1>
            ) : null}

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
        )}
      </div>
    </div>
  );
};

export default CreateBidderRequirement;
