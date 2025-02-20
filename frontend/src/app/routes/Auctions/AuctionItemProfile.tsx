import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { usePageLayoutProps, BreadcrumbsType } from "@layouts";
import { useSession } from "app/hooks";
import { useAuction } from "@context";
import { formatNumberToCurrency } from "@lib/utils";
import { RHFInputNumber, RHFSelect, RHFTextArea } from "@components";
import { AuctionItemDetails, ReassignPayload, RefundPayload } from "@types";
import { ExclamationCircleTwoTone, WarningTwoTone } from "@ant-design/icons";
import { AUCTIONS_401, AUCTIONS_403 } from "../errors";
import {
  Button,
  Card,
  Descriptions,
  Modal,
  Skeleton,
  Timeline,
  Typography,
} from "antd";

type actions = "reassign" | "cancel" | "less" | "refund" | "discrepancy";

const AuctionItemProfile = () => {
  const params = useParams();
  const methods = useForm();
  const [modalState, setModalState] = useState<{
    open: boolean;
    action?: actions;
    title?: string;
  }>({ open: false });
  const { pageBreadcrumbs, setPageBreadCrumbs, openNotification } =
    usePageLayoutProps();
  const [breadcrumbsSession] = useSession<BreadcrumbsType[]>(
    "breadcrumbs",
    pageBreadcrumbs
  );
  const {
    auctionItemDetails,
    registeredBidders,
    fetchAuctionItemDetails,
    fetchRegisteredBidders,
    isLoading,
    actionItemResponse,
    error: ErrorResponse,
    cancelItem,
    refundItem,
    reassignItem,
    resetActionItem,
  } = useAuction();

  useEffect(() => {
    if (!breadcrumbsSession) return;
    setPageBreadCrumbs(breadcrumbsSession);
  }, [breadcrumbsSession, setPageBreadCrumbs]);

  useEffect(() => {
    setPageBreadCrumbs((prevBreadcrumbs) => {
      const newBreadcrumb = {
        title: `Item`,
        path: ``,
      };
      const doesExist = prevBreadcrumbs.find(
        (item) => item.title === newBreadcrumb.title
      );
      if (doesExist) {
        return prevBreadcrumbs;
      }

      const updatedBreadcrumbs = [
        ...prevBreadcrumbs.filter((item) => item.title !== newBreadcrumb.title),
        newBreadcrumb,
      ];
      return updatedBreadcrumbs;
    });
  }, [setPageBreadCrumbs]);

  useEffect(() => {
    const { auction_id: auctionId, auction_inventory_id: auctionInventoryId } =
      params;
    if (auctionId && auctionInventoryId) {
      const fetchInitialData = async () => {
        await fetchAuctionItemDetails(auctionId, auctionInventoryId);
        await fetchRegisteredBidders(auctionId);
      };
      fetchInitialData();
    }
  }, [params, fetchAuctionItemDetails, fetchRegisteredBidders]);

  useEffect(() => {
    const { auction_id: auctionId, auction_inventory_id: auctionInventoryId } =
      params;
    if (auctionId && auctionInventoryId) {
      if (actionItemResponse) {
        const fetchInitialData = async () => {
          await fetchAuctionItemDetails(auctionId, auctionInventoryId);
        };
        let message = "Success!";
        if (modalState.action === "cancel")
          message = "Successfully Cancelled Item!";
        if (modalState.action === "refund" || modalState.action === "less")
          message = "Successfully refunded Item!";
        if (modalState.action === "reassign")
          message = "Successfully reassigned Item!";
        fetchInitialData();
        resetActionItem();
        openNotification(message);
        setModalState({ open: false });
      }
    }
  }, [
    params,
    fetchAuctionItemDetails,
    resetActionItem,
    actionItemResponse,
    isLoading,
    openNotification,
    modalState.action,
  ]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        let message = "Server Error";
        if (ErrorResponse.httpStatus === 500) {
          message =
            "There might be problems in the server. Please contact your admin.";
        }
        if ([AUCTIONS_403, AUCTIONS_401].includes(ErrorResponse.error)) {
          message = "Please double check the item and the bidder";
        }
        openNotification(message, "error", "Error");
      }
    }
  }, [ErrorResponse, isLoading, openNotification]);

  const handleSubmit = methods.handleSubmit(async (data) => {
    const { auction_id: auctionId } = params;
    if (auctionItemDetails && auctionId) {
      const { auction_inventory_id: auctionInventoryId } = auctionItemDetails;
      if (modalState.action === "cancel") {
        await cancelItem(auctionId, auctionInventoryId, data.reason);
      }

      if (modalState.action === "refund" || modalState.action === "less") {
        await refundItem(auctionId, auctionInventoryId, {
          new_price: data.new_price,
        } as RefundPayload);
      }

      if (modalState.action === "reassign") {
        await reassignItem(auctionId, auctionInventoryId, {
          new_bidder_number: data.new_bidder_number,
        } as ReassignPayload);
      }
    }
  });

  const renderActionButtons = (itemDetails: AuctionItemDetails) => {
    const { auction_status: auctionStatus } = itemDetails;

    const handleModalState = (action: actions, title: string) => {
      setModalState({ open: true, action, title });
    };

    return (
      <div className="flex gap-4">
        {auctionStatus === "CANCELLED" ? (
          <Button
            color="blue"
            variant="outlined"
            onClick={() => handleModalState("reassign", "Reassign Item")}
          >
            Reassign Item
          </Button>
        ) : (
          <>
            <Button
              danger
              onClick={() => handleModalState("cancel", "Cancel Item")}
            >
              Cancel Item
            </Button>
            {auctionStatus === "PAID" ? (
              <Button
                color="green"
                variant="outlined"
                onClick={() => handleModalState("refund", "Refund Item")}
              >
                Refund Item
              </Button>
            ) : (
              <Button
                color="green"
                variant="outlined"
                onClick={() => handleModalState("less", "Less Item")}
              >
                Less Item
              </Button>
            )}
          </>
        )}
      </div>
    );
  };

  if (!auctionItemDetails || !registeredBidders) return <Skeleton />;

  return (
    <Card>
      <Descriptions
        size="default"
        bordered
        layout="horizontal"
        title={auctionItemDetails.barcode_number}
        column={4}
        extra={renderActionButtons(auctionItemDetails)}
        items={[
          {
            key: "1",
            label: "Barcode",
            span: 2,
            children: auctionItemDetails.barcode_number,
          },
          {
            key: "2",
            label: "Control Number",
            span: 2,
            children: auctionItemDetails.control_number,
          },
          {
            key: "3",
            label: "Description",
            span: 2,
            children: auctionItemDetails.description,
          },
          {
            key: "4",
            label: "QTY",
            span: 2,
            children: auctionItemDetails.qty,
          },
          {
            key: "5",
            label: "Price",
            span: 2,
            children: formatNumberToCurrency(auctionItemDetails.price),
          },
          {
            key: "6",
            label: "Bidder",
            children: auctionItemDetails.bidder.bidder_number,
          },
          {
            key: "7",
            label: "Status",
            span: 1,
            children: (
              <span
                className={`${
                  auctionItemDetails.auction_status === "PAID"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {auctionItemDetails.auction_status}
              </span>
            ),
          },
        ]}
      ></Descriptions>

      {auctionItemDetails.histories.length ? (
        <div className="w-4/6 py-4 flex flex-col">
          <div className="flex justify-center my-4">
            <Typography.Title level={3}>Item History</Typography.Title>
          </div>
          <div>
            <Timeline
              mode="left"
              items={auctionItemDetails.histories.map((history) => ({
                label: history.created_at,
                color: history.status === "CANCELLED" ? "red" : "green",
                children: (
                  <div>
                    <Typography.Text strong>{history.status}</Typography.Text>{" "}
                    {history.remarks ? `- ${history.remarks}` : null}
                  </div>
                ),
              }))}
            />
          </div>
        </div>
      ) : null}

      <Modal
        open={modalState.open}
        onOk={handleSubmit}
        okText="Submit"
        confirmLoading={isLoading}
        onCancel={() => setModalState({ open: false })}
      >
        <Typography.Title className="flex gap-2" level={3}>
          {modalState.action === "cancel" ? (
            <WarningTwoTone twoToneColor="#ef4444" className="text-3xl" />
          ) : (
            <ExclamationCircleTwoTone />
          )}
          {modalState.title}
        </Typography.Title>
        {modalState.action === "reassign" ? (
          <form>
            <div className="flex flex-col gap-4">
              <div>
                <Typography.Text className="text-lg">
                  You are about to assign this item to another bidder.
                </Typography.Text>
              </div>
              <div>
                <Typography.Text>Please select a bidder:</Typography.Text>
                <RHFSelect
                  showSearch
                  control={methods.control}
                  name="new_bidder_number"
                  placeholder="Select a Bidder"
                  filterOption={(input: string, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={registeredBidders.bidders
                    .filter(
                      (item) =>
                        item.bidder_id !== auctionItemDetails.bidder.bidder_id
                    )
                    .map((bidder) => ({
                      value: bidder?.bidder_number.toString(),
                      label: `${bidder.bidder_number} - ${bidder.full_name}`,
                    }))}
                  rules={{ required: "This field is required!" }}
                />
              </div>
            </div>
          </form>
        ) : null}

        {modalState.action === "cancel" ? (
          <form>
            <div className="flex flex-col gap-4">
              <div>
                <Typography.Title level={4} className="flex justify-center">
                  You are about to cancel this item. Are you sure?
                </Typography.Title>
              </div>
              <div>
                <Typography.Text>Please add a reason:</Typography.Text>
                <RHFTextArea
                  rows={4}
                  control={methods.control}
                  name="reason"
                  placeholder="Please add a reason"
                  rules={{ required: "This field is required!" }}
                />
              </div>
            </div>
          </form>
        ) : null}

        {modalState.action === "refund" || modalState.action === "less" ? (
          <form>
            <div className="flex flex-col gap-4">
              <div>
                <Descriptions
                  bordered
                  items={[
                    {
                      label: "Bidder",
                      children: `${auctionItemDetails.bidder.bidder_number}`,
                    },
                    {
                      label: "Service Charge",
                      children: `${auctionItemDetails.service_charge}%`,
                    },
                  ]}
                ></Descriptions>
              </div>
              <div>
                <Typography.Text className="text-lg">
                  Please input the <span className="font-bold">NEW</span> price
                  of the item:
                </Typography.Text>
                <RHFInputNumber
                  control={methods.control}
                  addonBefore="₱"
                  name="new_price"
                  placeholder="New Price"
                  rules={{ required: "This field is required!" }}
                />
              </div>
            </div>
          </form>
        ) : null}
      </Modal>
    </Card>
  );
};

export default AuctionItemProfile;
