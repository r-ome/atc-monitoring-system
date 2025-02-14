import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table, ProfileDetails } from "@components";
import { useContainers, useInventories } from "@context";
import { useSession } from "../../hooks";
import { Container, Supplier } from "@types";
import RenderServerError from "../ServerCrashComponent";

const ContainerProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const {
    container,
    isLoading: isFetchingContainer,
    fetchContainer,
    error: ContainerErrorResponse,
  } = useContainers();
  const {
    inventoriesByContainer,
    fetchInventoriesByContainer,
    isLoading: isFetchingInventories,
    error: InventoryErrorResponse,
  } = useInventories();
  const [sessionSupplier] = useSession<Supplier | null>("supplier", null);
  const [sessionContainer, setSessionContainer] = useSession<Container | null>(
    "container",
    null
  );

  useEffect(() => {
    if (sessionSupplier) {
      setSupplier(sessionSupplier);
    }
  }, [sessionSupplier]);

  useEffect(() => {
    const { container_id: containerId }: Container = location.state.container;
    if (supplier) {
      const fetchInitialData = async () => {
        await fetchContainer(supplier.supplier_id, containerId);
        await fetchInventoriesByContainer(supplier.supplier_id, containerId);
      };
      fetchInitialData();
    }
  }, [supplier?.supplier_id, sessionSupplier, location.key]);

  useEffect(() => {
    if (container) {
      if (sessionContainer) {
        if (sessionContainer.container_id !== container.container_id) {
          setSessionContainer(container);
          return;
        }
      }
      setSessionContainer(container);
    }
  }, [sessionContainer?.container_id, container?.container_id]);

  const httpErrors = [
    InventoryErrorResponse?.httpStatus,
    ContainerErrorResponse?.httpStatus,
  ];
  if (httpErrors.includes(500)) {
    const ErrorResponse = InventoryErrorResponse || ContainerErrorResponse;
    if (ErrorResponse) return <RenderServerError {...ErrorResponse} />;
  }

  if (isFetchingContainer || !container) {
    return <div className="border p-2 flex justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="w-full">
        <Button
          buttonType="secondary"
          onClick={() => navigate(-1)}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>

      <div className="h-full">
        <div className="flex flex-grow gap-2">
          <div className="w-2/6 border rounded shadow-md p-4 h-full">
            <ProfileDetails
              title={
                container?.barcode
                  ? container?.barcode
                  : `${container.supplier.code}-${container.container_num}`
              }
              profile={container}
              excludedProperties={[
                "container_id",
                "barcode",
                "supplier",
                "branch",
                "updated_at",
              ]}
              renamedProperties={{ created_at: "Date added" }}
            />
          </div>

          <div className="w-4/6 border p-4 h-full">
            <div className="flex justify-between items-center w-full p-2">
              <h1 className="text-3xl font-bold">Inventories</h1>
              <Button
                buttonType="primary"
                onClick={() =>
                  navigate("/inventory/create", { state: { container } })
                }
              >
                Add Inventory
              </Button>
            </div>
            {!isFetchingInventories && inventoriesByContainer && (
              <Table
                data={inventoriesByContainer}
                loading={isFetchingInventories}
                rowKeys={["barcode", "description", "control_number", "status"]}
                columnHeaders={[
                  "Barcode",
                  "Description",
                  "Control #",
                  "Status",
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContainerProfile;
