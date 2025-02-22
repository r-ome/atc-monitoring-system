import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseAuction } from "@types";
import { useAuction } from "@context";
import { Button, Popconfirm, Space, Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { usePageLayoutProps } from "@layouts/PageLayout";
// import { usePreviousValue } from "app/hooks";
import { useBreadcrumbs } from "app/hooks";

const AuctionList = () => {
  const navigate = useNavigate();
  const [popconfirmState, setPopconfirmState] = useState<boolean>(false);
  const {
    auctions,
    isLoading,
    getAuctions,
    createAuction,
    resetAuction,
    // auction: SuccessResponse,
    error: ErrorResponse,
  } = useAuction();
  const { openNotification } = usePageLayoutProps();
  const { setBreadcrumb } = useBreadcrumbs();
  // const auctionLength = usePreviousValue(auctions.length);

  useEffect(() => {
    setBreadcrumb({ title: "Auctions List", path: "/auctions", level: 1 });
  }, [setBreadcrumb]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await getAuctions();
    };

    fetchInitialData();
  }, [getAuctions]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        let message = "Server Error";
        if (ErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }
        openNotification(message, "error", "Server Error");
      }

      // DEFER TIHS FOR NOW
      // if (auctionLength !== auctions.length) {
      //   openNotification("Successfully created an Auction!");
      // }
      setPopconfirmState(false);
      resetAuction();
    }
  }, [
    ErrorResponse,
    // SuccessResponse,
    isLoading,
    openNotification,
    resetAuction,
    // auctionLength,
    // auctions,
    // navigate,
  ]);

  const handleCreateAuction = async () => {
    await createAuction();
  };

  return (
    <>
      <div>
        <div className="flex my-2">
          <Popconfirm
            title="Are you sure?"
            open={popconfirmState}
            placement="right"
            okButtonProps={{ loading: isLoading }}
            onConfirm={handleCreateAuction}
            okText="Yes"
            onCancel={() => setPopconfirmState(false)}
          >
            <Button
              size="large"
              type="primary"
              onClick={() => setPopconfirmState(true)}
            >
              Create Auction
            </Button>
          </Popconfirm>
        </div>

        <Table
          rowKey={(record) => record.auction_id}
          dataSource={auctions}
          columns={[
            {
              title: "Auction Date",
              dataIndex: "auction_date",
            },
            {
              title: "Total Bidders",
              dataIndex: "total_bidders",
            },
            {
              title: "Total Items",
              dataIndex: "total_items",
            },
            {
              title: "Action",
              key: "action",
              render: (_, auction: BaseAuction) => {
                return (
                  <Space size="middle">
                    <Tooltip placement="top" title="View Auction">
                      <Button
                        onClick={() =>
                          navigate(`/auctions/${auction.auction_id}`)
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
    </>
  );
};

export default AuctionList;
