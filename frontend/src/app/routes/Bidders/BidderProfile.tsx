import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBidderRequirement, useBidders } from "@context";
import { usePageLayoutProps } from "@layouts";
import { Button, Card, Descriptions, Skeleton, Table } from "antd";
import CreateBidderRequirement from "./CreateBidderRequirement";
import { BIDDERS_402 } from "../errors";

const BidderProfile = () => {
  const params = useParams();
  const { openNotification, setPageBreadCrumbs } = usePageLayoutProps();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const {
    bidder,
    isLoading: isFetchingBidder,
    fetchBidder,
    error: ErrorResponse,
  } = useBidders();
  const { requirement, resetBidderRequirement } = useBidderRequirement();

  useEffect(() => {
    if (bidder) {
      setPageBreadCrumbs([
        { title: "Bidders List", path: "/bidders" },
        { title: `${bidder.full_name}'S PROFILE` },
      ]);
    }
  }, [bidder, setPageBreadCrumbs]);

  useEffect(() => {
    const { bidder_id: bidderId } = params;
    if (bidderId) {
      const fetchInitialData = async () => {
        await fetchBidder(bidderId);
      };
      fetchInitialData();
    }
  }, [params, fetchBidder]);

  useEffect(() => {
    if (!isFetchingBidder) {
      if (ErrorResponse) {
        if (ErrorResponse?.error === BIDDERS_402) {
          openNotification(
            "Bidder does not exist. Please go back to list and choose another one",
            "error",
            "Server Error"
          );
        }
        if (ErrorResponse?.httpStatus === 500) {
          openNotification(
            "There might be problems in the server. Please contact your admin.",
            "error",
            "Server Error"
          );
        }
      }
    }
  }, [ErrorResponse, isFetchingBidder, openNotification]);

  useEffect(() => {
    if (bidder) {
      if (requirement && !isFetchingBidder) {
        const fetchInitialData = async () => {
          fetchBidder(bidder.bidder_id);
        };
        openNotification("Successfully Added Bidder Requirement");
        fetchInitialData();
        resetBidderRequirement();
      }
    }
  }, [
    resetBidderRequirement,
    fetchBidder,
    isFetchingBidder,
    requirement,
    bidder,
    openNotification,
  ]);

  if (!bidder) {
    return <Skeleton />;
  }

  return (
    <>
      <div className="h-full">
        <div className="flex flex-grow gap-2">
          <div className="w-2/6 h-full">
            <Card loading={isFetchingBidder}>
              <Descriptions
                size="small"
                layout="vertical"
                bordered
                extra={
                  <Button
                    type="primary"
                    onClick={() => {
                      openNotification("TO DO: EDIT BIDDER");
                    }}
                  >
                    Edit
                  </Button>
                }
                title={`${bidder?.bidder_number} - ${bidder?.full_name}`}
                items={[
                  {
                    key: "1",
                    label: "Bidder Number",
                    span: 1,
                    children: bidder.bidder_number,
                  },
                  {
                    key: "2",
                    label: "Full Name",
                    span: 2,
                    children: `${bidder.first_name} ${bidder.middle_name} ${bidder.last_name}`,
                  },
                  {
                    key: "3",
                    label: "Date Joined",
                    span: 3,
                    children: bidder.created_at,
                  },
                ]}
              ></Descriptions>
            </Card>
          </div>

          <Card
            className="w-4/6 py-4 h-full"
            title={
              <div className="flex justify-between items-center w-full p-2">
                <h1 className="text-3xl font-bold">Requirements</h1>
                <Button
                  type="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Add Bidder Requirement
                </Button>
              </div>
            }
          >
            <Table
              bordered
              loading={isFetchingBidder}
              rowKey={(row) => row.requirement_id}
              dataSource={bidder.requirements}
              pagination={false}
              columns={[
                { title: "Requirement Name", dataIndex: "name" },
                { title: "Valid Until", dataIndex: "validity_date" },
              ]}
            />
          </Card>
          <CreateBidderRequirement
            open={isCreateModalOpen}
            onCancel={() => setIsCreateModalOpen(false)}
            bidder={bidder}
          />
        </div>
      </div>
    </>
  );
};

export default BidderProfile;
