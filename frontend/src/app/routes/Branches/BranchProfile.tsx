import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table, ProfileDetails } from "@components";
import { useBranches } from "@context";
import { Branch } from "@types";
import RenderServerError from "../ServerCrashComponent";

const BranchProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    branch,
    isLoading: isFetchingBranch,
    fetchBranch,
    error: ErrorResponse,
  } = useBranches();

  useEffect(() => {
    const { branch_id: branchId }: Branch = location.state.branch;
    if (!branch || branch.branch_id !== branchId) {
      const fetchInitialData = async () => {
        await fetchBranch(branchId);
      };
      fetchInitialData();
    }
  }, [location.state.branch, branch, fetchBranch]);

  if (ErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ErrorResponse} />;
  }

  if (isFetchingBranch || !branch) {
    return <div className="border p-2 flex justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="w-full">
        <Button
          buttonType="secondary"
          onClick={() => navigate(-1)}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>

      <div className="h-full">
        <div className="flex flex-grow gap-2">
          <div className="w-2/6 border rounded shadow-md p-4 h-full">
            <div className="flex-col w-full gap-4">
              <ProfileDetails
                title={`${branch.name} Branch`}
                profile={branch}
                excludedProperties={["updated_at"]}
                renamedProperties={{
                  created_at: "Date created",
                  containers: "Total Containers",
                }}
              />
            </div>
          </div>

          <div className="w-5/6 border p-4 h-full">
            <Table
              data={branch.containers}
              loading={isFetchingBranch}
              rowKeys={["barcode", "container_num", "supplier.name"]}
              columnHeaders={["Barcode", "Container Number", "Supplier"]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BranchProfile;
