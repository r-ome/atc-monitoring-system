import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { usePageLayoutProps } from "@layouts/PageLayout";
import { useBreadcrumbs } from "app/hooks";
import { Button, Card, Skeleton, Typography } from "antd";
import { RHFInput, RHFInputNumber, RHFSelect } from "@components";
import { useAuction } from "@context/index";
import { AUCTIONS_401, AUCTIONS_403 } from "../errors";
import { AddOnPayload } from "@types";
import { formatNumberPadding } from "@lib/utils";

const AddOnPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const methods = useForm<AddOnPayload>();
  const { pageBreadcrumbs, openNotification, setPageBreadCrumbs } =
    usePageLayoutProps();
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
    setBreadcrumb({ title: "Encode Page", path: "/encode" });
  }, []);

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
        if (ErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }

        if (ErrorResponse.error === AUCTIONS_401) {
          message = "Please double check your inputs!";
        }
        if (ErrorResponse.error === AUCTIONS_403) {
          message = "Please double check the Bidder and Barcode!";
        }
        openNotification(message, "error", "Error");
      }

      if (SuccessResponse) {
        methods.reset();
        openNotification("Successfully added an item in the auction!");
        resetAuctionItem();
        navigate(-1);
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
      methods.setValue("control", formatNumberPadding(data.control, 4));
      await addOn(auctionId, methods.getValues());
    }
  });

  if (!registeredBidders) return <Skeleton />;

  return (
    <Card>
      <Typography.Title level={3}>Additional Item</Typography.Title>
      <form className="flex w-1/2 flex-col gap-2">
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
              label: `${bidder.bidder_number} - ${bidder.full_name}`,
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
