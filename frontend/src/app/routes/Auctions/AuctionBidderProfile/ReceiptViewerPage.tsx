import { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { useLocation } from "react-router-dom";
import {
  BidderAuctionProfile,
  BidderAuctionItem,
  PaymentDetails,
  AuctionInventory,
} from "@types";
import { Skeleton } from "antd";
import { useBreadcrumbs } from "app/hooks";
import BidderInvoiceDocument from "./OfficialReceiptPage/BidderInvoiceDocument";
import BidderRefundDocument from "./RefundReceiptPage/RefundDocument";

interface ReceiptViewerPageProps {
  bidder?: BidderAuctionProfile | PaymentDetails;
  items?: BidderAuctionItem[] | AuctionInventory[];
}

type action = "invoice" | "refund";

const ReceiptViewerPage: React.FC<ReceiptViewerPageProps> = () => {
  let location = useLocation();
  const [bidder, setBidder] = useState<BidderAuctionProfile | null>();
  const [items, setItems] = useState<BidderAuctionItem[] | null>();
  const [action, setAction] = useState<action | null>();
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    if (bidder) {
      setBreadcrumb({
        title: `Receipt ${bidder.receipt_number}`,
        level: 5,
      });
    }
  }, [bidder, setBreadcrumb]);

  useEffect(() => {
    if (location) {
      const { bidder, items, action } = location?.state;
      if (bidder && items) {
        setBidder(bidder);
        setItems(items);
        setAction(action);
      }
    }
  }, [location]);

  if (!bidder || !items) return <Skeleton />;

  return (
    <PDFViewer showToolbar={false} className="w-full h-screen">
      {action === "invoice" ? (
        <BidderInvoiceDocument bidder={bidder} items={items} />
      ) : (
        <BidderRefundDocument bidder={bidder} items={items} />
      )}
    </PDFViewer>
  );
};
export default ReceiptViewerPage;
