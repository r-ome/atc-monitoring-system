import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Input, Button } from "@components";
import { useSuppliers } from "@context/SupplierProvider/SupplierContext";
import { APIError, CreateSupplierPayload } from "@types";
import { SUPPLIERS_402 } from "../errors";
import RenderServerError from "../ServerCrashComponent";

const CreateSupplier = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm<CreateSupplierPayload>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const {
    createSupplier,
    isLoading,
    error: ErrorResponse,
    supplier: SuccessResponse,
  } = useSuppliers();

  const handleSubmitCreateSupplier = methods.handleSubmit(async (data) => {
    await createSupplier(data);
  });

  useEffect(() => {
    if (!ErrorResponse && SuccessResponse) {
      methods.reset();
      setIsSuccess(true);
    }

    if (ErrorResponse) {
      setIsSuccess(false);
    }
  }, [ErrorResponse, SuccessResponse, methods]);

  useEffect(() => {
    setIsSuccess(false);
  }, [location.key]);

  const DuplicateEntryError: React.FC<APIError> = ({ error }) => {
    if (error === SUPPLIERS_402) {
      return (
        <h1 className="text-red-500 border py-2 border-red-500 mb-4 text-xl flex flex-col items-center justify-center">
          <div className="mb-2">
            Either Supplier Name or Supplier Code already exist!
          </div>
          <div>Please double check the list and try again.</div>
        </h1>
      );
    }

    return null;
  };

  if (ErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ErrorResponse} />;
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
        <h1 className="text-3xl">Create Supplier</h1>
      </div>

      <div className="block p-10 border rounded-lg shadow-lg">
        {isLoading ? (
          <div className="text-3xl flex justify-center">Loading...</div>
        ) : (
          <FormProvider {...methods}>
            {ErrorResponse && <DuplicateEntryError {...ErrorResponse} />}

            {isSuccess ? (
              <h1 className="text-green-500 text-xl flex justify-center">
                Successfully Added Supplier!
              </h1>
            ) : null}
            <form
              id="create_supplier"
              onSubmit={(e) => e.preventDefault()}
              noValidate
              autoComplete="off"
            >
              <Input
                id="name"
                name="name"
                placeholder="Supplier Name"
                label="Supplier Name:"
                validations={{
                  required: {
                    value: true,
                    message: "Supplier Name is required",
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
                id="japanese_name"
                name="japanese_name"
                placeholder="Japanese Name"
                label="Japanese Name: "
              />
              <Input
                id="supplier_code"
                name="supplier_code"
                placeholder="Code"
                label="Supplier Code:"
                validations={{
                  required: {
                    value: true,
                    message: "Supplier Code is required",
                  },
                }}
              />
              {/* NOTE: CHECK WHETHER YOU NEED TO ADD NUM_OF_CONTAINERS */}
              {/* <Input
              id="num_of_containers"
              name="num_of_containers"
              type="number"
              placeholder="Number of Containers"
              label="Number of Containers:"
            /> */}
              <Input
                id="shipper"
                name="shipper"
                placeholder="Shipper"
                label="Shipper:"
                validations={{
                  minLength: { value: 1, message: "Minimum of 1 character" },
                  required: {
                    value: true,
                    message: "Supplier Code is required",
                  },
                }}
              />
              <div className="flex">
                <Button
                  onClick={handleSubmitCreateSupplier}
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
