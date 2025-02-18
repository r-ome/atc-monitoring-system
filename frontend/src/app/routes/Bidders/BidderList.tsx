import { useEffect } from "react";
import { BaseBidder } from "@types";
import { useBidders } from "@context";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Space, Spin, Table, Tooltip } from "antd";
import RenderServerError from "../ServerCrashComponent";
import { EyeOutlined } from "@ant-design/icons";
import { usePageLayoutProps } from "@layouts";

const BidderList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    bidders,
    fetchBidders,
    error: ErrorResponse,
    isLoading,
    resetCreateBidderResponse,
  } = useBidders();
  const { setPageBreadCrumbs } = usePageLayoutProps();

  useEffect(() => {
    resetCreateBidderResponse();
    setPageBreadCrumbs([{ title: "Bidders List", path: "/bidders" }]);
  }, [setPageBreadCrumbs, resetCreateBidderResponse]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchBidders();
    };
    fetchInitialData();
  }, [fetchBidders, location.key]);

  if (ErrorResponse?.httpStatus === 500) {
    return <RenderServerError {...ErrorResponse} />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex my-2">
        <Button type="primary" size="large" onClick={() => navigate("create")}>
          Create Bidder
        </Button>
      </div>

      <Table
        rowKey={(record) => record.bidder_id}
        dataSource={bidders}
        columns={[
          {
            title: "Bidder Number",
            dataIndex: "bidder_number",
          },
          {
            title: "Full Name",
            dataIndex: "full_name",
          },
          {
            title: "Date Joined",
            dataIndex: "created_at",
          },
          {
            title: "Action",
            key: "action",
            render: (_, bidder: BaseBidder) => {
              return (
                <Space size="middle">
                  <Tooltip placement="top" title="View Bidder">
                    <Button
                      onClick={() =>
                        navigate(`/bidders/${bidder.bidder_id}/profile`)
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
