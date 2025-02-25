import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { RHFInput, RHFInputNumber } from "@components";
import { useContainers, useInventories } from "@context";
import { CreateInventoryPayload } from "@types";
import { Button, Card, Skeleton, Typography } from "antd";
import { usePageLayoutProps, BreadcrumbsType } from "@layouts";
import { useBreadcrumbs, useSession } from "app/hooks";
import { INVENTORIES_401, INVENTORIES_402, INVENTORIES_403 } from "../errors";
import { formatNumberPadding } from "@lib/utils";

const CreateInventory = () => {
  const navigate = useNavigate();
  const params = useParams();
  const methods = useForm<CreateInventoryPayload>();
  const {
    createInventory,
    inventory: SuccessResponse,
    isLoading,
    error: ErrorResponse,
    resetInventory,
  } = useInventories();
  const {
    fetchContainer,
    container,
    error: ContainerErrorResponse,
    isLoading: isFetchingContainer,
  } = useContainers();
  const { openNotification } = usePageLayoutProps();
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumb({ title: "Add Inventory", level: 4 });
  }, [setBreadcrumb]);

  useEffect(() => {
    const { supplier_id: supplierId, container_id: containerId } = params;
    if (supplierId && containerId) {
      const fetchInitialData = async () => {
        await fetchContainer(supplierId, containerId);
      };
      fetchInitialData();
    }
  }, [fetchContainer, params]);

  const handleSubmitCreateInventory = methods.handleSubmit(async (data) => {
    const { supplier_id: supplierId, container_id: containerId } = params;
    if (supplierId && containerId && container) {
      data.barcode = `${container.barcode}-${formatNumberPadding(
        data.barcode,
        3
      )}`;
      data.control_number = formatNumberPadding(data.control_number, 4);
      await createInventory(supplierId, containerId, data);
    }
  });

  useEffect(() => {
    if (!isLoading) {
      if (SuccessResponse) {
        methods.reset();
        openNotification("Successfully Added Inventory!");
      }

      if (ErrorResponse) {
        let message = "Server Error";
        if (ErrorResponse.httpStatus === 500)
          message =
            "There might be problems in the server. Please contact your admin.";
        if (ErrorResponse.error === INVENTORIES_401)
          message = "Please double check your inputs!";
        if (ErrorResponse.error === INVENTORIES_402)
          message = `Inventory with BARCODE ${
            container?.barcode
          }-${formatNumberPadding(
            methods.getValues("barcode"),
            3
          )} already exists!`;
        methods.setError("barcode", { type: "string", message });
        if (ErrorResponse.error === INVENTORIES_403)
          message =
            "Container does not exist. Please check your Container Profile";

        openNotification(message, "error", "Error");
      }
      resetInventory();
    }
  }, [
    ErrorResponse,
    SuccessResponse,
    methods,
    container,
    isLoading,
    openNotification,
    navigate,
    resetInventory,
  ]);

  if (!container) return <Skeleton />;

  return (
    <>
      <Card
        className="py-4"
        title={<h1 className="text-3xl">Add Inventory</h1>}
      >
        <form id="create_inventory" className="flex flex-col gap-4 w-2/4">
          <div>
            <Typography.Title level={5}>Barcode:</Typography.Title>
            <RHFInputNumber
              control={methods.control}
              name="barcode"
              prefix={`${container.barcode}-`}
              disabled={isLoading}
              placeholder="Barcode"
              controls={false}
              rules={{
                required: "This field is required!",
                pattern: {
                  value: /^[0-9\- ]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>

          <div>
            <Typography.Title level={5}>Description:</Typography.Title>
            <RHFInput
              control={methods.control}
              name="description"
              disabled={isLoading}
              placeholder="Description"
              onChange={(e) =>
                methods.setValue("description", e.target.value.toUpperCase())
              }
              rules={{
                required: "This field is required!",
                pattern: {
                  value: /^[a-zA-Z0-9\-. ]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>

          <div>
            <Typography.Title level={5}>Control Number:</Typography.Title>
            <RHFInputNumber
              control={methods.control}
              name="control_number"
              disabled={isLoading}
              placeholder="Control Number"
              controls={false}
            />
          </div>

          <div className="flex gap-2 w-full justify-end">
            <Button onClick={() => navigate(-1)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreateInventory}
              type="primary"
              loading={isLoading}
            >
              Save
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
};

export default CreateInventory;
