import { useState } from "react";
import { useAuction } from "@context";
import { ManifestRecord } from "@types";
import { Input, Table, Typography } from "antd";

const Monitoring = () => {
  const { manifestRecords, isLoading: isFetchingManifestRecords } =
    useAuction();

  const [dataSource, setDataSource] =
    useState<ManifestRecord[]>(manifestRecords);
  const [searchValue, setSearchValue] = useState<string>("");

  return (
    <>
      <div className="flex flex-col gap-2 w-full h-full">
        <div className="flex justify-between items-center">
          <Typography.Title level={2}>Manifest List</Typography.Title>
          <div className="w-4/6">
            <Input
              placeholder="Search by Barcode, Control, Bidder, Description"
              value={searchValue}
              onChange={(e) => {
                const currentValue = e.target.value.toUpperCase();
                setSearchValue(currentValue);
                const filteredData = manifestRecords.filter(
                  (item) =>
                    item.barcode_number.toUpperCase().includes(currentValue) ||
                    item.control_number.toUpperCase().includes(currentValue) ||
                    item.bidder_number.toUpperCase().includes(currentValue) ||
                    item.description.toUpperCase().includes(currentValue)
                );
                setDataSource(filteredData);
              }}
            />
          </div>
        </div>
        <Table
          rowKey={(rowkey) => rowkey.manifest_id}
          dataSource={searchValue ? dataSource : manifestRecords}
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
            {
              title: "Error Message",
              dataIndex: "error_messages",
              filters: [{ text: "Has Errors", value: "" }],
              onFilter: (value, record: any) =>
                record.error_messages && record.error_messages.includes(value),
              render: (text) => (
                <span className={`${text ? "text-red-500" : ""}`}>{text}</span>
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

export default Monitoring;
