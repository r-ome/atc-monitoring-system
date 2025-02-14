import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table, ProfileDetails } from "@components";
import { useSuppliers } from "@context/SupplierProvider/SupplierContext";
import { useContainers } from "@context/ContainerProvider/ContainerContext";
import { useSession } from "../../hooks";
import { BaseContainer, Supplier } from "@types";
import RenderServerError from "../ServerCrashComponent";

const SupplierProfile = () => {
  const [sessionSupplier, setSupplierSession] = useSession<Supplier | null>(
    "supplier",
    null
  );
  const navigate = useNavigate();
  const location = useLocation();
  const {
    supplier,
    fetchSupplier,
    isLoading: isFetchingSupplier,
    error: SupplierErrorResponse,
  } = useSuppliers();
  const {
    containersBySupplier,
    fetchContainersBySupplier,
    isLoading: isFetchingContainers,
    error: ContainerErrorResponse,
  } = useContainers();

  useEffect(() => {
    const { supplier_id: supplierId } = location.state.supplier;
    const fetchInitialData = async () => {
      await fetchSupplier(supplierId);
      await fetchContainersBySupplier(supplierId);
    };
    fetchInitialData();
  }, [
    supplier?.supplier_id,
    fetchSupplier,
    fetchContainersBySupplier,
    location.state.supplier,
  ]);

  useEffect(() => {
    if (supplier) {
      if (sessionSupplier) {
        if (sessionSupplier.supplier_id !== supplier.supplier_id) {
          setSupplierSession(supplier);
          return;
        }
      }
      setSupplierSession(supplier);
    }
  }, [sessionSupplier?.supplier_id, supplier?.supplier_id]);

  const httpErrors = [
    SupplierErrorResponse?.httpStatus,
    ContainerErrorResponse?.httpStatus,
  ];
  if (httpErrors.includes(500)) {
    const ErrorResponse = SupplierErrorResponse || ContainerErrorResponse;
    if (ErrorResponse) return <RenderServerError {...ErrorResponse} />;
  }

  if (isFetchingContainers || isFetchingSupplier || !supplier) {
    return <div className="border p-2 flex justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="w-full">
        <Button
          buttonType="secondary"
          onClick={() => navigate("/suppliers", { state: null })}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>

      <div className="h-full">
        <div className="flex flex-grow gap-2">
          <div className="w-2/6 border rounded shadow-md p-4 h-full">
            <ProfileDetails
              title={supplier.name}
              profile={supplier}
              excludedProperties={["supplier_id", "updated_at"]}
              renamedProperties={{ created_at: "Date added" }}
            />
          </div>

          <div className="w-5/6 border p-4 h-full">
            <div className="flex justify-between items-center w-full p-2">
              <h1 className="text-3xl font-bold">Container List</h1>
              <Button
                buttonType="primary"
                onClick={() => navigate("/containers/create")}
              >
                Add Container
              </Button>
            </div>
            <Table
              data={containersBySupplier}
              loading={isFetchingContainers}
              onRowClick={(container: BaseContainer) =>
                navigate(`/containers/${container.container_id}`, {
                  state: { container },
                })
              }
              rowKeys={["barcode", "container_num", "num_of_items"]}
              columnHeaders={["Barcode", "Container Number", "Number of Items"]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SupplierProfile;
