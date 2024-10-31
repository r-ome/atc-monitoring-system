import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Input, Table, Modal } from "../../../components";
import { useSuppliers } from "../../../context/SupplierProvider/SupplierContext";
import { useContainers } from "../../../context/ContainerProvider/ContainerContext";
import { Container, ErrorState } from "../../../types";

const SupplierProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUpdateSupplierModal, setShowUpdateSupplierModal] =
    useState<boolean>(false);
  const {
    error,
    isLoading,
    supplier: fetchedSupplier,
    fetchSupplier,
    updateSupplier,
  } = useSuppliers();
  const {
    containersBySupplier,
    isLoading: isFetchingContainersLoading,
    getContainersBySupplier,
  } = useContainers();
  const [supplier, setSupplier] = useState(location.state.supplier);
  const [errorState, setErrorState] = useState<ErrorState>(null);

  const [formState, setFormState] = useState({
    name: supplier.name,
    japanese_name: supplier.japanese_name,
    supplier_code: supplier.supplier_code,
    num_of_containers: supplier.num_of_containers,
    shipper: supplier.shipper,
  });

  useEffect(() => {
    if (error && error.code === 400) {
      setErrorState(error.errors[0]);
    }

    if (!isLoading && !error) {
      setShowUpdateSupplierModal(false);
      setErrorState(null);
    }
  }, [error, isLoading]);

  useEffect(() => {
    getContainersBySupplier(supplier.supplier_id);
    fetchSupplier(location.state.supplier.supplier_id);
  }, []);

  useEffect(() => {
    if (fetchedSupplier) {
      setSupplier(fetchedSupplier);
      setFormState({
        name: fetchedSupplier.name,
        japanese_name: fetchedSupplier.japanese_name,
        supplier_code: fetchedSupplier.supplier_code,
        num_of_containers: fetchedSupplier.num_of_containers,
        shipper: fetchedSupplier.shipper,
      });
    }
  }, [fetchedSupplier]);

  const handleUpdateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateSupplier(supplier.supplier_id, formState);
    setSupplier((prev: any) => ({ ...prev, ...formState }));
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

      <div className="border rounded h-full p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl">{supplier.name}</h1>
            {/* <h1 className="text-2xl">{supplier.japanese_name}</h1> */}
            <h1 className="text-2xl">{supplier.supplier_code}</h1>
          </div>
          <div className="w-40">
            <Button
              className="text-blue-500 w-full"
              onClick={() => {
                setShowUpdateSupplierModal(true);
              }}
            >
              Edit Supplier
            </Button>
          </div>
        </div>

        <div className="rounded mt-4 overflow-auto">
          <Table
            data={containersBySupplier}
            loading={isFetchingContainersLoading}
            onRowClick={(container: Container) =>
              navigate(`/containers/${container.container_id}`, {
                state: { container },
              })
            }
            rowKeys={[
              "barcode",
              "container_num",
              "departure_date_from_japan",
              "bill_of_lading_number",
              "port_of_landing",
              "eta_to_ph",
              "carrier",
              "num_of_items",
              "sorting_date",
              "auction_date",
              "gross_weight",
              "vanning_date",
              "devanning_date",
              "vessel",
              "auction_or_sell",
              "telegraphic_transferred",
            ]}
            columnHeaders={[
              "Barcode",
              "Container Number",
              "Departure Date",
              "BL Number",
              "Port",
              "ETA to Philippines",
              "Carrier",
              "Items",
              "Sorting Date",
              "Auction Date",
              "Gross Weight",
              "Vanning Date",
              "Devanning Date",
              "vessel",
              "Auction or Sell",
              "telegraphic transferred",
            ]}
          />
        </div>

        <Modal
          isOpen={showUpdateSupplierModal}
          title="Update Supplier"
          setShowModal={() => setShowUpdateSupplierModal(false)}
        >
          <>
            <form id="update_supplier" onSubmit={handleSubmit}>
              <Input
                id="name"
                name="name"
                placeholder="Supplier Name"
                label="Supplier Name:"
                value={formState.name || ""}
                onChange={handleUpdateField}
                error={errorState}
              />
              <Input
                id="japanese_name"
                name="japanese_name"
                placeholder="Japanese Name"
                label="Japanese Name: "
                value={formState.japanese_name || ""}
                onChange={handleUpdateField}
                error={errorState}
              />
              {/* question: if barcode can still be updated based on business requirements */}
              {/* <Input
                id="supplier_code"
                name="supplier_code"
                placeholder="Code"
                label="Supplier Code:"
                value={formState.supplier_code || ""}
                onChange={handleUpdateField}
                error={errorState}
              /> */}
              <Input
                id="num_of_containers"
                name="num_of_containers"
                type="number"
                placeholder="Number of Containers"
                value={formState.num_of_containers || ""}
                onChange={handleUpdateField}
                label="Number of Containers:"
                error={errorState}
              />
              <Input
                id="shipper"
                name="shipper"
                placeholder="Shipper"
                label="Shipper:"
                value={formState.shipper || ""}
                onChange={handleUpdateField}
                error={errorState}
              />
              <div className="flex justify-end gap-2">
                <Button
                  buttonType="secondary"
                  onClick={() => setShowUpdateSupplierModal(false)}
                >
                  Cancel
                </Button>
                <Button buttonType="primary" type="submit" className="w-24">
                  Save
                </Button>
              </div>
            </form>
          </>
        </Modal>
      </div>
    </>
  );
};

export default SupplierProfile;
