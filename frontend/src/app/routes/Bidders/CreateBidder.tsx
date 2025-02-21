import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useForm } from "react-hook-form";
import {
  RHFInput,
  RHFInputNumber,
  RHFDatePicker,
  RHFSelect,
} from "@components";
import { useBidders } from "@context/BidderProvider/BidderContext";
import { CreateBidderPayload } from "@types";
import { BIDDERS_402 } from "../errors";
import { Button, Card, Typography } from "antd";
import { usePageLayoutProps } from "@layouts";

const CreateSupplier = () => {
  const navigate = useNavigate();
  const methods = useForm<CreateBidderPayload>({
    defaultValues: {
      service_charge: 12,
      registration_fee: 3000,
    },
  });
  const {
    createBidder,
    isLoading,
    error: ErrorResponse,
    bidder: SuccessResponse,
  } = useBidders();
  const { openNotification, setPageBreadCrumbs } = usePageLayoutProps();

  useEffect(() => {
    setPageBreadCrumbs([
      { title: "Bidders List", path: "/bidders" },
      { title: "Create Bidder" },
    ]);
  }, [setPageBreadCrumbs]);

  useEffect(() => {
    if (!isLoading) {
      if (SuccessResponse) {
        methods.reset();
        openNotification("Successfully Added Bidder!");
        navigate("/bidders");
      }

      if (ErrorResponse) {
        if (ErrorResponse.error === BIDDERS_402) {
          methods.setError("bidder_number", {
            type: "string",
            message: `Bidder Number ${methods.getValues(
              "bidder_number"
            )} already taken!`,
          });
        }
      }
    }
  }, [
    ErrorResponse,
    SuccessResponse,
    methods,
    isLoading,
    openNotification,
    navigate,
  ]);

  const handleSubmitCreateBidder = methods.handleSubmit(async (data) => {
    data.birthdate = moment(new Date(data.birthdate)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    await createBidder(data);
  });

  const handleFieldUpperCase = (
    fieldName: "first_name" | "middle_name" | "last_name",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    methods.setValue(fieldName, e.target.value.toUpperCase());
  };

  return (
    <Card className="py-4" title={<h1 className="text-3xl">Create Bidder</h1>}>
      <form id="create_bidder" className="flex flex-col gap-4 w-2/4">
        <div>
          <Typography.Title level={5}>Bidder Number:</Typography.Title>
          <RHFInputNumber
            control={methods.control}
            name="bidder_number"
            disabled={isLoading}
            controls={false}
            placeholder="Bidder Number"
            rules={{ required: "Bidder Number is required!" }}
          />
        </div>

        <div className="flex gap-4">
          <div>
            <Typography.Title level={5}>First Name:</Typography.Title>
            <RHFInput
              control={methods.control}
              name="first_name"
              disabled={isLoading}
              placeholder="First Name"
              onChange={(e) => handleFieldUpperCase("first_name", e)}
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
            <Typography.Title level={5}>Middle Name:</Typography.Title>
            <RHFInput
              control={methods.control}
              name="middle_name"
              disabled={isLoading}
              placeholder="Middle Name"
              onChange={(e) => handleFieldUpperCase("middle_name", e)}
              rules={{
                pattern: {
                  value: /^[a-zA-Z0-9Ññ\- ]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>

          <div>
            <Typography.Title level={5}>Last Name:</Typography.Title>
            <RHFInput
              control={methods.control}
              name="last_name"
              disabled={isLoading}
              placeholder="Last Name"
              onChange={(e) => handleFieldUpperCase("last_name", e)}
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

        <div>
          <Typography.Title level={5}>Birthdate</Typography.Title>
          <RHFDatePicker
            control={methods.control}
            name="birthdate"
            disabled={isLoading}
            rules={{ required: "This field is required!" }}
          />
        </div>

        <div className="flex gap-2">
          <div className="w-1/3">
            <Typography.Title level={5}>Status:</Typography.Title>
            <RHFSelect
              control={methods.control}
              name="status"
              disabled={true}
              options={[
                { title: "Active", value: "ACTIVE" },
                { title: "Inactive", value: "INACTIVE" },
                { title: "Banned", value: "BANNED" },
              ]}
              defaultValue="ACTIVE"
            />
          </div>

          <div className="w-1/3">
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

          <div className="w-1/3">
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

        <div className="flex gap-2 w-full justify-end">
          <Button onClick={() => navigate("/bidders")} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCreateBidder}
            type="primary"
            loading={isLoading}
          >
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateSupplier;
