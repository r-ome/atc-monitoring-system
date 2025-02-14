import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Supplier } from "../../../types";
import { Button, Table } from "@components";
import { useSuppliers } from "@context/SupplierProvider/SupplierContext";
import RenderServerError from "../ServerCrashComponent";

const Suppliers = () => {
  const navigate = useNavigate();
  const { error, suppliers, isLoading, fetchSuppliers } = useSuppliers();

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSuppliers();
    };
    fetchInitialData();
  }, [fetchSuppliers]);

  if (error?.httpStatus === 500) {
    return <RenderServerError {...error} />;
  }

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
