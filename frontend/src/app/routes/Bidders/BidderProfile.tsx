import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useBidderRequirement, useBidders } from "@context";
import { usePageLayoutProps } from "@layouts";
import { Button, Card, Descriptions, Skeleton, Table } from "antd";
import CreateBidderRequirement from "./CreateBidderRequirement";
import { BIDDERS_402 } from "../errors";
import { formatNumberToCurrency } from "@lib/utils";
import { useBreadcrumbs } from "app/hooks";

const BidderProfile = () => {
  const params = useParams();
  const { openNotification } = usePageLayoutProps();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const {
    bidder,
    isLoading: isFetchingBidder,
    fetchBidder,
    error: ErrorResponse,
  } = useBidders();
  const { requirement, resetBidderRequirement } = useBidderRequirement();
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    if (bidder) {
      setBreadcrumb({ title: `${bidder.full_name}'S PROFILE`, level: 2 });
    }
  }, [bidder, setBreadcrumb]);

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
                column={4}
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
                    span: 2,
                    children: bidder.bidder_number,
                  },
                  {
                    key: "4",
                    label: "status",
                    span: 2,
                    children: (
                      <span
                        className={`${
                          bidder.status === "BANNED"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {bidder.status}
                      </span>
                    ),
                  },
                  {
                    key: "2",
                    label: "Full Name",
                    span: 2,
                    children: `${bidder.first_name} ${bidder.middle_name} ${bidder.last_name}`,
                  },
                  {
                    key: "3",
                    label: "Birth Date",
                    span: 2,
                    children: moment(bidder.birthdate).format("MMMM DD, YYYY"),
                  },

                  {
                    key: "5",
                    label: "Registration Fee",
                    span: 2,
                    children: bidder.registration_fee
                      ? formatNumberToCurrency(bidder.registration_fee)
                      : formatNumberToCurrency(0),
                  },
                  {
                    key: "6",
                    label: "Service Charge",
                    span: 2,
                    children: bidder.service_charge
                      ? `${bidder.service_charge}%`
                      : "0%",
                  },
                  {
                    key: "7",
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
