import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import { useAuction, useBidders } from "@context";
import { RHFInputNumber, RHFSelect } from "@components";
import { BaseBidder, RegisterBidderPayload } from "@types";
import { AUCTIONS_401, AUCTIONS_402, AUCTIONS_403 } from "../errors";
import { Modal, Typography } from "antd";
import { usePageLayoutProps } from "@layouts";

interface RegisterBidderProps {
  open: boolean;
  onCancel: () => void;
}

const RegisterBidderModal: React.FC<RegisterBidderProps> = ({
  open,
  onCancel,
}) => {
  const params = useParams();
  const methods = useForm<RegisterBidderPayload>({
    defaultValues: { service_charge: "12", registration_fee: "3000" },
  });
  const [unregisteredBidders, setUnregisteredBidders] = useState<BaseBidder[]>(
    []
  );
  const { bidders } = useBidders();
  const { openNotification } = usePageLayoutProps();
  const {
    fetchAuctionDetails,
    registeredBidders,
    registerBidderAtAuction,
    resetRegisteredBidder,
    registeredBidder: SuccessResponse,
    isLoading,
    error: AuctionErrorResponse,
  } = useAuction();

  const handleCancel = useCallback(() => {
    methods.reset();
    onCancel();
    resetRegisteredBidder();
  }, [methods, onCancel, resetRegisteredBidder]);

  useEffect(() => {
    if (bidders && registeredBidders?.bidders) {
      if (bidders.length && !unregisteredBidders.length) {
        const unregisteredBiddersList = bidders.filter(
          (bidder) =>
            !registeredBidders?.bidders
              .map((item) => item.bidder_id)
              .includes(bidder.bidder_id)
        );

        setUnregisteredBidders(unregisteredBiddersList);
      }
    }
  }, [
    bidders,
    registeredBidders?.bidders,
    SuccessResponse,
    unregisteredBidders.length,
  ]);

  useEffect(() => {
    const { auction_id: auctionId } = params;

    if (!isLoading && auctionId) {
      if (SuccessResponse) {
        const refetchAuctionDetails = async () =>
          await fetchAuctionDetails(auctionId);
        refetchAuctionDetails();
        setUnregisteredBidders([]);
        openNotification("Successfully registered bidder!");
        handleCancel();
      }

      if (AuctionErrorResponse) {
        let message = "Server Error!";
        if (AuctionErrorResponse.error === AUCTIONS_401)
          message = "Please double check your inputs!";
        if (AuctionErrorResponse.error === AUCTIONS_402)
          message = "Bidder already registered";
        if (AuctionErrorResponse.error === AUCTIONS_403)
          message = "Please double check the bidder if already registered!";

        openNotification(message, "error", "Error!");
        resetRegisteredBidder();
      }
    }
  }, [
    AuctionErrorResponse,
    SuccessResponse,
    fetchAuctionDetails,
    params,
    isLoading,
    methods,
    resetRegisteredBidder,
    handleCancel,
    openNotification,
  ]);

  const handleSubmitRegisterBidder = methods.handleSubmit(async (data) => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      await registerBidderAtAuction(auctionId, data);
    }
  });

  return (
    <Modal
      onCancel={handleCancel}
      destroyOnClose
      onOk={handleSubmitRegisterBidder}
      confirmLoading={isLoading}
      open={open}
      title={
        <div className="flex justify-center items-center my-4">
          <h1 className="text-3xl">Register Bidder</h1>
        </div>
      }
    >
      <form id="create_branch" className="flex flex-col gap-4 w-full">
        <div>
          <Typography.Title level={5}>Branch Name:</Typography.Title>
          <RHFSelect
            showSearch
            control={methods.control}
            name="bidder_id"
            disabled={isLoading}
            placeholder="Select a Bidder"
            filterOption={(input: string, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={unregisteredBidders.map((bidder) => ({
              value: bidder?.bidder_id.toString(),
              label: `${bidder.bidder_number} - ${bidder.full_name}`,
            }))}
            rules={{ required: "This field is required!" }}
          />
        </div>

        <div>
          <Typography.Title level={5}>Service Charge</Typography.Title>
          <RHFInputNumber
            control={methods.control}
            name="service_charge"
            disabled={isLoading || !methods.watch("bidder_id")}
            placeholder="Service Charge"
            addonAfter="%"
            rules={{
              required: "This field is required!",
            }}
          />
        </div>

        <div>
          <Typography.Title level={5}>Registration Fee</Typography.Title>
          <RHFInputNumber
            control={methods.control}
            name="registration_fee"
            disabled={isLoading || !methods.watch("bidder_id")}
            addonBefore="₱"
            placeholder="Registration Fee"
            rules={{
              required: "This field is required!",
            }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default RegisterBidderModal;
