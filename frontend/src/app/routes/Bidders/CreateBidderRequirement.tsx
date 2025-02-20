import { useCallback, useEffect } from "react";
import moment from "moment";
import { useForm } from "react-hook-form";
import { useBidderRequirement } from "@context";
import { Bidder, BidderRequirementPayload } from "@types";
import { Modal, Typography } from "antd";
import { RHFDatePicker, RHFInput } from "@components";
import { usePageLayoutProps } from "@layouts/PageLayout";
import { BIDDER_REQUIREMENT_401 } from "../errors";

interface CreateBidderRequirementProps {
  open: boolean;
  onCancel: () => void;
  bidder: Bidder;
}

const CreateBidderRequirement: React.FC<CreateBidderRequirementProps> = ({
  open,
  onCancel,
  bidder,
}) => {
  const methods = useForm<BidderRequirementPayload>();
  const {
    createBidderRequirement,
    requirement: SuccessResponse,
    isLoading,
    error: ErrorResponse,
    resetBidderRequirement,
  } = useBidderRequirement();
  const { openNotification } = usePageLayoutProps();

  const handleCancel = useCallback(() => {
    methods.reset({ name: "", validity_date: "" });
    onCancel();
  }, [methods, onCancel]);

  const handleSubmit = methods.handleSubmit(async (data) => {
    data.validity_date = moment(new Date(data.validity_date)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    await createBidderRequirement(bidder.bidder_id, data);
  });

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        if (ErrorResponse.httpStatus === 500) {
          openNotification(
            "There might be problems in the server. Please contact your admin.",
            "error",
            "Server Error"
          );
        }
        if (ErrorResponse.error === BIDDER_REQUIREMENT_401) {
          methods.setError("name", {
            type: "string",
            message: "Invalid Requirement Type!",
          });
          methods.setError("validity_date", {
            type: "string",
            message: "Invalid Date!",
          });
        }
        resetBidderRequirement();
      }

      if (SuccessResponse) {
        handleCancel();
      }
    }
  }, [
    ErrorResponse,
    isLoading,
    methods,
    SuccessResponse,
    openNotification,
    handleCancel,
    resetBidderRequirement,
  ]);

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Save Requirement"
      title="Add Bidder Requirement"
    >
      <form id="create_bidder_requirement">
        <div className="flex flex-col gap-4">
          <div>
            <Typography.Title level={4}>Requirement Type</Typography.Title>
            <RHFInput
              control={methods.control}
              name="name"
              disabled={isLoading}
              rules={{ required: "This field is required!" }}
              placeholder="Requirement Name"
              onChange={(e) => {
                methods.setValue("name", e.target.value.toUpperCase());
              }}
            />
          </div>
          <div>
            <Typography.Title level={4}>Valid Until</Typography.Title>
            <RHFDatePicker
              control={methods.control}
              name="validity_date"
              disabled={isLoading}
              rules={{ required: "This field is required!" }}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBidderRequirement;
