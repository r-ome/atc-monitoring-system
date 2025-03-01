import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Modal, Descriptions, Typography } from "antd";
import { RHFInputNumber, RHFSelect, RHFTextArea } from "@components";
import { ExclamationCircleTwoTone, WarningTwoTone } from "@ant-design/icons";
import {
  ReassignPayload,
  RefundPayload,
  AuctionItemDetails,
  InventoryProfile,
} from "@types";
import { actions } from "./AuctionItemProfile";
import { useAuction } from "@context";

interface AuctionActionModalProps {
  inventory: AuctionItemDetails | InventoryProfile;
  open: boolean;
  action: actions;
  title: string;
  onCancel: () => void;
}

const AuctionActionModal: React.FC<AuctionActionModalProps> = ({
  open = false,
  title = "",
  inventory,
  action,
  onCancel,
}) => {
  const methods = useForm();
  const params = useParams();
  const {
    fetchRegisteredBidders,
    registeredBidders,
    isLoading,
    cancelOrVoidItem,
    refundItem,
    reassignItem,
  } = useAuction();

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      const fetchInitialData = async () => {
        await fetchRegisteredBidders(auctionId);
      };
      fetchInitialData();
    }
  }, [fetchRegisteredBidders, params]);

  const handleSubmit = methods.handleSubmit(async (data) => {
    if (inventory.auction_inventory?.auction_inventory_id) {
      const { auction_inventory: auctionInventory } = inventory;
      if (auctionInventory) {
        if (action === "cancel" || action === "void") {
          await cancelOrVoidItem(
            action,
            auctionInventory.auction_id,
            auctionInventory.auction_inventory_id,
            data.reason
          );
        }

        if (action === "refund" || action === "less") {
          await refundItem(
            auctionInventory.auction_id,
            auctionInventory.auction_inventory_id,
            {
              new_price: data.new_price,
            } as RefundPayload
          );
        }

        if (action === "reassign") {
          await reassignItem(
            auctionInventory.auction_id,
            auctionInventory.auction_inventory_id,
            {
              new_bidder_number: data.new_bidder_number,
            } as ReassignPayload
          );
        }
      }
    }
  });

  return (
    <Modal
      open={open}
      onOk={handleSubmit}
      okText="Submit"
      confirmLoading={isLoading}
      onCancel={onCancel}
    >
      <Typography.Title className="flex gap-2" level={3}>
        {["cancel", "void"].includes(action) ? (
          <WarningTwoTone twoToneColor="#ef4444" className="text-3xl" />
        ) : (
          <ExclamationCircleTwoTone />
        )}
        {title}
      </Typography.Title>

      <form>
        {action === "reassign" ? (
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
                options={registeredBidders?.bidders
                  .filter(
                    (item) =>
                      item.bidder_id !==
                      inventory?.auction_inventory?.bidder.bidder_id
                  )
                  .map((bidder) => ({
                    value: bidder?.bidder_number.toString(),
                    label: `${bidder.bidder_number} - ${bidder.full_name}`,
                  }))}
                rules={{ required: "This field is required!" }}
              />
            </div>
          </div>
        ) : null}

        {["cancel", "void"].includes(action) ? (
          <div className="flex flex-col gap-4">
            <div>
              <Typography.Title level={4} className="flex justify-center">
                You are about to {action.toUpperCase()} this item. Are you sure?
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
        ) : null}

        {action === "refund" || action === "less" ? (
          <div className="flex flex-col gap-4">
            <div>
              <Descriptions
                bordered
                items={[
                  {
                    label: "Bidder",
                    children: `${inventory?.auction_inventory?.bidder.bidder_number}`,
                  },
                  {
                    label: "Service Charge",
                    children: `${inventory?.auction_inventory?.bidder?.service_charge}%`,
                  },
                ]}
              ></Descriptions>
            </div>
            <div>
              <Typography.Text className="text-lg">
                Please input the <span className="font-bold">NEW</span> price of
                the item:
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
        ) : null}
      </form>
    </Modal>
  );
};
export default AuctionActionModal;
