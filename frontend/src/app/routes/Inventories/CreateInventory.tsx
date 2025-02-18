import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { RHFInput } from "@components";
import { useInventories } from "@context";
import { CreateInventoryPayload } from "@types";
import { Button, Card, Typography } from "antd";
import { usePageLayoutProps, BreadcrumbsType } from "@layouts";
import { useSession } from "app/hooks";

const CreateInventory = () => {
  const navigate = useNavigate();
  const params = useParams();
  const methods = useForm<CreateInventoryPayload>();
  const {
    createInventory,
    inventory: SuccessResponse,
    isLoading,
    error: ErrorResponse,
  } = useInventories();
  const { pageBreadcrumbs, openNotification, setPageBreadCrumbs } =
    usePageLayoutProps();
  const [breadcrumbsSession, setBreadcrumbsSession] = useSession<
    BreadcrumbsType[]
  >("breadcrumbs", pageBreadcrumbs);

  useEffect(() => {
    if (!breadcrumbsSession) return;
    if (breadcrumbsSession) {
      setPageBreadCrumbs(breadcrumbsSession);
    }
  }, [setPageBreadCrumbs, breadcrumbsSession]);

  useEffect(() => {
    setPageBreadCrumbs((prevBreadcrumbs) => {
      const newBreadcrumb = {
        title: "Add Inventory",
        path: "inventory/create",
      };

      const doesExist = prevBreadcrumbs.find(
        (item) => item.title === newBreadcrumb.title
      );
      if (doesExist) {
        return prevBreadcrumbs;
      }

      const updatedBreadcrumbs = [...prevBreadcrumbs, newBreadcrumb];
      setBreadcrumbsSession(updatedBreadcrumbs);
      return updatedBreadcrumbs;
    });
  }, [pageBreadcrumbs, setPageBreadCrumbs, setBreadcrumbsSession]);

  const handleSubmitCreateInventory = methods.handleSubmit(async (data) => {
    const { supplier_id: supplierId, container_id: containerId } = params;
    if (supplierId && containerId) {
      await createInventory(supplierId, containerId, data);
    }
  });

  useEffect(() => {
    if (!ErrorResponse && !isLoading && SuccessResponse) {
      methods.reset();
      // navigate to Inventory Profile
      navigate(-1);
      openNotification("Successfully added Inventory");
    }

    if (ErrorResponse) {
      openNotification("Please check your inputs!", "error", "Error");
    }
  }, [
    ErrorResponse,
    SuccessResponse,
    methods,
    openNotification,
    isLoading,
    navigate,
  ]);

  return (
    <>
      <Card
        className="py-4"
        title={<h1 className="text-3xl">Create Branch</h1>}
      >
        <form id="create_branch" className="flex flex-col gap-4 w-2/4">
          <div>
            <Typography.Title level={5}>Barcode:</Typography.Title>
            <RHFInput
              control={methods.control}
              name="barcode"
              disabled={isLoading}
              placeholder="Barcode"
              onChange={(e) =>
                methods.setValue("barcode", e.target.value.toUpperCase())
              }
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
            <RHFInput
              control={methods.control}
              name="control_number"
              disabled={isLoading}
              placeholder="Control Number"
              onChange={(e) =>
                methods.setValue("control_number", e.target.value.toUpperCase())
              }
              rules={{
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>

          <div className="flex gap-2 w-full justify-end">
            <Button onClick={() => navigate("/branches")} disabled={isLoading}>
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
