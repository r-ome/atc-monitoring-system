import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table } from "../../../components";
import { useBranches } from "../../../context";

const BranchProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { branch, isLoading: isFetchingBranch, fetchBranch } = useBranches();

  useEffect(() => {
    const { branch_id: branchId } = location.state.branch;
    if (!branch || branch.branch_id !== branchId) {
      const fetchInitialData = async () => {
        await fetchBranch(branchId);
      };
      fetchInitialData();
    }
  }, [location.state.branch, branch]);

  const renderProfileDetails = (branch: any) => {
    let branchDetails = branch;
    let profileDetails = [];
    for (let key in branchDetails) {
      let label = key;
      if (label === "containers") {
        label = "Total Containers";
        profileDetails.push({ label, value: branchDetails[key].length });
      } else {
        if (label === "created_at") label = "Date created";
        if (label === "updated_at") label = "Last updated at";
      }
      label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
      profileDetails.push({ label, value: branchDetails[key] });
    }

    return (
      <>
        {profileDetails.map((item, i) => {
          if (
            ["branch id", "name", "containers"].includes(
              item.label.toLowerCase()
            )
          )
            return;
          return (
            <div key={i} className="flex justify-between items-center p-2">
              <div>{item.label}:</div>
              <div className="text-lg font-bold">{item.value}</div>
            </div>
          );
        })}
      </>
    );
  };

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

      {!isFetchingBranch && branch ? (
        <div className="h-full">
          <div className="flex flex-grow gap-2">
            <div className="w-2/6 border rounded shadow-md p-4 h-full">
              <h1 className="text-3xl font-bold">{branch?.name} Branch</h1>
              <div className="flex mt-4">
                <div className="flex-col w-full gap-4">
                  {renderProfileDetails(branch)}
                </div>
              </div>
            </div>

            <div className="w-5/6 border p-4 h-full">
              <Table
                data={branch.containers || []}
                loading={isFetchingBranch}
                rowKeys={["barcode", "container_num", "supplier.name"]}
                columnHeaders={["Barcode", "Container Number", "Supplier"]}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="border p-2 flex justify-center">Loading...</div>
      )}
    </>
  );
};

export default BranchProfile;
