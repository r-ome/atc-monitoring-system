import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { usePageLayoutProps } from "@layouts/PageLayout";
import { useBreadcrumbs } from "app/hooks";
import { Button, Card, Skeleton, Typography } from "antd";
import { RHFInput, RHFInputNumber, RHFSelect } from "@components";
import { useAuction } from "@context";
import {
  AUCTIONS_401,
  AUCTIONS_402,
  AUCTIONS_403,
  BIDDERS_403,
} from "../errors";
import { AddOnPayload } from "@types";
import { formatNumberPadding } from "@lib/utils";

const AddOnPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const methods = useForm<AddOnPayload>();
  const { openNotification } = usePageLayoutProps();
  const {
    registeredBidders,
    auctionItemDetails: SuccessResponse,
    fetchRegisteredBidders,
    addOn,
    isLoading,
    error: ErrorResponse,
    resetAuctionItem,
  } = useAuction();

  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumb({ title: "Encode Page", path: "/encode", level: 3 });
  }, [setBreadcrumb]);

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      const fetchInitialData = async () => {
        await fetchRegisteredBidders(auctionId);
      };
      fetchInitialData();
    }
  }, [fetchRegisteredBidders, params]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        let message = "Server Error";
        const barcode = methods.getValues("barcode");
        if (ErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }

        if (ErrorResponse.error === AUCTIONS_401) {
          message = "Please double check your inputs!";
        }

        if (ErrorResponse.error === BIDDERS_403) {
          message = `Bidder not registered in Auction. Please double check!`;
          methods.setError("bidder", {
            type: "string",
            message: `Bidder not registered in Auction!`,
          });
          message = "Please double check the Barcode!";
        }

        if (ErrorResponse.error === AUCTIONS_402) {
          message = `Inventory with barcode ${barcode} already exists! Transfer Item instead`;
          methods.setError("barcode", {
            type: "string",
            message: `Barcode ${barcode} already exist! Transfer item instead!`,
          });
        }
        if (ErrorResponse.error === AUCTIONS_403) {
          let combination =
            barcode.split("-").length === 3
              ? barcode.split("-").slice(0, -1).join("-")
              : barcode;

          methods.setError("barcode", {
            type: "string",
            message: `Barcode ${combination} doesn't exist.`,
          });
          message = "Please double check the Barcode!";
        }
        openNotification(message, "error", "Error");
      }

      if (SuccessResponse) {
        methods.reset();
        openNotification("Successfully added an item in the auction!");
        resetAuctionItem();
      }
    }
  }, [
    ErrorResponse,
    isLoading,
    SuccessResponse,
    methods,
    openNotification,
    resetAuctionItem,
    navigate,
  ]);

  const handleFieldUpperCase = (
    fieldName: "description" | "qty",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    methods.setValue(fieldName, e.target.value.toUpperCase());
  };

  const handleSubmitAddOn = methods.handleSubmit(async (data) => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      let barcodeLength = data.barcode.split("-").length;
      let formattedBarcode: any = data.barcode;
      if (barcodeLength === 3) {
        const lastDigit = formatNumberPadding(data.barcode.split("-")[2], 3);
        formattedBarcode = [
          ...data.barcode.split("-").slice(0, -1),
          lastDigit,
        ].join("-");
      }
      methods.setValue("barcode", formattedBarcode);
      methods.setValue("control", formatNumberPadding(data.control, 4));
      await addOn(auctionId, methods.getValues());
    }
  });

  if (!registeredBidders) return <Skeleton />;

  return (
    <Card className="w-1/2">
      <Typography.Title level={3}>Additional Item</Typography.Title>
      <form className="flex w-full flex-col gap-2">
        <div>
          <Typography.Text>BARCODE:</Typography.Text>
          <RHFInput
            control={methods.control}
            name="barcode"
            placeholder="BARCODE"
            disabled={isLoading}
            rules={{
              required: "This field is required",
            }}
          />
        </div>
        <div>
          <Typography.Text>CONTROL:</Typography.Text>
          <RHFInput
            control={methods.control}
            name="control"
            placeholder="CONTROL"
            disabled={isLoading}
            rules={{
              required: "This field is required",
            }}
          />
        </div>
        <div>
          <Typography.Text>DESCRIPTION:</Typography.Text>
          <RHFInput
            control={methods.control}
            name="description"
            onChange={(e) => handleFieldUpperCase("description", e)}
            placeholder="Description"
            disabled={isLoading}
            rules={{
              required: "This field is required",
            }}
          />
        </div>
        <div>
          <Typography.Text>Bidder:</Typography.Text>
          <RHFSelect
            showSearch
            control={methods.control}
            name="bidder"
            placeholder="Select a Bidder"
            filterOption={(input: string, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={registeredBidders.bidders.map((bidder) => ({
              value: bidder?.bidder_id.toString(),
              label: `${bidder.bidder_number} - ${bidder.full_name} ${
                !!bidder.remarks ? "- WITHDRAWN FROM THE AUCTION" : ""
              }`,
              disabled: !!bidder.remarks,
            }))}
            disabled={isLoading}
            rules={{ required: "This field is required!" }}
          />
        </div>
        <div>
          <Typography.Text>QTY:</Typography.Text>
          <RHFInput
            control={methods.control}
            name="qty"
            onChange={(e) => handleFieldUpperCase("qty", e)}
            placeholder="QTY"
            disabled={isLoading}
            rules={{
              required: "This field is required",
            }}
          />
        </div>
        <div>
          <Typography.Text>Price:</Typography.Text>
          <RHFInputNumber
            control={methods.control}
            name="price"
            placeholder="PRICE"
            disabled={isLoading}
            rules={{
              required: "This field is required",
            }}
          />
        </div>

        <div className="flex gap-2 justify-end w-full">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSubmitAddOn}
            loading={isLoading}
          >
            Submit
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddOnPage;
