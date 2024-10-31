import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input, Table, Modal } from "../../../components";
import { useContainers, useInventories, useBranches } from "../../../context";
import DatePicker from "react-datepicker";
import Select from "react-tailwindcss-select";
import { Branch } from "../../../types";
import { SelectValue } from "react-tailwindcss-select/dist/components/type";

const ContainerProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { container } = location.state;
  const {
    inventoriesByContainer,
    isLoading: inventoriesIsLoading,
    error: inventoriesError,
    getInventoriesByContainer,
    addInventoryToContainer,
  } = useInventories();
  const { branches, isLoading: isBranchesLoading, getBranches } = useBranches();
  const { updateContainer } = useContainers();

  const [showUpdateContainerModal, setShowUpdateContainerModal] =
    useState<boolean>(false);
  const [showAddInventoryModal, setShowAddInventoryModal] =
    useState<boolean>(false);

  const [selectedBranch, setSelectedBranch] = useState<SelectValue>();
  const [formState, setFormState] = useState({
    branch_id: container.branch_id,
    eta_to_ph: new Date(container.eta_to_ph),
    sorting_date: new Date(container.sorting_date),
    auction_date: new Date(container.auction_date),
    payment_date: new Date(container.payment_date),
    vanning_date: new Date(container.vanning_date),
    devanning_date: new Date(container.devanning_date),
    departure_date_from_japan: new Date(container.departure_date_from_japan),
    arrival_date_warehouse_ph: new Date(container.arrival_date_warehouse_ph),
    telegraphic_transferred: new Date(container.telegraphic_transferred),
    auction_or_sell: container.auction_or_sell,
    gross_weight: container.gross_weight,
    invoice_num: container.invoice_num,
    vessel: container.vessel,
    carrier: container.carrier,
    port_of_landing: container.port_of_landing,
    bill_of_lading_number: container.bill_of_lading_number,
    container_num: container.container_num,
  });
  const [errorState, setErrorState] = useState<
    undefined | null | { field: string; message: string }
  >();

  useEffect(() => {
    if (inventoriesError) {
      setErrorState(inventoriesError[0]);
    }

    if (!inventoriesIsLoading && !inventoriesError) {
      setShowAddInventoryModal(false);
    }
  }, [inventoriesError, inventoriesIsLoading]);

  useEffect(() => {
    const fetchBranches = async () => {
      await getInventoriesByContainer(
        container.supplier_id,
        container.container_id
      );
      await getBranches();
    };
    fetchBranches();
  }, [container.supplier_id, container.container_id]);

  useEffect(() => {
    if (branches.length) {
      const branch = branches
        .map((branch: Branch) => ({
          value: branch.branch_id.toString(),
          label: branch.name,
        }))
        .find((branch) => branch?.value === container.branch_id.toString());
      if (branch !== undefined) {
        setSelectedBranch(branch);
      }
    }
  }, [branches, container.branch_id]);

  const handleUpdateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateContainer(container.supplier_id, container.container_id, formState);
    setShowUpdateContainerModal(false);
  };

  const handleAddInventory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let barcodeNumber = formData.get("barcode_number")?.toString();
    barcodeNumber = `${container.barcode}-${barcodeNumber}`;
    const description = formData.get("description") as string;
    const controlNumber = formData.get("control_number");
    formData.delete("barcode_number");
    formData.delete("description");
    formData.append("barcode_number", barcodeNumber);
    formData.append("description", description.toUpperCase());

    const barcodeNumberExists = inventoriesByContainer.filter(
      (inventory) => inventory.barcode_number === barcodeNumber
    );

    const controlNumberExists = inventoriesByContainer.filter(
      (inventory) => inventory.control_number === controlNumber
    );

    if (barcodeNumberExists.length) {
      setErrorState({
        field: "barcode_number",
        message: "Barcode number already exists",
      });
      return;
    }

    if (controlNumberExists.length) {
      setErrorState({
        field: "control_number",
        message: "Control number already exists",
      });
      return;
    }

    await addInventoryToContainer(
      container.supplier_id,
      container.container_id,
      formData
    );

    await getInventoriesByContainer(
      container.supplier_id,
      container.container_id
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
      <div className="border rounded h-full p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl">Supplier: {container.name}</h1>
            <h1 className="text-2xl">{container.barcode}</h1>
            <h1 className="text-2xl">Inventory</h1>
          </div>
          <div className="flex flex-col gap-2 w-40">
            <div>
              <Button
                className="text-blue-500 w-full"
                onClick={() => {
                  setShowUpdateContainerModal(true);
                }}
              >
                Edit Container
              </Button>
            </div>
            <div>
              <Button
                className="w-full"
                onClick={() => {
                  setShowAddInventoryModal(true);
                }}
              >
                Add Inventory
              </Button>
            </div>
          </div>
        </div>
        <div className="rounded mt-4 overflow-auto">
          <Table
            data={inventoriesByContainer}
            loading={inventoriesIsLoading}
            rowKeys={[
              "barcode_number",
              "control_number",
              "description",
              "price",
              "qty",
              "status",
              "created_at",
            ]}
            columnHeaders={[
              "barcode",
              "control number",
              "description",
              "price",
              "qty",
              "status",
              "Created at",
            ]}
          />
        </div>

        <Modal
          isOpen={showUpdateContainerModal}
          title="Update Container"
          setShowModal={() => setShowUpdateContainerModal(false)}
        >
          {!isBranchesLoading ? (
            <>
              <form id="create_container" onSubmit={handleSubmit}>
                <div className="flex gap-2 w-full">
                  <div className="h-20 w-1/2">
                    <label>Supplier:</label>
                    <Input
                      value={container.name}
                      className="cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div className="h-20 w-1/2">
                    <label>Branch:</label>
                    <Select
                      primaryColor="blue"
                      value={selectedBranch!}
                      options={branches.map((item) => ({
                        value: item.branch_id.toString(),
                        label: item.name,
                      }))}
                      onChange={(value: any) => {
                        setSelectedBranch(value);
                        setFormState({ ...formState, branch_id: value.value });
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <div className="h-20 flex flex-col">
                      <label>Payment Date:</label>
                      <DatePicker
                        selected={new Date(formState.payment_date)}
                        id="payment_date"
                        name="payment_date"
                        onChange={(date) =>
                          setFormState({
                            ...formState,
                            payment_date: date ?? new Date(),
                          })
                        }
                        className="border rounded pl-2 cursor-pointer w-full h-11"
                      />
                    </div>
                    <div className="h-20 flex flex-col">
                      <label>ETA to PH:</label>
                      <DatePicker
                        id="eta_to_ph"
                        name="eta_to_ph"
                        selected={new Date(formState.eta_to_ph)}
                        className="border rounded pl-2 cursor-pointer w-full h-11"
                        onChange={(date: Date | null) =>
                          setFormState({
                            ...formState,
                            eta_to_ph: date ?? new Date(),
                          })
                        }
                      />
                    </div>
                    <div className="h-20 flex flex-col">
                      <label>Departure Date fro Japan:</label>
                      <DatePicker
                        id="departure_date_from_japan"
                        name="departure_date_from_japan"
                        selected={new Date(formState.departure_date_from_japan)}
                        className="border rounded pl-2 cursor-pointer w-full h-11"
                        onChange={(date: Date | null) =>
                          setFormState({
                            ...formState,
                            departure_date_from_japan: date ?? new Date(),
                          })
                        }
                      />
                    </div>
                    <div className="h-20 flex flex-col">
                      <label>Arrival Date to PH Warehouse:</label>
                      <DatePicker
                        selected={new Date(formState.arrival_date_warehouse_ph)}
                        id="arrival_date_warehouse_ph"
                        name="arrival_date_warehouse_ph"
                        onChange={(date) =>
                          setFormState({
                            ...formState,
                            arrival_date_warehouse_ph: date ?? new Date(),
                          })
                        }
                        className="border rounded pl-2 cursor-pointer w-full h-11"
                      />
                    </div>

                    <div className="h-20 flex flex-col">
                      <label>Sorting Date:</label>
                      <DatePicker
                        selected={new Date(formState.sorting_date)}
                        id="sorting_date"
                        name="sorting_date"
                        onChange={(date) =>
                          setFormState({
                            ...formState,
                            sorting_date: date ?? new Date(),
                          })
                        }
                        className="border rounded pl-2 cursor-pointer w-full h-11"
                      />
                    </div>
                    <div className="h-20 flex flex-col">
                      <label>Auction Date:</label>
                      <DatePicker
                        selected={new Date(formState.auction_date)}
                        id="auction_date"
                        name="auction_date"
                        onChange={(date) =>
                          setFormState({
                            ...formState,
                            auction_date: date ?? new Date(),
                          })
                        }
                        className="border rounded pl-2 cursor-pointer w-full h-11"
                      />
                    </div>

                    <div className="h-20 flex flex-col">
                      <label>Vanning Date:</label>
                      <DatePicker
                        selected={new Date(formState.vanning_date)}
                        id="vanning_date"
                        name="vanning_date"
                        onChange={(date) =>
                          setFormState({
                            ...formState,
                            vanning_date: date ?? new Date(),
                          })
                        }
                        className="border rounded pl-2 cursor-pointer w-full h-11"
                      />
                    </div>
                    <div className="h-20 flex flex-col">
                      <label>Devanning Date:</label>
                      <DatePicker
                        selected={new Date(formState.devanning_date)}
                        id="devanning_date"
                        name="devanning_date"
                        onChange={(date) =>
                          setFormState({
                            ...formState,
                            devanning_date: date ?? new Date(),
                          })
                        }
                        className="border rounded pl-2 cursor-pointer w-full h-11"
                      />
                    </div>
                    <div className="h-20 flex flex-col">
                      <label>Telegraphic Transferred:</label>
                      <DatePicker
                        selected={new Date(formState.telegraphic_transferred)}
                        id="telegraphic_transferred"
                        name="telegraphic_transferred"
                        onChange={(date) =>
                          setFormState({
                            ...formState,
                            telegraphic_transferred: date ?? new Date(),
                          })
                        }
                        className="border rounded pl-2 cursor-pointer w-full h-11"
                      />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <Input
                      id="container_num"
                      name="container_num"
                      type="number"
                      min={1}
                      placeholder="Container Number"
                      label="Container Number:"
                      value={formState.container_num || ""}
                      onChange={handleUpdateField}
                    />
                    <Input
                      id="bill_of_lading_number"
                      name="bill_of_lading_number"
                      placeholder="Bill of Lading"
                      label="Bill of Lading: "
                      value={formState.bill_of_lading_number || ""}
                      onChange={handleUpdateField}
                    />
                    <Input
                      id="port_of_landing"
                      name="port_of_landing"
                      placeholder="Port of Landing"
                      label="Port of Landing:"
                      value={formState.port_of_landing || ""}
                      onChange={handleUpdateField}
                    />
                    <Input
                      id="carrier"
                      name="carrier"
                      placeholder="Carrier"
                      label="Carrier:"
                      value={formState.carrier || ""}
                      onChange={handleUpdateField}
                    />
                    <Input
                      id="vessel"
                      name="vessel"
                      placeholder="Vessel"
                      label="Vessel:"
                      value={formState.vessel || ""}
                      onChange={handleUpdateField}
                    />
                    <Input
                      id="invoice_num"
                      name="invoice_num"
                      placeholder="Invoice Number"
                      label="Invoice Number:"
                      value={formState.invoice_num || ""}
                      onChange={handleUpdateField}
                    />
                    <Input
                      id="gross_weight"
                      name="gross_weight"
                      placeholder="Gross Weight"
                      label="Gross Weight:"
                      value={formState.gross_weight || ""}
                      onChange={handleUpdateField}
                    />
                    <div className="h-20 flex flex-col">
                      <label>Auction or Sell:</label>
                      <Select
                        primaryColor="blue"
                        value={{
                          value: formState.auction_or_sell,
                          label: formState.auction_or_sell,
                        }}
                        options={[
                          { value: "AUCTION", label: "AUCTION" },
                          { value: "SELL", label: "SELL" },
                        ]}
                        onChange={(selectValue: any) => {
                          setFormState({
                            ...formState,
                            auction_or_sell: selectValue.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    buttonType="secondary"
                    onClick={() => setShowUpdateContainerModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button buttonType="primary" type="submit" className="w-24">
                    Save
                  </Button>
                </div>
              </form>
            </>
          ) : null}
        </Modal>

        <Modal
          isOpen={showAddInventoryModal}
          title="Add Inventory"
          setShowModal={() => setShowAddInventoryModal(false)}
        >
          <form id="add_invenory" onSubmit={handleAddInventory}>
            <div className="flex gap-2">
              <div className="w-full">
                <Input
                  id="barcode_number"
                  type="number"
                  name="barcode_number"
                  placeholder="Barcode Number"
                  label="Barcode Number:"
                  error={errorState}
                />
                <Input
                  id="description"
                  name="description"
                  placeholder="Description"
                  label="Description:"
                  className="uppercase"
                />
                <Input
                  id="control_number"
                  type="number"
                  name="control_number"
                  placeholder="Control Number"
                  label="Control Number:"
                  error={errorState}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                buttonType="secondary"
                onClick={() => setShowAddInventoryModal(false)}
              >
                Cancel
              </Button>
              <Button buttonType="primary" type="submit" className="w-24">
                Save
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default ContainerProfile;
