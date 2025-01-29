import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Supplier } from "../../../types";
import { Button, Table } from "../../../components";
import { useSuppliers } from "../../../context/SupplierProvider/SupplierContext";
import { SUPPLIERS_501 } from "../errors";

const Suppliers = () => {
  const navigate = useNavigate();
  const { errors, suppliers, isLoading, fetchSuppliers } = useSuppliers();

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSuppliers();
    };
    fetchInitialData();
  }, []);

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

      {errors?.error === SUPPLIERS_501 ? (
        <div className="border p-2 rounded border-red-500 mb-10">
          <h1 className="text-red-500 text-xl flex justify-center">
            Please take a look back later...
          </h1>
        </div>
      ) : null}

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
