import { useAuction } from "@context";
import { Table, Typography } from "antd";

const Monitoring = () => {
  const { manifestRecords, isLoading: isFetchingManifestRecords } =
    useAuction();

  return (
    <>
      <div className="flex flex-col gap-2 w-full h-full">
        <div className="flex justify-between items-center">
          <Typography.Title level={2}>Manifest List</Typography.Title>
        </div>
        <Table
          rowKey={(rowkey) => rowkey.manifest_id}
          dataSource={manifestRecords || []}
          loading={isFetchingManifestRecords}
          columns={[
            {
              title: "BARCODE",
              dataIndex: "barcode_number",
            },
            {
              title: "CONTROL",
              dataIndex: "control_number",
            },
            {
              title: "DESCRIPTION",
              dataIndex: "description",
            },
            {
              title: "BIDDER",
              dataIndex: "bidder_number",
            },
            {
              title: "QTY",
              dataIndex: "qty",
            },
            {
              title: "PRICE",
              dataIndex: "price",
            },
            {
              title: "MANIFEST",
              dataIndex: "manifest_number",
            },
            { title: "Error Message", dataIndex: "error_messages" },
          ]}
        />
      </div>
    </>
  );
};

export default Monitoring;
