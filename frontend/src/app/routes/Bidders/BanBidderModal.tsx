import moment from "moment";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Bidder, UpdateBidderPayload } from "@types";
import { Alert, Modal, Skeleton, Typography } from "antd";
import { useBidders } from "@context";
import { RHFTextArea } from "@components";
import { usePageLayoutProps } from "@layouts/PageLayout";
import { BIDDERS_401, BIDDERS_403, SERVER_ERROR_MESSAGE } from "../errors";
import { WarningOutlined } from "@ant-design/icons";

interface BadBidderModalProps {
  open: boolean;
  bidder: Bidder;
  onCancel: () => void;
}

const BanBidderModal: React.FC<BadBidderModalProps> = ({
  open,
  bidder,
  onCancel,
}) => {
  const [bidderState, setBidderState] = useState<Bidder>(bidder);
  const methods = useForm<UpdateBidderPayload>({
    defaultValues: {
      first_name: bidderState.first_name,
      middle_name: bidderState.middle_name,
      last_name: bidderState.last_name,
      birthdate: moment(new Date(bidderState.birthdate)).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      registration_fee: bidderState.registration_fee,
      service_charge: bidderState.service_charge,
      contact_number: bidderState.contact_number,
      status: bidderState.status,
    },
  });
  const {
    bidder: SuccessResponse,
    updateBidder,
    isLoading,
    error: ErrorResponse,
  } = useBidders();
  const { openNotification } = usePageLayoutProps();

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        let message = "Server Error";
        if (ErrorResponse.httpStatus === 500) {
          message = SERVER_ERROR_MESSAGE;
        }

        if (ErrorResponse.error === BIDDERS_401) {
          message = "Please double check your inputs!";
        }

        if (ErrorResponse.error === BIDDERS_403) {
          message = "Bidder does not exist! Please go back to Bidder List!";
        }

        openNotification(message, "error", "Error");
      }

      if (SuccessResponse) {
        setBidderState(bidder);
        if (bidderState.updated_at !== bidder.updated_at) {
          openNotification("Successfully updated Bidder!");
          onCancel();
        }
      }
    }
  }, [
    isLoading,
    SuccessResponse,
    ErrorResponse,
    openNotification,
    onCancel,
    bidder,
    bidderState.updated_at,
  ]);

  const handleFieldUpperCase = (
    fieldName: "remarks",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    methods.setValue(fieldName, e.target.value.toUpperCase());
  };

  const handleSubmit = methods.handleSubmit(async (data) => {
    data.status = bidder.status === "BANNED" ? "ACTIVE" : "BANNED";
    await updateBidder(bidder.bidder_id, data);
  });

  if (!bidder) return <Skeleton />;

  return (
    <Modal
      open={open}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText={`YES, ${
        bidder.status === "BANNED" ? "UNBAN" : "BAN"
      } this bidder`}
      okButtonProps={{ color: "red", variant: "solid" }}
      onCancel={onCancel}
      width={600}
      title={
        <Typography.Title level={2}>
          You are about to {bidder.status === "BANNED" ? "unban" : "ban"} this
          bidder
        </Typography.Title>
      }
    >
      <form
        id="ban_bidder"
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4 w-full"
      >
        <Alert
          type="error"
          icon={<WarningOutlined className="text-3xl" />}
          showIcon
          message={
            <div className="text-lg">
              You are about to{" "}
              <span className="font-bold text-red-500">
                {bidder.status === "BANNED" ? "UNBAN" : "BAN"}
              </span>{" "}
              this bidder. Are you sure?
              <div className="mt-2 ml-2 flex font-bold">
                {bidder.bidder_number} - {bidder.full_name}
              </div>
            </div>
          }
        ></Alert>

        {bidder.status !== "BANNED" ? (
          <div className="flex flex-col">
            <Typography.Title level={5}>Reason:</Typography.Title>
            <RHFTextArea
              control={methods.control}
              name="remarks"
              rows={4}
              onChange={(e) => handleFieldUpperCase("remarks", e)}
              disabled={isLoading}
              placeholder="Reason for banning this bidder"
              rules={{
                required: "Reason for banning is required!",
                maxLength: {
                  value: 255,
                  message: "Maximum of 255 characters!",
                },
              }}
            />
          </div>
        ) : null}
      </form>
    </Modal>
  );
};

export default BanBidderModal;
