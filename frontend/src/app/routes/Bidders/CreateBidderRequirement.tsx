import { useCallback, useEffect } from "react";
import moment from "moment";
import { useForm } from "react-hook-form";
import { useBidderRequirement } from "@context";
import { Bidder, BidderRequirementPayload } from "@types";
import { Modal, Typography } from "antd";
import { RHFDatePicker, RHFInput } from "@components";

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
    requirement,
    isLoading,
    error: ErrorResponse,
  } = useBidderRequirement();

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
    if (ErrorResponse) {
      methods.setError("name", {
        type: "string",
        message: "Invalid Requirement Type!",
      });
    }

    if (!ErrorResponse && !isLoading && requirement) {
      handleCancel();
    }
  }, [ErrorResponse, isLoading, methods, requirement, handleCancel]);

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
              rules={{ required: "This field is required" }}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBidderRequirement;
