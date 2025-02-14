import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { CreateBranchPayload } from "@types";
import { useBranches } from "@context";
import { Button, Input } from "@components";
import { BRANCHES_402 } from "../errors";
import RenderServerError from "../ServerCrashComponent";

const CreateBranch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm<CreateBranchPayload>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const {
    createBranch,
    isLoading,
    branch: SuccessResponse,
    error: ErrorResponse,
  } = useBranches();

  useEffect(() => {
    if (!ErrorResponse && SuccessResponse) {
      methods.reset();
      setIsSuccess(true);
    }

    if (ErrorResponse) {
      if (ErrorResponse.error === BRANCHES_402) {
        methods.setError("name", {
          type: "string",
          message: "Branch already exist!",
        });
      }
      setIsSuccess(false);
    }
  }, [ErrorResponse, SuccessResponse, methods]);

  useEffect(() => {
    setIsSuccess(false);
  }, [location.key]);

  const handleSubmitCreateBranch = methods.handleSubmit(async (data) => {
    await createBranch(data);
  });

  if (ErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ErrorResponse} />;
  }

  if (isLoading) {
    return <div className="text-3xl flex justify-center">Loading...</div>;
  }

  return (
    <div>
      <div className="w-full">
        <Button
          buttonType="secondary"
          onClick={() => navigate(-1)}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>
      <div className="flex justify-between my-2">
        <h1 className="text-3xl">Create Branch</h1>
      </div>

      <div className="block p-10 border rounded-lg shadow-lg">
        <FormProvider {...methods}>
          {isSuccess ? (
            <h1 className="text-green-500 text-xl flex justify-center">
              Successfully Added Branch!
            </h1>
          ) : null}
          <form
            id="create_branch"
            onSubmit={(e) => e.preventDefault()}
            noValidate
            autoComplete="off"
          >
            <Input
              id="name"
              name="name"
              placeholder="Branch Name"
              label="Branch Name:"
              validations={{
                required: {
                  value: true,
                  message: "Branch Name is required",
                },
                minLength: { value: 3, message: "Minimum of 3 characters" },
                maxLength: {
                  value: 255,
                  message: "Maximum of 255 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9Ññ\- ]+$/,
                  message: "Invalid characters",
                },
              }}
            />

            <div className="flex">
              <Button
                onClick={handleSubmitCreateBranch}
                buttonType="primary"
                type="submit"
                className="w-full h-12"
              >
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CreateBranch;
