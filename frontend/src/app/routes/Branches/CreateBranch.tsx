import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CreateBranchPayload } from "@types";
import { useBranches } from "@context";
import { RHFInput } from "@components";
import { BRANCHES_402 } from "../errors";
import { Button, Card, Typography } from "antd";
import RenderServerError from "../ServerCrashComponent";
import { usePageLayoutProps } from "@layouts";

const CreateBranch = () => {
  const navigate = useNavigate();
  const methods = useForm<CreateBranchPayload>();
  const {
    createBranch,
    isLoading,
    branch: SuccessResponse,
    error: ErrorResponse,
    resetCreateBranchResponse,
  } = useBranches();
  const { openNotification, pageBreadcrumbs, setPageBreadCrumbs } =
    usePageLayoutProps();

  useEffect(() => {
    setPageBreadCrumbs([...pageBreadcrumbs, { title: "Create Branch" }]);
  }, [setPageBreadCrumbs, pageBreadcrumbs]);

  useEffect(() => {
    if (!ErrorResponse && SuccessResponse && !isLoading) {
      methods.reset();
      openNotification("Successfully Added Branch!");
      navigate("/branches");
      resetCreateBranchResponse();
    }

    if (ErrorResponse) {
      if (ErrorResponse.error === BRANCHES_402) {
        methods.setError("name", {
          type: "string",
          message: "Branch already exist!",
        });
      }
    }
  }, [
    ErrorResponse,
    SuccessResponse,
    methods,
    isLoading,
    resetCreateBranchResponse,
    openNotification,
    navigate,
  ]);

  useEffect(() => {
    if (!ErrorResponse && SuccessResponse) {
      methods.reset();
    }
  }, [ErrorResponse, SuccessResponse, methods]);

  const handleSubmitCreateBranch = methods.handleSubmit(async (data) => {
    await createBranch(data);
  });

  if (ErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ErrorResponse} />;
  }

  return (
    <Card className="py-4" title={<h1 className="text-3xl">Create Branch</h1>}>
      <form id="create_branch" className="flex flex-col gap-4 w-2/4">
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
