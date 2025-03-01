import moment from "moment";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Bidder, UpdateBidderPayload } from "@types";
import { Modal, Skeleton, Typography } from "antd";
import { useBidders } from "@context";
import { RHFInput, RHFInputNumber, RHFDatePicker } from "@components";
import { usePageLayoutProps } from "@layouts/PageLayout";
import { BIDDERS_401, BIDDERS_403, SERVER_ERROR_MESSAGE } from "../errors";
import dayjs from "dayjs";

interface UpdateBidderModalProps {
  open: boolean;
  bidder: Bidder;
  onCancel: () => void;
}

const UpdateBidderModal: React.FC<UpdateBidderModalProps> = ({
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
      birthdate: bidderState.birthdate ? dayjs(bidderState.birthdate) : null,
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
    bidderState.updated_at,
    bidder,
  ]);

  const handleFieldUpperCase = (
    fieldName: "first_name" | "middle_name" | "last_name",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    methods.setValue(fieldName, e.target.value.toUpperCase());
  };

  const handleSubmit = methods.handleSubmit(async (data) => {
    data.birthdate = moment(new Date(data.birthdate)).format(
      "YYYY-MM-DD HH:mm:ss"
    );

    await updateBidder(bidder.bidder_id, data);
  });

  if (!bidder) return <Skeleton />;

  return (
    <Modal
      open={open}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      onCancel={onCancel}
      title="Update Bidder Details"
      width={800}
    >
      <form
        id="update_bidder"
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4 w-full"
      >
        <div className="flex gap-4">
          <div>
            <Typography.Title level={5}>First Name</Typography.Title>
            <RHFInput
              control={methods.control}
              name="first_name"
              onChange={(e) => handleFieldUpperCase("first_name", e)}
              disabled={isLoading}
              rules={{
                required: "First Name is required!",
                minLength: { value: 2, message: "Minimum of 2 characters!" },
                maxLength: {
                  value: 255,
                  message: "Maximum of 255 characters!",
                },
                pattern: {
                  value: /^[a-zA-Z0-9Ññ\- ]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>
          <div>
            <Typography.Title level={5}>Middle Name</Typography.Title>
            <RHFInput
              control={methods.control}
              name="middle_name"
              onChange={(e) => handleFieldUpperCase("middle_name", e)}
              disabled={isLoading}
              rules={{
                pattern: {
                  value: /^[a-zA-ZÑñ\- ]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>
          <div>
            <Typography.Title level={5}>Last Name</Typography.Title>
            <RHFInput
              control={methods.control}
              name="last_name"
              onChange={(e) => handleFieldUpperCase("last_name", e)}
              disabled={isLoading}
              rules={{
                required: "Last Name is required!",
                minLength: { value: 2, message: "Minimum of 2 characters!" },
                maxLength: {
                  value: 255,
                  message: "Maximum of 255 characters!",
                },
                pattern: {
                  value: /^[a-zA-Z0-9Ññ\- ]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-full">
            <Typography.Title level={5}>Birthdate</Typography.Title>
            <RHFDatePicker
              control={methods.control}
              name="birthdate"
              disabled={isLoading}
              rules={{ required: "This field is required!" }}
            />
          </div>

          <div className="w-full">
            <Typography.Title level={5}>Contact Number:</Typography.Title>
            <RHFInputNumber
              control={methods.control}
              prefix="+63"
              name="contact_number"
              disabled={isLoading}
              controls={false}
              placeholder="Contact Number"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="w-1/2">
            <Typography.Title level={5}>Registration Fee:</Typography.Title>
            <RHFInputNumber
              control={methods.control}
              name="registration_fee"
              disabled={isLoading}
              addonBefore="₱"
              placeholder="Registration Fee"
              rules={{
                required: "This field is required!",
              }}
            />
          </div>

          <div className="w-1/2">
            <Typography.Title level={5}>Service Charge:</Typography.Title>
            <RHFInputNumber
              control={methods.control}
              name="service_charge"
              disabled={isLoading}
              addonAfter="%"
              placeholder="Service Charge"
              rules={{
                required: "This field is required!",
              }}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateBidderModal;
