import { useNavigate } from "react-router-dom";
import { Button, Table } from "@components";
import { useAuction } from "@context";

const Monitoring = () => {
  const navigate = useNavigate();
  const { monitoring, isLoading: isFetchingMonitoring } = useAuction();

  if (isFetchingMonitoring || !monitoring) {
    return <div className="border p-2 flex justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="h-full">
        <div className="flex flex-col gap-2">
          <div className="w-full border p-4 h-full">
            <div className="flex justify-between items-center w-full p-2">
              <h1 className="text-3xl font-bold">Monitoring</h1>
              <Button
                buttonType="primary"
                onClick={() => navigate("../encode")}
              >
                ENCODE
              </Button>
            </div>
            <Table
              data={monitoring}
              loading={isFetchingMonitoring}
              hasCount
              rowKeys={[
                "barcode",
                "control_number",
                "description",
                "bidder.bidder_number",
                "qty",
                "price",
                "manifest_number",
              ]}
              columnHeaders={[
                "barcode",
                "control",
                "description",
                "bidder",
                "qty",
                "price",
                "manifest",
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Monitoring;
