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
import BidderInvoiceDocument from "./BidderInvoiceDocument";
import { useBreadcrumbs } from "app/hooks";

interface ReceiptViewerProps {
  bidder?: BidderAuctionProfile | PaymentDetails;
  items?: BidderAuctionItem[] | AuctionInventory[];
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = () => {
  let location = useLocation();
  const [bidder, setBidder] = useState<BidderAuctionProfile | null>();
  const [items, setItems] = useState<BidderAuctionItem[] | null>();
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
      const { bidder, items } = location?.state;
      if (bidder && items) {
        setBidder(bidder);
        setItems(items);
      }
    }
  }, [location]);

  if (!bidder || !items) return <Skeleton />;

  return (
    <PDFViewer showToolbar={false} className="w-full h-screen">
      <BidderInvoiceDocument bidder={bidder} items={items} />
    </PDFViewer>
  );
};
export default ReceiptViewer;
