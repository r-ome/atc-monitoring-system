import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useBranches } from "@context";
import { useEffect, useState } from "react";
import { Branch, BranchPayload } from "@types";
import { RHFInput } from "@components";
import { Modal, Typography } from "antd";
import { usePageLayoutProps } from "@layouts/PageLayout";
import { BRANCHES_401, BRANCHES_403 } from "../errors";

interface UpdateBranchModalProps {
  open: boolean;
  branch: Branch;
  handleCancel: () => void;
}

const UpdateBranchModal: React.FC<UpdateBranchModalProps> = ({
  open,
  branch,
  handleCancel,
}) => {
  const params = useParams();
  const methods = useForm<BranchPayload>({
    defaultValues: { name: branch.name },
  });
  const { openNotification } = usePageLayoutProps();
  const [currentBranchName, setCurrentBranchName] = useState<string>(
    branch.name
  );
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>(true);

  const {
    updateBranch,
    isLoading,
    branch: SuccessResponse,
    error: ErrorResponse,
  } = useBranches();

  useEffect(() => {
    if (branch) {
      setCurrentBranchName(branch.name);
    }

    if (methods.getValues("name") === branch.name) {
      setConfirmDisabled(true);
    }
  }, [branch, currentBranchName, methods]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        let message = "Server Error";

        if (ErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }

        if (ErrorResponse.error === BRANCHES_401) {
          message = "Please double check your Branch Name!";
        }
        if (ErrorResponse.error === BRANCHES_403) {
          message = "Please double check the Branch!";
        }
        openNotification(message, "error", "Error");
      }

      if (SuccessResponse) {
        if (SuccessResponse.name !== currentBranchName) {
          openNotification("Successfully updated Branch!");
          handleCancel();
        }
      }
    }
  }, [
    isLoading,
    currentBranchName,
    SuccessResponse,
    ErrorResponse,
    openNotification,
    handleCancel,
  ]);

  const handleSubmit = methods.handleSubmit(async (data) => {
    const { branch_id: branchId } = params;
    if (branchId) {
      if (data.name === branch.name) {
        methods.setError("name", {
          type: "string",
          message: "Branch Name is not changed!",
        });
      }
      await updateBranch(branchId, data);
    }
  });

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okButtonProps={{ disabled: confirmDisabled }}
      okText="Save"
      title={<Typography.Title level={4}>Update Branch</Typography.Title>}
    >
      <form
        id="create_branch"
        className="w-full"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <Typography.Title level={5}>Branch Name:</Typography.Title>
          <RHFInput
            control={methods.control}
            name="name"
            disabled={isLoading}
            placeholder="Branch Name"
            onChange={(e) => {
              methods.setValue("name", e.target.value.toUpperCase());
              if (methods.getValues("name") === branch.name) {
                setConfirmDisabled(true);
              } else {
                setConfirmDisabled(false);
              }
            }}
            rules={{
              required: "Branch name is required!",
              pattern: {
                value: /^[a-zA-Z0-9Ññ\- ]+$/,
                message: "Invalid characters!",
              },
            }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default UpdateBranchModal;
