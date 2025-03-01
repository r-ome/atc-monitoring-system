import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePageLayoutProps } from "@layouts";
import { useBreadcrumbs } from "app/hooks";
import { useAuction } from "@context";
import { formatNumberToCurrency } from "@lib/utils";
import { AuctionItemDetails } from "@types";
import { AUCTIONS_401, AUCTIONS_403 } from "../errors";
import {
  Button,
  Card,
  Descriptions,
  Skeleton,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import AuctionActionModal from "./AuctionActionModal";

export type actions =
  | "reassign"
  | "cancel"
  | "less"
  | "refund"
  | "discrepancy"
  | "void";

const AuctionItemProfile = () => {
  const params = useParams();
  const [modalState, setModalState] = useState<{
    open: boolean;
    action: actions;
    title: string;
  }>({ open: false, action: "cancel", title: "" });
  const { setBreadcrumb } = useBreadcrumbs();
  const { openNotification } = usePageLayoutProps();
  const {
    auctionItemDetails,
    registeredBidders,
    fetchAuctionItemDetails,
    fetchRegisteredBidders,
    isLoading,
    actionItemResponse,
    error: ErrorResponse,
    resetActionItem,
  } = useAuction();

  useEffect(() => {
    setBreadcrumb({ title: `Item`, path: ``, level: 4 });
  }, [setBreadcrumb]);

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
        setModalState({ open: false, action: "cancel", title: "" });
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

  const renderActionButtons = (itemDetails: AuctionItemDetails) => {
    const { inventory, auction_inventory: auctionInventory } = itemDetails;
    const inAuction = auctionInventory?.auction_inventory_id;

    const handleModalState = (action: actions, title: string) => {
      setModalState({ open: true, action, title });
    };

    const actionsState = [
      {
        action: "void",
        label: "Void Item",
        color: "red",
        show: true,
      },
      {
        action: "cancel",
        label: "Cancel Item",
        color: "red",
        show: inAuction && auctionInventory.status === "CANCELLED",
      },
      {
        action: "reassign",
        label: "Reassign Item",
        show:
          inventory.status === "VOID" ||
          (inAuction && auctionInventory.status !== "CANCELLED"),
        color: "blue",
      },
      {
        action: "refund",
        label: "Refund Item",
        show: inAuction && auctionInventory.status !== "PAID",
        color: "green",
      },
      {
        action: "less",
        label: "Less Item",
        show:
          inAuction &&
          auctionInventory.status &&
          ["PAID", "CANCELLED"].includes(auctionInventory.status),
        color: "green",
      },
    ];

    return (
      <div className="flex gap-4">
        {actionsState.map((item, i) => {
          return (
            <Button
              key={i}
              variant="outlined"
              className={`${item.show ? "" : "hidden"}`}
              color={item.color as BaseButtonProps["color"]}
              onClick={() =>
                handleModalState(item.action as actions, item.label)
              }
            >
              {item.label}
            </Button>
          );
        })}
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
        title={auctionItemDetails.inventory.barcode}
        column={4}
        extra={renderActionButtons(auctionItemDetails)}
        items={[
          {
            key: "1",
            label: "Barcode",
            span: 2,
            children: auctionItemDetails.inventory.barcode,
          },
          {
            key: "2",
            label: "Control Number",
            span: 2,
            children: auctionItemDetails.inventory.control,
          },
          {
            key: "3",
            label: "Description",
            span: 2,
            children: auctionItemDetails.inventory.description,
          },
          {
            key: "4",
            label: "QTY",
            span: 2,
            children: auctionItemDetails?.auction_inventory?.qty || "N/A",
          },
          {
            key: "5",
            label: "Price",
            span: 2,
            children: formatNumberToCurrency(
              auctionItemDetails?.auction_inventory?.price || 0
            ),
          },
          {
            key: "6",
            label: "Bidder",
            children:
              auctionItemDetails?.auction_inventory?.bidder.bidder_number,
          },
          {
            key: "7",
            label: "Status",
            span: 1,
            children: (
              <span
                className={`${
                  auctionItemDetails?.auction_inventory?.status === "PAID"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {auctionItemDetails?.auction_inventory?.status}
              </span>
            ),
          },
        ]}
      ></Descriptions>

      {auctionItemDetails.histories.length ? (
        <div className="w-full py-4 flex flex-col">
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
                    <Tag
                      color={`${
                        ["UNPAID", "CANCELLED"].includes(history.status)
                          ? "red"
                          : "green"
                      }`}
                    >
                      {history.status}
                    </Tag>{" "}
                    {history.remarks ? `- ${history.remarks}` : null}
                  </div>
                ),
              }))}
            />
          </div>
        </div>
      ) : null}

      {modalState.open ? (
        <AuctionActionModal
          inventory={auctionItemDetails}
          open={modalState.open}
          action={modalState.action}
          title={modalState.title}
          onCancel={() =>
            setModalState({ open: false, action: "cancel", title: "" })
          }
        />
      ) : null}
    </Card>
  );
};

export default AuctionItemProfile;
