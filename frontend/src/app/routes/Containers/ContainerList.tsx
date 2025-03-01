import { useEffect, useState } from "react";
import moment from "moment";
import { BaseContainer } from "@types";
import { useContainers } from "@context";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input, Space, Table, Tag, Tooltip, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { usePageLayoutProps } from "@layouts";
import { useBreadcrumbs } from "app/hooks";

const BidderList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    containers,
    fetchContainers,
    error: ErrorResponse,
    isLoading,
  } = useContainers();
  const { openNotification } = usePageLayoutProps();
  const [dataSource, setDataSource] = useState<BaseContainer[]>(containers);
  const [searchValue, setSearchValue] = useState<string>("");
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumb({ title: "Containers List", path: "/containers", level: 1 });
  }, [setBreadcrumb]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchContainers();
    };
    fetchInitialData();
  }, [fetchContainers, location.key]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse && ErrorResponse.httpStatus === 500) {
        openNotification(
          "There might be problems in the server. Please contact your admin.",
          "error",
          "Server Error"
        );
      }
    }
  }, [isLoading, ErrorResponse, openNotification]);

  return (
    <div>
      <div className="flex justify-between my-2">
        <div>
          {/* <Button
            type="primary"
            size="large"
            onClick={() => navigate("create")}
          >
            Create Bidder
          </Button> */}
        </div>
        <div className="w-2/6 my-2 flex gap-4 items-center ">
          <div className="w-2/6 flex justify-end">
            <Typography.Text strong>
              {searchValue ? dataSource.length : containers.length} Containers
            </Typography.Text>
          </div>
          <div className="w-4/6">
            <Input
              placeholder="Search by Barcode or Supplier"
              value={searchValue}
              onChange={(e) => {
                const currentValue = e.target.value;
                setSearchValue(currentValue);

                let filteredData = [];

                filteredData = containers.filter(
                  (container) =>
                    container.barcode.includes(currentValue) ||
                    container.supplier.name
                      .toUpperCase()
                      .includes(currentValue.toUpperCase())
                );

                setDataSource(filteredData);
              }}
            />
          </div>
        </div>
      </div>

      <Table
        rowKey={(record) => record.container_id}
        dataSource={searchValue ? dataSource : containers}
        columns={[
          {
            title: "Barcode",
            dataIndex: "barcode",
            width: "10%",
          },
          {
            title: "Supplier",
            dataIndex: "supplier",
            width: "25%",
            sortDirections: ["ascend", "descend"],
            sorter: (a, b) => a.supplier.name.localeCompare(b.supplier.name),
            render: (val) => val.name,
          },
          {
            title: "Branch",
            dataIndex: "branch",
            render: (val) => val.name,
          },
          {
            title: "Number of Items",
            dataIndex: "num_of_items",
            sortDirections: ["ascend", "descend"],
            sorter: (a, b) => a.num_of_items - b.num_of_items,
          },
          {
            title: "Date Created",
            dataIndex: "created_at",
            render: (val) => moment(new Date(val)).format("MMMM DD, YYYY"),
          },
          {
            title: "Auction Or Sell",
            dataIndex: "auction_or_sell",
            filters: [
              { text: "AUCTION", value: "AUCTION" },
              { text: "SELL", value: "SELL" },
            ],
            onFilter: (value, record) =>
              record.auction_or_sell.indexOf(value as string) === 0,
            render: (val) => (
              <Tag color={val === "AUCTION" ? "green" : "red"}>{val}</Tag>
            ),
          },
          {
            title: "Action",
            key: "action",
            width: "10%",
            render: (_, container: BaseContainer) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Bidder">
                    <Button
                      onClick={() =>
                        navigate(`/containers/${container.container_id}`)
                      }
                    >
                      <EyeOutlined />
                    </Button>
                  </Tooltip>
                </Space>
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default BidderList;
