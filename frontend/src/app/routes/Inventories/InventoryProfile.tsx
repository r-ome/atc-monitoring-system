import { useEffect, useState } from "react";
import moment from "moment";
import { useParams } from "react-router-dom";
import { useInventories } from "@context";
import { usePageLayoutProps } from "@layouts";
import { INVENTORIES_403, SERVER_ERROR_MESSAGE } from "../errors";
import {
  Button,
  Card,
  Descriptions,
  Skeleton,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { formatNumberToCurrency } from "@lib/utils";
import { useBreadcrumbs } from "app/hooks";
import AuctionActionModal from "../Auctions/AuctionActionModal";

type actions =
  | "reassign"
  | "cancel"
  | "less"
  | "refund"
  | "discrepancy"
  | "void";

const InventoryProfilePage = () => {
  const params = useParams();
  const {
    inventoryProfile,
    fetchInventory,
    isLoading,
    error: ErrorResponse,
  } = useInventories();
  const [modalState, setModalState] = useState<{
    open: boolean;
    action: actions;
    title: string;
  }>({ open: false, action: "cancel", title: "" });
  const { openNotification } = usePageLayoutProps();
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumb({ title: "Inventory", level: 3 });
  }, [setBreadcrumb]);

  useEffect(() => {
    const { inventory_id: inventoryId } = params;
    if (inventoryId) {
      const fetchInitialData = async () => {
        await fetchInventory(inventoryId);
      };

      fetchInitialData();
    }
  }, [fetchInventory, params]);

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        if (ErrorResponse.httpStatus === 500) {
          openNotification(SERVER_ERROR_MESSAGE, "error", "Error");
        }

        if (ErrorResponse.error === INVENTORIES_403) {
          openNotification("Inventory doesn't exist!", "error", "Error");
        }
      }
    }
  }, [ErrorResponse, openNotification, isLoading]);

  if (!inventoryProfile) return <Skeleton />;

  return (
    <Card>
      <Descriptions
        size="default"
        bordered
        layout="horizontal"
        title={
          <div className="flex gap-2">
            {inventoryProfile.inventory.barcode}
            <Tag
              color={
                ["SOLD"].includes(inventoryProfile.inventory.status)
                  ? "green"
                  : "red"
              }
            >
              {inventoryProfile.inventory.status}
            </Tag>
            {inventoryProfile?.auction_inventory?.status ? (
              <Tag
                color={
                  inventoryProfile?.auction_inventory?.status === "PAID"
                    ? "green"
                    : "red"
                }
              >
                {inventoryProfile?.auction_inventory?.status}
              </Tag>
            ) : null}
          </div>
        }
        column={4}
        extra={
          <div className="flex gap-2">
            <Button
              variant="outlined"
              color="red"
              onClick={() =>
                setModalState({
                  open: true,
                  action: "void",
                  title: "Void Item",
                })
              }
            >
              Void Item
            </Button>
            <Button type="primary" onClick={() => alert("hello")}>
              Update Item
            </Button>
          </div>
        }
        items={[
          {
            key: "1",
            label: "Barcode",
            span: 2,
            children: inventoryProfile.inventory.barcode,
          },
          {
            key: "2",
            label: "Control Number",
            span: 2,
            children: inventoryProfile.inventory.control,
          },
          {
            key: "3",
            label: "Description",
            span: 2,
            children: inventoryProfile.inventory.description,
          },
          {
            key: "4",
            label: "QTY",
            span: 2,
            children: inventoryProfile?.auction_inventory?.qty || "N/A",
          },
          {
            key: "5",
            label: "Price",
            span: 2,
            children: inventoryProfile.auction_inventory?.price
              ? formatNumberToCurrency(
                  inventoryProfile.auction_inventory.price || 0
                )
              : "N/A",
          },
          {
            key: "6",
            label: "Bidder",
            children:
              inventoryProfile.auction_inventory?.bidder.bidder_number || "N/A",
          },
        ]}
      ></Descriptions>

      {inventoryProfile.histories.length ? (
        <div className="w-full py-4 flex flex-col">
          <div className="flex justify-center my-4">
            <Typography.Title level={3}>Item History</Typography.Title>
          </div>
          <div>
            <Timeline
              mode="left"
              items={inventoryProfile.histories.map((history) => ({
                label: moment(new Date(history.created_at)).format(
                  "MMMM DD, YYYY HH:mm A"
                ),
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
          inventory={inventoryProfile}
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

export default InventoryProfilePage;
