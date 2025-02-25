import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useForm } from "react-hook-form";
import {
  RHFInput,
  RHFInputNumber,
  RHFDatePicker,
  RHFSelect,
} from "@components";
import { useBidders, useBranches } from "@context";
import { CreateBidderPayload } from "@types";
import { BIDDERS_402 } from "../errors";
import { Alert, Button, Card, Checkbox, Skeleton, Typography } from "antd";
import { usePageLayoutProps } from "@layouts";
import { useBreadcrumbs } from "app/hooks";

const CreateSupplier = () => {
  const navigate = useNavigate();
  const methods = useForm<CreateBidderPayload>({
    defaultValues: {
      service_charge: 12,
      registration_fee: 3000,
      status: "ACTIVE",
    },
  });
  const {
    createBidder,
    isLoading,
    error: ErrorResponse,
    bidder: SuccessResponse,
  } = useBidders();
  const {
    branches,
    fetchBranches,
    error: BranchErrorResponse,
    isLoading: isFetchingBranches,
  } = useBranches();
  const { openNotification } = usePageLayoutProps();
  const { setBreadcrumb } = useBreadcrumbs();
  const [hasBusiness, setHasBusiness] = useState<boolean>(false);

  useEffect(() => {
    setBreadcrumb({ title: "Create Bidder" });
  }, [setBreadcrumb]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBranches();
    };
    fetchInitialData();
  }, [fetchBranches]);

  useEffect(() => {
    if (hasBusiness) {
      methods.setValue("service_charge", 10);
    } else {
      methods.setValue("service_charge", 12);
    }
  }, [hasBusiness, methods]);

  useEffect(() => {
    if (!isFetchingBranches) {
      if (BranchErrorResponse) {
        if (BranchErrorResponse.httpStatus === 500) {
          openNotification(
            "Error encounted when fetching branches",
            "error",
            "Error"
          );
        }
      }
    }
  }, [isFetchingBranches, BranchErrorResponse, openNotification]);

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

  if (!branches.length) return <Skeleton />;

  return (
    <Card
      className="py-4 w-1/2"
      title={<h1 className="text-3xl">Create Bidder</h1>}
    >
      <form id="create_bidder" className="flex flex-col gap-4 w-full">
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

        <div className="flex gap-4 w-full">
          <div className="w-1/3">
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
                  value: /^[a-zA-ZÑñ\- ]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>

          <div className="w-1/3">
            <Typography.Title level={5}>Middle Name:</Typography.Title>
            <RHFInput
              control={methods.control}
              name="middle_name"
              disabled={isLoading}
              placeholder="Middle Name"
              onChange={(e) => handleFieldUpperCase("middle_name", e)}
              rules={{
                pattern: {
                  value: /^[a-zA-ZÑñ\- ]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>

          <div className="w-1/3">
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
                  value: /^[a-zA-ZÑñ\- ]+$/,
                  message: "Invalid characters!",
                },
              }}
            />
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <div className="w-1/2">
            <Typography.Title level={5}>Birthdate</Typography.Title>
            <RHFDatePicker
              control={methods.control}
              name="birthdate"
              disabled={isLoading}
              rules={{ required: "This field is required!" }}
            />
          </div>

          <div className="w-1/2">
            <Typography.Title level={5}>Contact Number:</Typography.Title>
            <RHFInputNumber
              control={methods.control}
              prefix="+63"
              name="contact_number"
              disabled={isLoading}
              controls={false}
              placeholder="Contact Number"
              rules={{ required: "Contact Number is required!" }}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
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
            />
          </div>
          <div className="w-2/3">
            <Typography.Title level={5}>Registered Branch:</Typography.Title>
            <RHFSelect
              control={methods.control}
              name="registered_at"
              placeholder="Please select current branch"
              defaultValue={branches[0].name}
              options={branches.map((item) => ({
                title: item.name,
                value: item.name,
              }))}
            />
          </div>
        </div>

        <div>
          <Checkbox onChange={() => setHasBusiness(!hasBusiness)}>
            Does Bidder have business permits?
          </Checkbox>
          <Alert
            message={
              <>
                If Bidder have Business Permits. You can upload the{" "}
                <Typography.Text strong>Validity Date</Typography.Text> of the
                Bidder's DTI, Mayor's Permit after the bidder is registered in
                the system
              </>
            }
            type="info"
            className="mt-2"
            showIcon
          />
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
