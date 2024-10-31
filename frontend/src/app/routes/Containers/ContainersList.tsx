import { useState, useEffect } from "react";
import {
  Button,
  Table,
  Input,
  Modal,
  Select,
  DatePicker,
} from "../../../components";
import { useNavigate } from "react-router-dom";
import { Container, ErrorState } from "../../../types";
import { useContainers, useSuppliers, useBranches } from "../../../context";

const ContainersList = () => {
  const navigate = useNavigate();
  const [showCreateContainerModal, setShowCreateContainerModal] =
    useState<boolean>(false);
  const { branches, getBranches } = useBranches();
  const { suppliers, fetchSuppliers } = useSuppliers();
  const { containers, error, isLoading, getContainers, createContainer } =
    useContainers();
  const [ETAToPH, setETAToPH] = useState<Date | null>(new Date());
  const [departure_date_from_japan, setDeparture_date_from_japan] =
    useState<Date | null>(new Date());
  const [arrivalDate, setArrivalDate] = useState<Date | null>(new Date());
  const [telegraphicTransferred, setTelegraphicTransferred] =
    useState<Date | null>(new Date());
  const [sortingDate, setSortingDate] = useState<Date | null>(new Date());
  const [auctionDate, setAuctionDate] = useState<Date | null>(new Date());
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  const [devanningDate, setDevanningDate] = useState<Date | null>(new Date());
  const [vanningDate, setVanningDate] = useState<Date | null>(new Date());
  const [auctionOrSell, setAuctionOrSell] = useState<{
    value: string;
    label: string;
  }>({ value: "AUCTION", label: "Auction" });
  const [supplier, setSupplier] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [branch, setBranch] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [errorState, setErrorState] = useState<ErrorState>(null);

  useEffect(() => {
    getBranches();
    getContainers();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (error && error.code === 400) {
      setErrorState(error.errors[0]);
    }

    if (!isLoading && !error) {
      setShowCreateContainerModal(false);
    }
  }, [error, isLoading]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("branch_id", branch?.value!);
    formData.append("auction_or_sell", auctionOrSell.value);
    createContainer(supplier?.value, formData);
  };

  return (
    <div>
      <div className="flex justify-between my-2 items-center">
        <h1 className="text-3xl">Containers</h1>
        <div>
          <Button
            buttonType="primary"
            onClick={() =>
              setShowCreateContainerModal(!showCreateContainerModal)
            }
          >
            Create Container
          </Button>
        </div>
      </div>

      <div className="overflow-auto">
        <Table
          data={containers}
          loading={isLoading}
          onRowClick={(container: Container) =>
            navigate(`/containers/${container.container_id}`, {
              state: { container },
            })
          }
          rowKeys={[
            "name",
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
            "Supplier",
            "Barcode",
            "Container Number",
            "Departure Date",
            "BL Number",
            "Port",
            "ETA to Philippines",
            "Carrier",
            "No. of Items",
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
        isOpen={showCreateContainerModal}
        title="Create Container"
        setShowModal={() => setShowCreateContainerModal(false)}
      >
        {suppliers.length ? (
          <>
            <form id="create_container" onSubmit={handleSubmit}>
              <div className="flex gap-2 w-full">
                <div className="w-1/2">
                  <Select
                    label="Supplier:"
                    name="supplier_id"
                    primaryColor="blue"
                    value={supplier}
                    options={suppliers.map((item) => ({
                      value: item.supplier_id.toString(),
                      label: item.name,
                    }))}
                    onChange={(value: any) => setSupplier(value)}
                    error={errorState}
                  />
                </div>
                <div className="w-1/2">
                  <Select
                    label="Branch:"
                    name="branch_id"
                    primaryColor="blue"
                    value={branch}
                    options={branches.map((item) => ({
                      value: item.branch_id.toString(),
                      label: item.name,
                    }))}
                    onChange={(value: any) => setBranch(value)}
                    error={errorState}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <div className="flex flex-col">
                    <label>Payment Date:</label>
                    <DatePicker
                      selected={paymentDate}
                      id="payment_date"
                      name="payment_date"
                      onChange={(date) => setPaymentDate(date)}
                      disabled={isLoading}
                      className="border rounded pl-2 cursor-pointer w-full h-11"
                      error={errorState}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label>ETA to PH:</label>
                    <DatePicker
                      id="eta_to_ph"
                      name="eta_to_ph"
                      selected={ETAToPH}
                      className="border rounded pl-2 cursor-pointer w-full h-11"
                      onChange={(date: Date | null) => setETAToPH(date)}
                      error={errorState}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label>Departure Date from Japan:</label>
                    <DatePicker
                      id="departure_date_from_japan"
                      name="departure_date_from_japan"
                      selected={departure_date_from_japan}
                      className="border rounded pl-2 cursor-pointer w-full h-11"
                      onChange={(date: Date | null) =>
                        date ? setDeparture_date_from_japan(date) : null
                      }
                      error={errorState}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label>Arrival Date to PH Warehouse:</label>
                    <DatePicker
                      selected={arrivalDate}
                      id="arrival_date_warehouse_ph"
                      name="arrival_date_warehouse_ph"
                      onChange={(date) => setArrivalDate(date)}
                      disabled={isLoading}
                      className="border rounded pl-2 cursor-pointer w-full h-11"
                      error={errorState}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label>Sorting Date:</label>
                    <DatePicker
                      selected={sortingDate}
                      id="sorting_date"
                      name="sorting_date"
                      onChange={(date) => setSortingDate(date)}
                      className="border rounded pl-2 cursor-pointer w-full h-11"
                      error={errorState}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label>Auction Date:</label>
                    <DatePicker
                      selected={auctionDate}
                      id="auction_date"
                      name="auction_date"
                      onChange={(date) => setAuctionDate(date)}
                      className="border rounded pl-2 cursor-pointer w-full h-11"
                      error={errorState}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label>Vanning Date:</label>
                    <DatePicker
                      selected={vanningDate}
                      id="vanning_date"
                      name="vanning_date"
                      onChange={(date) => setVanningDate(date)}
                      className="border rounded pl-2 cursor-pointer w-full h-11"
                      error={errorState}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label>Devanning Date:</label>
                    <DatePicker
                      selected={devanningDate}
                      id="devanning_date"
                      name="devanning_date"
                      onChange={(date) => setDevanningDate(date)}
                      className="border rounded pl-2 cursor-pointer w-full h-11"
                      error={errorState}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label>Telegraphic Transferred:</label>
                    <DatePicker
                      selected={telegraphicTransferred}
                      id="telegraphic_transferred"
                      name="telegraphic_transferred"
                      onChange={(date) => setTelegraphicTransferred(date)}
                      className="border rounded pl-2 cursor-pointer w-full h-11"
                      error={errorState}
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
                    error={errorState}
                  />
                  <Input
                    id="bill_of_lading_number"
                    name="bill_of_lading_number"
                    placeholder="Bill of Lading"
                    label="Bill of Lading: "
                    error={errorState}
                  />
                  <Input
                    id="port_of_landing"
                    name="port_of_landing"
                    placeholder="Port of Landing"
                    label="Port of Landing:"
                    disabled={isLoading}
                    error={errorState}
                  />
                  <Input
                    id="carrier"
                    name="carrier"
                    placeholder="Carrier"
                    label="Carrier:"
                    disabled={isLoading}
                    error={errorState}
                  />
                  <Input
                    id="vessel"
                    name="vessel"
                    placeholder="Vessel"
                    label="Vessel:"
                    disabled={isLoading}
                    error={errorState}
                  />
                  <Input
                    id="invoice_num"
                    name="invoice_num"
                    placeholder="Invoice Number"
                    label="Invoice Number:"
                    disabled={isLoading}
                    error={errorState}
                  />
                  <Input
                    id="gross_weight"
                    name="gross_weight"
                    placeholder="Gross Weight"
                    label="Gross Weight:"
                    disabled={isLoading}
                    error={errorState}
                  />
                  <div className="flex flex-col">
                    <Select
                      label="Auction or Sell:"
                      name="auction_or_sell"
                      primaryColor="blue"
                      value={auctionOrSell}
                      options={[
                        { value: "AUCTION", label: "Auction" },
                        { value: "SELL", label: "Sell" },
                      ]}
                      onChange={(value: any) => {
                        setAuctionOrSell(value);
                      }}
                      error={errorState}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  buttonType="secondary"
                  onClick={() => setShowCreateContainerModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  buttonType="primary"
                  type="submit"
                  className="w-24"
                  disabled={isLoading}
                >
                  Save
                </Button>
              </div>
            </form>
          </>
        ) : null}
      </Modal>
    </div>
  );
};

export default ContainersList;
