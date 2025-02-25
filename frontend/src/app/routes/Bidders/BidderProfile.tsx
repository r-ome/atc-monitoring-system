import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useBidderRequirement, useBidders } from "@context";
import { usePageLayoutProps } from "@layouts";
import { Button, Card, Descriptions, Skeleton, Table, Tag } from "antd";
import { BIDDERS_402 } from "../errors";
import { formatNumberToCurrency } from "@lib/utils";
import { useBreadcrumbs } from "app/hooks";
import CreateBidderRequirement from "./CreateBidderRequirement";
import UpdateBidderModal from "./UpdateBidderModal";
import BanBidderModal from "./BanBidderModal";
import { Bidder } from "@types";

const BidderProfile = () => {
  const params = useParams();
  const { openNotification } = usePageLayoutProps();
  const [isCreateRequirementModalOpen, setIsCreateRequirementModalOpen] =
    useState<boolean>(false);
  const [isUpdateBidderModalOpen, setIsUpdateBidderModalOpen] =
    useState<boolean>(false);
  const [isBanBidderModalOpen, setIsBanBidderModalOpen] =
    useState<boolean>(false);
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
          await fetchBidder(bidder.bidder_id);
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

  const renderDescriptionItems = (bidder: Bidder) => {
    const items = [
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
        label: "Birth Date",
        span: 1,
        children: bidder.birthdate
          ? moment(bidder.birthdate).format("MMMM DD, YYYY")
          : "NO BIRTHDATE RECORDED",
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
        children: bidder.service_charge ? `${bidder.service_charge}%` : "0%",
      },
      {
        key: "7",
        label: "Date Joined",
        span: 2,
        children: moment(bidder.created_at).format("MMMM DD, YYYY"),
      },
      {
        key: "8",
        label: "Registered at",
        span: 2,
        children: bidder.registered_at,
      },
      {
        key: "9",
        label: <span className="text-red-500">Reason for being BANNED</span>,
        span: 4,
        children: bidder.remarks,
      },
    ];

    return bidder.status !== "BANNED"
      ? [...items.slice(0, 7), ...items.slice(7 + 1)]
      : items;
  };

  if (!bidder) return <Skeleton />;

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
                  <div className="flex gap-2">
                    <Button
                      type="primary"
                      disabled={bidder.status === "BANNED"}
                      onClick={() => {
                        setIsUpdateBidderModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="red"
                      variant="solid"
                      onClick={() => {
                        setIsBanBidderModalOpen(true);
                      }}
                    >
                      {bidder.status === "BANNED" ? "UNBAN" : "BAN"} BIDDER
                    </Button>
                  </div>
                }
                title={
                  <>
                    <Tag
                      color={`${bidder.status === "BANNED" ? "red" : "green"}`}
                    >
                      {bidder.status}
                    </Tag>
                    {bidder?.bidder_number} - {bidder?.full_name}{" "}
                  </>
                }
                items={renderDescriptionItems(bidder)}
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
                  disabled={bidder.status === "BANNED"}
                  onClick={() => setIsCreateRequirementModalOpen(true)}
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
          <UpdateBidderModal
            open={isUpdateBidderModalOpen}
            onCancel={() => setIsUpdateBidderModalOpen(false)}
            bidder={bidder}
          />
          <BanBidderModal
            open={isBanBidderModalOpen}
            onCancel={() => setIsBanBidderModalOpen(false)}
            bidder={bidder}
          />
          <CreateBidderRequirement
            open={isCreateRequirementModalOpen}
            onCancel={() => setIsCreateRequirementModalOpen(false)}
            bidder={bidder}
          />
        </div>
      </div>
    </>
  );
};

export default BidderProfile;
