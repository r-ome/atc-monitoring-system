import { useNavigate } from "react-router-dom";
import { Button, Table } from "../../../components";
import { Branch } from "../../../types";
import { useBranches } from "../../../context";
import { useEffect } from "react";

const BranchList = () => {
  const navigate = useNavigate();
  const { fetchBranches, branches, isLoading } = useBranches();

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBranches();
    };
    fetchInitialData();
  }, []);

  return (
    <div>
      <div className="flex justify-between my-2 items-center">
        <h1 className="text-3xl">Branches</h1>
        <div>
          <Button
            buttonType="primary"
            onClick={() => navigate(`/branches/create`)}
          >
            Create Branch
          </Button>
        </div>
      </div>

      <Table
        data={branches}
        loading={isLoading}
        onRowClick={(branch: Branch) =>
          navigate(`/branches/${branch.branch_id}`, { state: { branch } })
        }
        rowKeys={["name", "created_at", "updated_at"]}
        columnHeaders={["Name", "Date Created", "Last Date Updated"]}
      />
    </div>
  );
};

export default BranchList;
