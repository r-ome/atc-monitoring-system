import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { RHFInput } from "@components";
import { useSuppliers } from "@context/SupplierProvider/SupplierContext";
import { CreateSupplierPayload } from "@types";
import { SUPPLIERS_402 } from "../errors";
import { usePageLayoutProps } from "@layouts";
import { Button, Card, Typography } from "antd";

const CreateSupplier = () => {
  const navigate = useNavigate();
  const methods = useForm<CreateSupplierPayload>();
  const { openNotification, setPageBreadCrumbs } = usePageLayoutProps();
  const {
    createSupplier,
    isLoading,
    error: ErrorResponse,
    supplier: SuccessResponse,
    resetSupplier,
  } = useSuppliers();

  useEffect(() => {
    setPageBreadCrumbs([
      { title: "Suppliers List", path: "/suppliers" },
      {
        title: `Create Supplier`,
        path: `/suppliers/create`,
      },
    ]);
  }, [setPageBreadCrumbs]);

  const handleFieldUpperCase = (
    fieldName: "name" | "japanese_name" | "shipper",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    methods.setValue(fieldName, e.target.value.toUpperCase());
  };

  const handleSubmitCreateSupplier = methods.handleSubmit(async (data) => {
    await createSupplier(data);
  });

  useEffect(() => {
    if (!isLoading) {
      if (SuccessResponse) {
        methods.reset();
        openNotification("Successfully Added Supplier!");
        navigate(`/suppliers/${SuccessResponse.supplier_id}`);
      }

      if (ErrorResponse) {
        let message = "Server Error";
        if (ErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }
        if (ErrorResponse.error === SUPPLIERS_402) {
          message = "Either Supplier Name or Supplier Code already exist!";
        }
        openNotification(message, "error", "Error");
      }
      resetSupplier();
    }
  }, [
    ErrorResponse,
    SuccessResponse,
    methods,
    isLoading,
    openNotification,
    navigate,
    resetSupplier,
  ]);

  return (
    <Card
      className="py-4 w-1/2"
      title={<h1 className="text-3xl">Create Supplier</h1>}
    >
      {/* NOTE: CHECK WHETHER YOU NEED TO ADD NUM_OF_CONTAINERS */}
      <form
        id="create_bidder"
        className="flex flex-col gap-4 w-full"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <Typography.Title level={5}>Supplier Name:</Typography.Title>
          <RHFInput
            control={methods.control}
            name="name"
            disabled={isLoading}
            placeholder="Supplier Name"
            rules={{
              required: "This field is required!",
              pattern: {
                value: /^[a-zA-Z0-9Ññ\- ]+$/,
                message: "Invalid characters!",
              },
              minLength: { value: 3, message: "Minimum of 3 characters" },
              maxLength: {
                value: 255,
                message: "Maximum of 255 characters",
              },
            }}
          />
        </div>

        <div>
          <Typography.Title level={5}>Japanese Name:</Typography.Title>
          <RHFInput
            control={methods.control}
            name="japanese_name"
            disabled={isLoading}
            placeholder="Japanese Name"
            onChange={(e) => handleFieldUpperCase("japanese_name", e)}
            rules={{
              minLength: { value: 2, message: "Minimum of 2 characters!" },
              maxLength: {
                value: 255,
                message: "Maximum of 255 characters!",
              },
              pattern: {
                value: /^[a-zA-Z0-9Ññ\- ]+$/,
                message: "Invalid characters!",
              },
            }}
          />
        </div>

        <div>
          <Typography.Title level={5}>Supplier Code:</Typography.Title>
          <RHFInput
            control={methods.control}
            name="supplier_code"
            disabled={isLoading}
            placeholder="Supplier Code"
            rules={{
              pattern: {
                value: /^[a-zA-Z0-9Ññ\- ]+$/,
                message: "Invalid characters!",
              },
            }}
          />
        </div>

        <div>
          <Typography.Title level={5}>Shipper:</Typography.Title>
          <RHFInput
            control={methods.control}
            name="shipper"
            disabled={isLoading}
            placeholder="Shipper"
            onChange={(e) => handleFieldUpperCase("shipper", e)}
            rules={{
              required: "Shipper is required!",
              minLength: { value: 2, message: "Minimum of 2 characters!" },
              maxLength: {
                value: 255,
                message: "Maximum of 255 characters!",
              },
              pattern: {
                value: /^[a-zA-Z0-9Ññ\- ]+$/,
                message: "Invalid characters!",
              },
            }}
          />
        </div>

        <div className="flex gap-2 w-full justify-end">
          <Button onClick={() => navigate("/suppliers")} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCreateSupplier}
            type="primary"
            loading={isLoading}
          >
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateSupplier;
