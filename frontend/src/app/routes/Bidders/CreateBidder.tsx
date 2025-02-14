import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Input, Button } from "@components";
import { useBidders } from "@context/BidderProvider/BidderContext";
import { CreateBidderPayload } from "@types";
import { BIDDERS_402 } from "../errors";
import RenderServerError from "../ServerCrashComponent";

const CreateSupplier = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm<CreateBidderPayload>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const {
    createBidder,
    isLoading,
    error: ErrorResponse,
    bidder: SuccessResponse,
  } = useBidders();

  useEffect(() => {
    if (!ErrorResponse && SuccessResponse) {
      methods.reset();
      setIsSuccess(true);
    }

    if (ErrorResponse) {
      if (ErrorResponse.error === BIDDERS_402) {
        methods.setError("bidder_number", {
          type: "string",
          message: `Bidder Number ${methods.getValues(
            "bidder_number"
          )} already taken!`,
        });
      }
      setIsSuccess(false);
    }
  }, [ErrorResponse, SuccessResponse, methods]);

  useEffect(() => {
    setIsSuccess(false);
  }, [location.key]);

  const handleSubmitCreateBidder = methods.handleSubmit(async (data) => {
    methods.setValue("first_name", data.first_name.toUpperCase());
    methods.setValue("last_name", data.last_name.toUpperCase());
    if (data.middle_name) {
      methods.setValue("middle_name", data.middle_name.toUpperCase());
    }

    await createBidder(methods.getValues());
  });

  if (ErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ErrorResponse} />;
  }

  if (isLoading) {
    return <div className="text-3xl flex justify-center">Loading...</div>;
  }

  return (
    <div>
      <div className="w-full">
        <Button
          buttonType="secondary"
          onClick={() => navigate("/bidders")}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>
      <div className="flex justify-between my-2">
        <h1 className="text-3xl">Create Bidder</h1>
      </div>

      <div className="block p-10 border rounded-lg shadow-lg">
        <FormProvider {...methods}>
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
              validations={{
                required: {
                  value: true,
                  message: "Bidder Number is required!",
                },
              }}
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
                  value: /^[a-zA-Z\- ]+$/,
                  message: "Invalid characters",
                },
              }}
            />
            <Input
              id="middle_name"
              name="middle_name"
              placeholder="Middle Name"
              label="Middle Name: "
              validations={{
                pattern: {
                  value: /^[a-zA-Z\- ]+$/,
                  message: "Invalid characters",
                },
              }}
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
                  value: /^[a-zA-Z\- ]+$/,
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
      </div>
    </div>
  );
};

export default CreateSupplier;
