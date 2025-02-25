import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { BranchPayload } from "@types";
import { useBranches } from "@context";
import { RHFInput } from "@components";
import { BRANCHES_402 } from "../errors";
import { Button, Card, Typography } from "antd";
import { usePageLayoutProps } from "@layouts";

const CreateBranch = () => {
  const navigate = useNavigate();
  const methods = useForm<BranchPayload>();
  const {
    createBranch,
    isLoading,
    branch: SuccessResponse,
    error: ErrorResponse,
    resetBranchResponse,
  } = useBranches();
  const { openNotification, setPageBreadCrumbs } = usePageLayoutProps();

  useEffect(() => {
    setPageBreadCrumbs([
      { title: "Branches List", path: "/branches" },
      { title: "Create Branch" },
    ]);
  }, [setPageBreadCrumbs]);

  useEffect(() => {
    if (!isLoading) {
      if (SuccessResponse) {
        methods.reset();
        openNotification("Successfully Added Branch!");
        navigate("/branches");
        resetBranchResponse();
      }

      if (ErrorResponse) {
        if (ErrorResponse.httpStatus === 500) {
          openNotification(
            "There might be problems in the server. Please contact your admin.",
            "error",
            "Server Error"
          );
        }

        if (ErrorResponse.error === BRANCHES_402) {
          methods.setError("name", {
            type: "string",
            message: "Branch already exist!",
          });
        }
      }
    }
  }, [
    ErrorResponse,
    SuccessResponse,
    methods,
    isLoading,
    resetBranchResponse,
    openNotification,
    navigate,
  ]);

  const handleSubmitCreateBranch = methods.handleSubmit(async (data) => {
    await createBranch(data);
  });

  return (
    <Card className="py-4" title={<h1 className="text-3xl">Create Branch</h1>}>
      <form
        id="create_branch"
        className="flex flex-col gap-4 w-2/4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <Typography.Title level={5}>Branch Name:</Typography.Title>
          <RHFInput
            control={methods.control}
            name="name"
            disabled={isLoading}
            placeholder="Branch Name"
            onChange={(e) =>
              methods.setValue("name", e.target.value.toUpperCase())
            }
            rules={{
              required: "Branch name is required!",
              pattern: {
                value: /^[a-zA-Z0-9Ññ\- ]+$/,
                message: "Invalid characters!",
              },
            }}
          />
        </div>

        <div className="flex gap-2 w-full justify-end">
          <Button onClick={() => navigate("/branches")} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCreateBranch}
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

export default CreateBranch;
