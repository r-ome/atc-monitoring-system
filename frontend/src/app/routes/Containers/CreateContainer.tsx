import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Input, Button, Select, DatePicker } from "@components";
import { useBranches, useContainers } from "@context";
import { Supplier, CreateContainerPayload } from "@types";
import { useSession } from "../../hooks";
import RenderServerError from "../ServerCrashComponent";

const CreateContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm<CreateContainerPayload>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [sessionSupplier] = useSession<Supplier | null>("supplier", null);
  const {
    container: SuccessResponse,
    isLoading,
    createContainer,
    error: ContainerErrorResponse,
  } = useContainers();
  const {
    branches,
    isLoading: isFetchingBranches,
    fetchBranches,
  } = useBranches();

  useEffect(() => {
    if (sessionSupplier) {
      setSupplier(sessionSupplier);
    }
  }, [sessionSupplier]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBranches();
    };
    fetchInitialData();
  }, [fetchBranches]);

  useEffect(() => {
    if (!ContainerErrorResponse && SuccessResponse) {
      methods.reset();
      setIsSuccess(true);
    }

    if (ContainerErrorResponse) {
      setIsSuccess(false);
    }
  }, [ContainerErrorResponse, SuccessResponse, isLoading, methods]);

  useEffect(() => {
    setIsSuccess(false);
  }, [location.key]);

  const handleSubmitCreateContainer = methods.handleSubmit(async (data) => {
    if (supplier) {
      await createContainer(supplier.supplier_id, data);
    }
  });

  if (ContainerErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ContainerErrorResponse} />;
  }

  if (isFetchingBranches || !branches) {
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
        <h1 className="text-3xl">Create Container</h1>
      </div>

      <div className="block p-10 border rounded-lg shadow-lg">
        <FormProvider {...methods}>
          {isSuccess && (
            <h1 className="text-green-500 text-xl flex justify-center">
              Successfully Added Container!
            </h1>
          )}
          <form
            id="create_container"
            onSubmit={(e) => e.preventDefault()}
            noValidate
            autoComplete="off"
          >
            <Select
              id="branch_id"
              label="Branch:"
              name="branch_id"
              options={branches.map((branch) => ({
                value: branch.branch_id.toString(),
                label: `${branch.name}`,
              }))}
              validations={{
                required: { value: true, message: "Branch is required" },
              }}
            />

            <Input
              id="container_num"
              name="container_num"
              placeholder="Container Number"
              label="Container Number:"
              type="number"
              validations={{
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Invalid characters",
                },
                required: {
                  value: true,
                  message: "Container Number is required",
                },
              }}
            />

            <Input
              id="bill_of_lading_number"
              name="bill_of_lading_number"
              placeholder="Bill of lading number"
              label="Bill of lading number:"
            />

            <Input
              id="port_of_landing"
              name="port_of_landing"
              placeholder="Port of landing"
              label="Port of landing:"
            />

            <Input
              id="carrier"
              name="carrier"
              placeholder="Carrier"
              label="Carrier:"
            />

            <Input
              id="vessel"
              name="vessel"
              placeholder="Vessel"
              label="Vessel:"
            />

            <Input
              id="invoice_num"
              name="invoice_num"
              placeholder="Invoice Num"
              label="Invoice Number:"
            />

            <Input
              id="gross_weight"
              name="gross_weight"
              placeholder="Gross Weight"
              label="Gross Weight:"
            />

            <div className="flex w-full gap-10">
              <div className="w-1/2">
                <DatePicker
                  id="departure_date_from_japan"
                  name="departure_date_from_japan"
                  label="Departure Date from Japan:"
                  className="w-1/2"
                  validations={{
                    required: { value: true, message: "required" },
                  }}
                />
              </div>
              <div className="w-1/2">
                <DatePicker
                  id="eta_to_ph"
                  name="eta_to_ph"
                  label="ETA to Philippines:"
                  className="w-1/2"
                  validations={{
                    required: { value: true, message: "required" },
                  }}
                />
              </div>
            </div>

            <div className="flex w-full gap-10">
              <div className="w-1/2">
                <DatePicker
                  id="arrival_date_warehouse_ph"
                  name="arrival_date_warehouse_ph"
                  label="Arrival Date to PH Warehouse:"
                  className="w-1/2"
                  validations={{
                    required: { value: true, message: "required" },
                  }}
                />
              </div>
              <div className="w-1/2">
                <DatePicker
                  id="sorting_date"
                  name="sorting_date"
                  label="Sorting Date:"
                  className="w-1/2"
                  validations={{
                    required: { value: true, message: "required" },
                  }}
                />
              </div>
            </div>

            <div className="flex w-full gap-10">
              <div className="w-1/2">
                <DatePicker
                  id="auction_date"
                  name="auction_date"
                  label="Auction Date:"
                  className="w-1/2"
                  validations={{
                    required: { value: true, message: "required" },
                  }}
                />
              </div>
              <div className="w-1/2">
                <DatePicker
                  id="payment_date"
                  name="payment_date"
                  label="Payment Date:"
                  className="w-1/2"
                  validations={{
                    required: { value: true, message: "required" },
                  }}
                />
              </div>
            </div>

            <div className="flex w-full gap-10">
              <div className="w-1/2">
                <DatePicker
                  id="vanning_date"
                  name="vanning_date"
                  label="Vanning Date:"
                  className="w-1/2"
                  validations={{
                    required: { value: true, message: "required" },
                  }}
                />
              </div>
              <div className="w-1/2">
                <DatePicker
                  id="devanning_date"
                  name="devanning_date"
                  label="Devanning Date:"
                  className="w-1/2"
                  validations={{
                    required: { value: true, message: "required" },
                  }}
                />
              </div>
            </div>

            <DatePicker
              id="telegraphic_transferred"
              name="telegraphic_transferred"
              label="Telegraphic transferred:"
              className="w-1/2"
              validations={{
                required: { value: true, message: "required" },
              }}
            />

            <Select
              id="auction_or_sell"
              label="Auction or Sell:"
              name="auction_or_sell"
              options={["AUCTION", "SELL"].map((item) => ({
                value: item,
                label: item,
              }))}
              validations={{
                required: { value: true, message: "This field is required" },
              }}
            />

            <div className="flex mt-4">
              <Button
                onClick={handleSubmitCreateContainer}
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

export default CreateContainer;
