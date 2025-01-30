import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Input, Button } from "../../../components";
import { SUPPLIERS_402, SUPPLIERS_501 } from "../errors";
import { useInventories } from "../../../context";
import { useSession } from "../../hooks";

const CreateInventory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { createInventory, inventory, isLoading, errors } = useInventories();
  const [supplier] = useSession<any>("supplier", null);
  const [container] = useSession<any>("container", null);

  const handleSubmitCreateInventory = methods.handleSubmit(async (data) => {
    await createInventory(supplier?.supplier_id, container?.container_id, data);
  });

  useEffect(() => {
    if (!errors && !isLoading && inventory) {
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
        {isLoading ? (
          <div className="text-3xl flex justify-center">Loading...</div>
        ) : (
          <FormProvider {...methods}>
            {hasError ? (
              <h1 className="text-red-500 text-xl flex justify-center">
                {errors?.error === SUPPLIERS_501 ? (
                  <>Please take a look back later...</>
                ) : null}
                {errors?.error === SUPPLIERS_402 ? (
                  <>Supplier Name or Supplier Code already exist!</>
                ) : null}
              </h1>
            ) : null}

            {isSuccess ? (
              <h1 className="text-green-500 text-xl flex justify-center">
                Successfully Added Inventory!
              </h1>
            ) : null}
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
                    value: /^[a-zA-Z0-9\- ]+$/,
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
                    value: /^[a-zA-Z0-9\- ]+$/,
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
        )}
      </div>
    </div>
  );
};

export default CreateInventory;
