import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Input, Button } from "../../../components";
import { useBidders } from "../../../context/BidderProvider/BidderContext";
import { BIDDERS_402, BIDDERS_501, BIDDERS_503 } from "../errors";

const CreateSupplier = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { createBidder, isLoading, error, bidder } = useBidders();

  const handleSubmitCreateBidder = methods.handleSubmit(async (data) => {
    await createBidder(data);
  });

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
        <h1 className="text-3xl">Create Bidder</h1>
      </div>

      <div className="block p-10 border rounded-lg shadow-lg">
        {isLoading ? (
          <div className="text-3xl flex justify-center">Loading...</div>
        ) : (
          <FormProvider {...methods}>
            {hasError ? (
              <div className="border p-2 rounded border-red-500 mb-10">
                <h1 className="text-red-500 text-xl flex justify-center">
                  {[BIDDERS_503, BIDDERS_501].includes(error?.error) ? (
                    <>Please take a look back later...</>
                  ) : null}
                  {error?.error === BIDDERS_402 ? (
                    <>Bidder Number 232 already taken!</>
                  ) : null}
                </h1>
              </div>
            ) : null}

            {isSuccess ? (
              <h1 className="text-green-500 text-xl flex justify-center">
                Successfully Added Bidder!
              </h1>
            ) : null}
            <form
              id="create_bidder"
              onSubmit={(e) => e.preventDefault()}
              noValidate
              autoComplete="off"
            >
              <Input
                id="bidder_number"
                name="bidder_number"
                placeholder="Bidder Number"
                label="Bidder Number: "
                type="number"
              />
              <Input
                id="first_name"
                name="first_name"
                placeholder="First Name"
                label="First Name:"
                validations={{
                  required: {
                    value: true,
                    message: "First Name is required",
                  },
                  minLength: { value: 3, message: "Minimum of 3 characters" },
                  maxLength: {
                    value: 255,
                    message: "Maximum of 255 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9\- ]+$/,
                    message: "Invalid characters",
                  },
                }}
              />
              <Input
                id="middle_name"
                name="middle_name"
                placeholder="Middle Name"
                label="Middle Name: "
              />
              <Input
                id="last_name"
                name="last_name"
                placeholder="Last Name"
                label="Last Name:"
                validations={{
                  required: {
                    value: true,
                    message: "First Name is required",
                  },
                  minLength: { value: 3, message: "Minimum of 3 characters" },
                  maxLength: {
                    value: 255,
                    message: "Maximum of 255 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9\- ]+$/,
                    message: "Invalid characters",
                  },
                }}
              />
              <div className="flex">
                <Button
                  onClick={handleSubmitCreateBidder}
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

export default CreateSupplier;
