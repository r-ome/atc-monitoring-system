import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Table,
  Modal,
  Tabs,
  TabContent,
} from "../../../components";
import moment from "moment";
import { useAuction, useBidders } from "../../../context";
import Select from "react-tailwindcss-select";
import { SelectValue } from "react-tailwindcss-select/dist/components/type";
import { Bidder, EncodingSheet, ErrorState } from "../../../types";
import { formatNumberPadding, sanitizeBarcode } from "../../../lib/utils";
import Upload from "rc-upload";
import * as XLSX from "xlsx";

const Monitoring = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auction } = location.state;
  const {
    auction: auctionDetails,
    monitoring,
    isLoading,
    getMonitoring,
    auctionBidders,
    getAuctionBidders,
    uploadMonitoring,
    registerBidderAtAuction,
    fetchAuctionDetails,
    sheetErrors,
    errors,
  } = useAuction();
  const { bidders, fetchBidders } = useBidders();
  const [showRegisterBidderModal, setShowRegisterBidderModal] =
    useState<boolean>(false);
  const [selectedBidder, setSelectedBidder] = useState<SelectValue>();
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [registrationFee, setRegistrationFee] = useState<number>(3000);
  const [showEncodingModal, setShowEncodingModal] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<EncodingSheet[]>([]);
  const [errorState, setErrorState] = useState<ErrorState>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      await getMonitoring(auction.auction_id);
      await getAuctionBidders(auction.auction_id);
      await fetchBidders();
      await fetchAuctionDetails(auction.auction_id);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (sheetErrors) {
      let sheetError = sheetErrors;
      let newSheetData = sheetData.slice();
      for (let row of newSheetData) {
        row.barcode = sanitizeBarcode(row.barcode);
        row.control_number = formatNumberPadding(row.control_number, 4);
        row.description = row.description.toUpperCase();
        let rowError = sheetError.find(
          (i: any) =>
            i.row.barcode === row.barcode &&
            i.row.control_number === row.control_number
        );
        if (rowError) {
          row.status = "FAILED";
          row.message = rowError.message;
        } else {
          row.status = "SUCCESS";
        }
      }
      setSheetData(newSheetData);
    }
  }, [sheetErrors]);

  useEffect(() => {
    if (errors && errors.code === 400) {
      setErrorState(errors.errors[0]);
    }

    if (!isLoading && !errors) {
      setShowRegisterBidderModal(false);
      setErrorState(null);
    }
  }, [isLoading, errors]);

  const handleRegisterBidder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bidder = !Array.isArray(selectedBidder) ? selectedBidder : null;
    const form = {
      bidder_id: bidder?.value,
      service_charge: serviceCharge,
      registration_fee: registrationFee,
    };

    await registerBidderAtAuction(auction.auction_id, form);
    setServiceCharge(0);
    setSelectedBidder(null);
  };

  const uploadEncoding = (options: any) => {
    const { onSuccess, onError, file, onProgress } = options;
    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
      // onUploadProgress: (event) => {
      //   const percent = Math.floor((event.loaded / event.total) * 100);
      //   setProgress(percent);
      //   if (percent === 100) {
      //     setTimeout(() => setProgress(0), 1000);
      //   }
      //   onProgress({ percent: (event.loaded / event.total) * 100 });
      // },
    };
    fmData.append("image", file);
    const yawa = async (file: any) => {
      // uploads *file* data
      // await uploadMonitoring(file);
      await renderSheetData(file);
    };

    try {
      yawa(file);

      // const res = await axios.post(
      //   "https://jsonplaceholder.typicode.com/posts",
      //   fmData,
      //   config
      // );
      // onSuccess("Ok");
      // console.log("server res: ", res);
    } catch (err) {
      // console.log("Eroor: ", err);
      // const error = new Error("Some error");
      // onError({ err });
    }
  };

  const renderSheetData = async (file: any) => {
    const bstr = await file.arrayBuffer();
    const wb = XLSX.read(bstr, { type: "binary" });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json<EncodingSheet>(ws, {
      header: [
        "barcode",
        "control_number",
        "description",
        "bidder",
        "qty",
        "price",
        "manifest_number",
      ],
    });

    if (data) {
      setSheetData(data.slice(1));
      await uploadMonitoring(data.slice(1));
    }
  };
  console.log(monitoring);

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
            <h1 className="text-2xl">
              {moment(auction.created_at).format("MMM DD, YYYY dddd")}{" "}
              Monitoring
            </h1>
          </div>
        </div>

        <Tabs
          tabs={[
            { page: "bidders", label: "Bidders" },
            { page: "monitoring", label: "Monitoring" },
          ]}
          tabContent={({ current }) => (
            <>
              <TabContent current={current} tabCategory="monitoring">
                <div className="flex flex-col gap-2">
                  <div className="rounded mt-4 p-4 w-full border roverflow-auto">
                    <div className="flex justify-between">
                      <div>
                        <h1 className="text-3xl">Monitoring</h1> <br />
                        {auctionDetails.total_price ? (
                          <h1 className="text-2xl">
                            Total: Php {auctionDetails.total_price}
                          </h1>
                        ) : null}
                        {auctionDetails.total_bidders ? (
                          <h1 className="text-2xl">
                            Number of Bidders: {auctionDetails.total_bidders}
                          </h1>
                        ) : null}
                      </div>
                      <div>
                        <Button onClick={() => setShowEncodingModal(true)}>
                          Encode
                        </Button>
                      </div>
                    </div>

                    <Modal
                      title="Encode"
                      isOpen={showEncodingModal}
                      setShowModal={setShowEncodingModal}
                    >
                      <div className="w-full">
                        <div className="flex justify-center">
                          <Button>
                            <Upload
                              className="p-2"
                              multiple={false}
                              customRequest={uploadEncoding}
                            >
                              Upload files here
                            </Upload>
                          </Button>
                        </div>

                        <div className="w-full mt-10">
                          <div>NUMBER OF ITEMS: {sheetData.length}</div>
                          <Table
                            columnHeaders={[
                              "Barcode",
                              "Control #",
                              "Description",
                              "Bidder",
                              "QTY",
                              "Price",
                              "Manifest Number",
                              "Status",
                              "Message",
                            ]}
                            data={sheetData}
                            loading={false}
                            rowKeys={[
                              "barcode",
                              "control_number",
                              "description",
                              "bidder",
                              "qty",
                              "price",
                              "manifest_number",
                              "status",
                              "message",
                            ]}
                          ></Table>
                        </div>
                      </div>
                    </Modal>

                    <div className="mt-4">
                      <Table
                        data={monitoring}
                        loading={isLoading}
                        onRowClick={(inventory) =>
                          navigate(
                            `/inventories/${inventory.auction_inventory_id}`,
                            {
                              state: { inventory },
                            }
                          )
                        }
                        rowKeys={[
                          "barcode_number",
                          "control_number",
                          "description",
                          "price",
                          "qty",
                          "bidder_number",
                          "status",
                          "manifest_number",
                        ]}
                        columnHeaders={[
                          "barcode",
                          "control number",
                          "description",
                          "price",
                          "qty",
                          "bidder number",
                          "status",
                          "manifest",
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </TabContent>
              <TabContent current={current} tabCategory="bidders">
                <div className="rounded mt-4 p-4 w-full border roverflow-auto">
                  <div className="flex justify-between">
                    <div>
                      <h1 className="text-3xl">Bidders</h1>
                    </div>
                    <div>
                      <Button onClick={() => setShowRegisterBidderModal(true)}>
                        Register Bidder
                      </Button>
                    </div>
                  </div>

                  <Table
                    data={auctionBidders}
                    loading={isLoading}
                    onRowClick={(bidder) =>
                      navigate(`/bidders/${bidder.bidder_id}`, {
                        state: { bidder },
                      })
                    }
                    rowKeys={[
                      "bidder_number",
                      "first_name",
                      "last_name",
                      "registration_fee",
                      "service_charge",
                      "num_of_items",
                      "total_price",
                    ]}
                    columnHeaders={[
                      "bidder number",
                      "first name",
                      "last name",
                      "registration fee (Php)",
                      "service charge (%)",
                      "number of items",
                      "total",
                    ]}
                  />

                  <Modal
                    isOpen={showRegisterBidderModal}
                    title="Register Bidder"
                    setShowModal={() => setShowRegisterBidderModal(false)}
                  >
                    <>
                      <form
                        id="update_supplier"
                        onSubmit={handleRegisterBidder}
                      >
                        <div className="h-20 w-full">
                          <label>Bidder:</label>
                          <Select
                            primaryColor="blue"
                            value={selectedBidder!}
                            options={bidders
                              .filter(
                                (bidder) =>
                                  !auctionBidders.some(
                                    (a) => a.bidder_id === bidder.bidder_id
                                  )
                              )
                              .map((bidder: Bidder) => ({
                                value: bidder.bidder_id.toString(),
                                label: `${bidder.bidder_number} - ${bidder.first_name} ${bidder.last_name}`,
                              }))}
                            onChange={(value: any) => {
                              setSelectedBidder(value);
                              const serviceCharge = bidders.filter(
                                (bidder) =>
                                  bidder.bidder_id === parseInt(value.value)
                              )[0].service_charge;
                              setServiceCharge(serviceCharge);
                            }}
                          />
                        </div>
                        {/* <Input
                          id="service_charge"
                          name="service_charge"
                          placeholder="Service Charge(%)"
                          label="Service Charge(%): "
                          onChange={(e) => {
                            const serviceCharge = e.target.value;
                            setServiceCharge(
                              serviceCharge === ""
                                ? 0
                                : parseInt(e.target.value) || 0
                            );
                          }}
                          value={serviceCharge}
                          error={errorState}
                        /> */}
                        {/* <Input
                          id="registration_fee"
                          name="registration_fee"
                          placeholder="Registration Fee"
                          label="Registration Fee:"
                          onChange={(e) => {
                            const registrationFee = e.target.value;
                            setRegistrationFee(
                              registrationFee === ""
                                ? 0
                                : parseInt(registrationFee) || 0
                            );
                          }}
                          value={registrationFee}
                          error={errorState}
                        /> */}
                        <div className="flex justify-end gap-2">
                          <Button
                            buttonType="secondary"
                            onClick={() => setShowRegisterBidderModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            buttonType="primary"
                            type="submit"
                            className="w-24"
                          >
                            Save
                          </Button>
                        </div>
                      </form>
                    </>
                  </Modal>
                </div>
              </TabContent>
            </>
          )}
        ></Tabs>
      </div>
    </>
  );
};

export default Monitoring;
