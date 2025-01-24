import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Supplier } from "../../../types";
import { Button, Table } from "../../../components";
import { useSuppliers } from "../../../context/SupplierProvider/SupplierContext";
import { ErrorState } from "../../../types";

const Suppliers = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  }, [error, isLoading]);

  return (
    <div>
      <div className="flex justify-between my-2 items-center">
        <h1 className="text-3xl">Suppliers</h1>
        <div>
          <Button
            buttonType="primary"
            onClick={() => navigate(`/suppliers/create`)}
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
        rowKeys={["name", "supplier_code", "created_at", "updated_at"]}
        columnHeaders={[
          "Name",
          "Supplier Code",
          "Date Created",
          "Last Date Updated",
        ]}
      />
    </div>
  );
};

export default Suppliers;
