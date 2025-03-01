import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import moment from "moment";
import { useParams } from "react-router-dom";

import { useAuction, useBidders } from "@context";
import { RHFInputNumber, RHFSelect } from "@components";
import { BaseBidder, RegisterBidderPayload } from "@types";
import { AUCTIONS_401, AUCTIONS_402, AUCTIONS_403 } from "../errors";
import { Modal, Tooltip, Typography } from "antd";
import { usePageLayoutProps } from "@layouts";
import { formatNumberToCurrency } from "@lib/utils";

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
    defaultValues: { service_charge: 12, registration_fee: 3000 },
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
    setSelectedBidder(null);
  }, [methods, onCancel, resetRegisteredBidder]);
  const [selectedBidder, setSelectedBidder] = useState<BaseBidder | null>(null);

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

  useEffect(() => {
    // set service charge and registration fee
    // when bidder is selected
    if (!selectedBidder) return;
    methods.setValue("registration_fee", selectedBidder.registration_fee);
    methods.setValue("service_charge", selectedBidder.service_charge);
  }, [selectedBidder, methods]);

  const handleSubmitRegisterBidder = methods.handleSubmit(async (data) => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      // ORIGINAL
      await registerBidderAtAuction(auctionId, data);
      // MODIFIED FOR SAMPLE_1
      // const bidderIds = [
      //   218, 747, 742, 740, 721, 13, 580, 688, 675, 526, 514, 648, 475, 390,
      //   219, 188, 361, 169, 153, 206, 233, 28, 41, 44, 43, 59, 76, 167,
      // ];

      // MODIFIED FOR SAMPLE_2
      // const bidderIds = [
      //   7, 28, 43, 59, 114, 165, 218, 233, 268, 340, 412, 504, 512, 518, 580,
      //   628, 702, 704, 708, 719, 748, 750, 783, 791, 796, 809, 813,
      // ];
      // unregisteredBidders.forEach(async (item) => {
      //   if (bidderIds.includes(item.bidder_id)) {
      //     await registerBidderAtAuction(auctionId, {
      //       bidder_id: item.bidder_id,
      //       registration_fee: item.registration_fee,
      //       service_charge: item.service_charge,
      //     });
      //   }
      // });
    }
  });

  const renderUnregisteredBiddersLabel = (bidder: BaseBidder) => {
    if (bidder.status === "BANNED") {
      return (
        <span className="text-red-500">
          {bidder.bidder_number} - {bidder.full_name} - BANNED
        </span>
      );
    }

    if (!!bidder.has_balance) {
      return (
        <Tooltip
          placement="right"
          title={`Bidder still has ${formatNumberToCurrency(
            bidder.has_balance.balance
          )} unpaid balance from ${moment(
            bidder.has_balance.auction_date
          ).format("MMMM DD, YYYY")} auction`}
        >
          <span className="text-red-500">
            {bidder.bidder_number} - {bidder.full_name} - HAS UNPAID ITEMS
          </span>
        </Tooltip>
      );
    }

    return `${bidder.bidder_number} - ${bidder.full_name}`;
  };

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
      <form id="register_bidder" className="flex flex-col gap-4 w-full">
        <div>
          <Typography.Title level={5}>Bidder:</Typography.Title>
          <RHFSelect
            showSearch
            control={methods.control}
            name="bidder_id"
            disabled={isLoading}
            placeholder="Select a Bidder"
            filterOption={(input: string, option: any) =>
              (option?.search ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={unregisteredBidders.map((bidder) => ({
              value: bidder?.bidder_id,
              disabled: bidder.status === "BANNED" || !!bidder.has_balance,
              search: `${bidder.bidder_number} - ${bidder.full_name} ${bidder.status}`,
              label: renderUnregisteredBiddersLabel(bidder),
            }))}
            onChange={(bidderId: number) => {
              const selected = bidders.find(
                (bidder) => bidder.bidder_id === bidderId
              );
              if (selected) {
                setSelectedBidder(selected);
              }
              methods.setValue("bidder_id", bidderId);
            }}
            rules={{ required: "This field is required!" }}
          />
        </div>

        {selectedBidder ? (
          <div className="flex gap-4">
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
          </div>
        ) : null}
      </form>
    </Modal>
  );
};

export default RegisterBidderModal;
