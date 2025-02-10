import { Table } from "../../../components";
import { useAuction } from "../../../context";

const Monitoring = () => {
  const { manifestRecords, isLoading: isFetchingManifestRecords } =
    useAuction();

  return (
    <>
      <div className="h-full">
        <div className="flex flex-col gap-2">
          <div className="w-full border p-4 h-full">
            <div className="flex justify-between items-center w-full p-2">
              <h1 className="text-3xl font-bold">Manifest List</h1>
            </div>
            {!isFetchingManifestRecords && manifestRecords ? (
              <Table
                data={manifestRecords || []}
                loading={isFetchingManifestRecords}
                hasCount
                rowKeys={[
                  "barcode_number",
                  "control_number",
                  "description",
                  "bidder_number",
                  "qty",
                  "price",
                  "manifest_number",
                  "error_messages",
                ]}
                columnHeaders={[
                  "barcode",
                  "control",
                  "description",
                  "bidder",
                  "qty",
                  "price",
                  "manifest",
                  "error",
                ]}
              />
            ) : (
              <div className="border p-2 flex justify-center">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Monitoring;
