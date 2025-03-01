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
                    item.barcode.toUpperCase().includes(currentValue) ||
                    (item.control &&
                      item.control.toUpperCase().includes(currentValue)) ||
                    item.bidder_number.toUpperCase().includes(currentValue) ||
                    item.description.toUpperCase().includes(currentValue) ||
                    item.manifest_number.toUpperCase().includes(currentValue)
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
          scroll={{ y: 400 }}
          columns={[
            {
              title: "BARCODE",
              dataIndex: "barcode",
            },
            {
              title: "CONTROL",
              dataIndex: "control",
            },
            {
              title: "DESCRIPTION",
              dataIndex: "description",
              width: "20%",
            },
            {
              title: "BIDDER",
              dataIndex: "bidder_number",
            },
            {
              title: "QTY",
              dataIndex: "qty",
              width: "8%",
            },
            {
              title: "PRICE",
              dataIndex: "price",
              render: (val) => {
                let price = val;
                if (typeof price === "string")
                  price = parseInt(price, 10).toLocaleString();
                if (typeof price === "number") price = price.toLocaleString();

                return price;
              },
            },
            {
              title: "MANIFEST",
              dataIndex: "manifest_number",
            },
            {
              title: "Error Message",
              dataIndex: "error_messages",
              width: "20%",
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
