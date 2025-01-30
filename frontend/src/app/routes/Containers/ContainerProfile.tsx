import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table } from "../../../components";
import { useContainers, useInventories } from "../../../context";
import { useSession } from "../../hooks";

const ContainerProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [supplier, setSupplier] = useState<{ supplier_id: string } | null>(
    null
  );
  const {
    container,
    isLoading: isFetchingContainer,
    fetchContainer,
  } = useContainers();
  const {
    inventoriesByContainer,
    fetchInventoriesByContainer,
    isLoading: isFetchingInventories,
    errors: inventoryErrors,
  } = useInventories();
  const [sessionSupplier] = useSession("supplier", null);
  const [sessionContainer, setSessionContainer] = useSession<any>(
    "container",
    null
  );

  useEffect(() => {
    if (sessionSupplier) {
      setSupplier(sessionSupplier);
    }
  }, [sessionSupplier]);

  useEffect(() => {
    const { container_id: containerId } = location.state.container;
    if (supplier) {
      const fetchInitialData = async () => {
        await fetchContainer(supplier?.supplier_id!, containerId);
        await fetchInventoriesByContainer(supplier?.supplier_id, containerId);
      };
      fetchInitialData();
    }
  }, [JSON.stringify(container), JSON.stringify(supplier)]);

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
  }, []);

  const renderProfileDetails = (container: any) => {
    let containerDetails = container;
    let profileDetails = [];
    for (let key in containerDetails) {
      let label = key;
      if (label === "created_at") label = "Date created";
      if (label === "updated_at") label = "Last updated at";
      label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
      profileDetails.push({ label, value: containerDetails[key] });
    }

    return (
      <>
        {profileDetails.map((item, i) => {
          if (
            ["container id", "barcode", "supplier", "branch"].includes(
              item.label.toLowerCase()
            )
          )
            return;
          return (
            <div key={i} className="flex justify-between items-center p-2">
              <div>{item.label}:</div>
              <div className="text-lg font-bold">{item.value}</div>
            </div>
          );
        })}
      </>
    );
  };

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

      {!isFetchingContainer && container ? (
        <div className="h-full">
          <div className="flex flex-grow gap-2">
            <div className="w-2/6 border rounded shadow-md p-4 h-full">
              <h1 className="text-3xl font-bold">
                {container?.barcode
                  ? container?.barcode
                  : `${container.supplier.code}-${container.container_num}`}
              </h1>
              <div className="flex mt-4">
                <div className="flex-col w-full gap-4">
                  {renderProfileDetails(container)}
                </div>
              </div>
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
                  data={inventoriesByContainer.inventories || []}
                  loading={isFetchingInventories}
                  rowKeys={[
                    "barcode",
                    "description",
                    "control_number",
                    "status",
                    // "created_at",
                  ]}
                  columnHeaders={[
                    "Barcode",
                    "Description",
                    "Control #",
                    "Status",
                    // "Created at",
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border p-2 flex justify-center">Loading...</div>
      )}
    </>
  );
};

export default ContainerProfile;
