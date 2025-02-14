import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Input, Button } from "@components";
import { useInventories } from "@context";
import { useSession } from "../../hooks";
import { Container, CreateInventoryPayload, Supplier } from "@types";

const CreateInventory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm<CreateInventoryPayload>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [supplier] = useSession<Supplier | null>("supplier", null);
  const [container] = useSession<Container | null>("container", null);
  const {
    createInventory,
    inventory: SuccessResponse,
    isLoading,
    error: ErrorResponse,
  } = useInventories();

  const handleSubmitCreateInventory = methods.handleSubmit(async (data) => {
    if (supplier && container) {
      await createInventory(
        supplier?.supplier_id,
        container?.container_id,
        data
      );
    }
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
        <h1 className="text-3xl">Create Inventory</h1>
      </div>

      <div className="block p-10 border rounded-lg shadow-lg">
        <FormProvider {...methods}>
          {isSuccess && (
            <h1 className="text-green-500 text-xl flex justify-center">
              Successfully Added Inventory!
            </h1>
          )}
          <form
            id="create_inventory"
            onSubmit={(e) => e.preventDefault()}
            noValidate
            autoComplete="off"
          >
            <Input
              id="barcode"
              name="barcode"
              placeholder="Barcode"
              label="Barcode:"
              validations={{
                required: {
                  value: true,
                  message: "Barcode is required",
                },
                pattern: {
                  value: /^[0-9\- ]+$/,
                  message: "Invalid characters",
                },
              }}
            />
            <Input
              id="description"
              name="description"
              placeholder="Description"
              label="Description: "
              validations={{
                required: {
                  value: true,
                  message: "Barcode is required",
                },
                pattern: {
                  value: /^[a-zA-Z0-9\- ]+$/,
                  message: "Invalid characters",
                },
              }}
            />
            <Input
              id="control_number"
              name="control_number"
              placeholder="Control Number"
              label="Control Number:"
              validations={{
                required: {
                  value: true,
                  message: "Barcode is required",
                },
                pattern: {
                  value: /^[0-9\- ]+$/,
                  message: "Invalid characters",
                },
              }}
            />

            <div className="flex">
              <Button
                onClick={handleSubmitCreateInventory}
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

export default CreateInventory;
