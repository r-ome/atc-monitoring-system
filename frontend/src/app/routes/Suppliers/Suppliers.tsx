import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Supplier } from "../../../types";
import { Modal, Input, Button, Table } from "../../../components";
import { useSuppliers } from "../../../context/SupplierProvider/SupplierContext";
import { ErrorState } from "../../../types";

const Suppliers = () => {
  const navigate = useNavigate();
  const [showCreateSupplierModal, setShowCreateSupplierModal] =
    useState<boolean>(false);
  const { error, suppliers, isLoading, fetchSuppliers, createSuppliers } =
    useSuppliers();
  const [errorState, setErrorState] = useState<ErrorState>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (error && error.code === 400) {
      setErrorState(error.errors[0]);
    }

    if (!isLoading && !error) {
      setShowCreateSupplierModal(false);
      setErrorState(null);
    }
  }, [error, isLoading]);

  const handleSubmitCreateSupplier = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createSuppliers(formData);
  };

  return (
    <div>
      <div className="flex justify-between my-2 items-center">
        <h1 className="text-3xl">Suppliers</h1>
        <div>
          <Button
            buttonType="primary"
            onClick={() => setShowCreateSupplierModal(!showCreateSupplierModal)}
          >
            Create Supplier
          </Button>
        </div>
      </div>

      <Table
        data={suppliers}
        loading={isLoading}
        onRowClick={(supplier: Supplier) =>
          navigate(`/suppliers/${supplier.supplier_id}`, {
            state: { supplier },
          })
        }
        rowKeys={[
          "name",
          "supplier_code",
          "japanese_name",
          "num_of_containers",
          "shipper",
          "created_at",
          "updated_at",
        ]}
        columnHeaders={[
          "Name",
          "Supplier Code",
          "Japanese Name",
          "Number of Container",
          "Shipper",
          "Date Created",
          "Last Date Updated",
        ]}
      />
      <Modal
        isOpen={showCreateSupplierModal}
        title="Create Supplier"
        setShowModal={() => setShowCreateSupplierModal(false)}
      >
        <>
          <form id="create_supplier" onSubmit={handleSubmitCreateSupplier}>
            <Input
              id="name"
              name="name"
              placeholder="Supplier Name"
              label="Supplier Name:"
              error={errorState}
            />
            <Input
              id="japanese_name"
              name="japanese_name"
              placeholder="Japanese Name"
              label="Japanese Name: "
              error={errorState}
            />
            <Input
              id="supplier_code"
              name="supplier_code"
              placeholder="Code"
              label="Supplier Code:"
              error={errorState}
            />
            <Input
              id="num_of_containers"
              name="num_of_containers"
              type="number"
              placeholder="Number of Containers"
              label="Number of Containers:"
              error={errorState}
            />
            <Input
              id="shipper"
              name="shipper"
              placeholder="Shipper"
              label="Shipper:"
              error={errorState}
            />
            <div className="flex justify-end gap-2">
              <Button
                buttonType="secondary"
                onClick={() => setShowCreateSupplierModal(false)}
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
  );
};

export default Suppliers;
