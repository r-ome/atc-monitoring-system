import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table } from "../../../components";
import { useSuppliers } from "../../../context/SupplierProvider/SupplierContext";
import { useContainers } from "../../../context/ContainerProvider/ContainerContext";
import { Container } from "../../../types";
import { useSession } from "../../hooks";

const SupplierProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    supplier,
    fetchSupplier,
    isLoading: isFetchingSupplier,
  } = useSuppliers();
  const {
    containersBySupplier,
    fetchContainersBySupplier,
    isLoading: isFetchingContainersBySupplier,
  } = useContainers();
  const [sessionSupplier, setSupplierSession] = useSession<any>(
    "supplier",
    null
  );

  useEffect(() => {
    const { supplier_id: supplierId } = location.state.supplier;
    if (!supplier || supplier.supplier_id !== supplierId) {
      const fetchInitialData = async () => {
        await fetchSupplier(supplierId);
        await fetchContainersBySupplier(supplierId);
      };
      fetchInitialData();
    }
  }, [location.state.supplier.supplier_id, supplier]);

  useEffect(() => {
    const currentSessionSupplier = sessionSupplier;
    if (supplier) {
      if (currentSessionSupplier) {
        if (currentSessionSupplier.supplier_id !== supplier.supplier_id) {
          setSupplierSession(supplier);
        }
      }
      setSupplierSession(supplier);
    }
  }, [supplier]);

  const renderProfileDetails = (supplier: any) => {
    let supplierDetails = supplier;
    let profileDetails = [];
    for (let key in supplierDetails) {
      let label = key;
      if (label === "created_at") label = "Date created";
      if (label === "updated_at") label = "Last updated at";
      label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
      profileDetails.push({ label, value: supplierDetails[key] });
    }

    return (
      <>
        {profileDetails
          .filter((item) =>
            ["supplier id", "name"].includes(item.label.toLowerCase())
          )
          .map((item, i) => {
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
          onClick={() => navigate("/suppliers", { state: null })}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>

      {!isFetchingSupplier && supplier ? (
        <div className="h-full">
          <div className="flex flex-grow gap-2">
            <div className="w-2/6 border rounded shadow-md p-4 h-full">
              <h1 className="text-3xl font-bold">{supplier?.name}</h1>
              <div className="flex mt-4">
                <div className="flex-col w-full gap-4">
                  {renderProfileDetails(supplier)}
                </div>
              </div>
            </div>

            <div className="w-5/6 border p-4 h-full">
              <div className="flex justify-end w-full p-2">
                <Button
                  buttonType="primary"
                  onClick={() => navigate("/containers/create")}
                >
                  Add Container
                </Button>
              </div>
              <Table
                data={containersBySupplier?.containers || []}
                loading={isFetchingContainersBySupplier}
                onRowClick={(container: Container) =>
                  navigate(`/containers/${container.container_id}`, {
                    state: { container },
                  })
                }
                rowKeys={["barcode", "container_num", "num_of_items"]}
                columnHeaders={[
                  "Barcode",
                  "Container Number",
                  "Number of Items",
                ]}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="border p-2 flex justify-center">Loading...</div>
      )}
    </>
  );
};

export default SupplierProfile;
