import { Document, Page, Font, View, StyleSheet } from "@react-pdf/renderer";

import RefundHeading from "./RefundHeading";
import RefundTableHeader from "./RefundTableHeader";
import RefundReceiptTop from "./RefundReceiptTop";
import RefundTableRow from "./RefundTableRow";

import RefundTableFooter from "./RefundTableFooter";
import RefundSignatories from "./RefundSignatories";

import ArialRegular from "@assets/fonts/arial/ARIAL.TTF";
import ArialBold from "@assets/fonts/arial/ArialCEMTBlack.ttf";
import { useEffect, useState } from "react";
Font.register({
  family: "Arial",
  fonts: [
    { src: ArialRegular },
    {
      src: ArialBold,
      fontweight: "bold",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Arial",
    flexDirection: "column",
    backgroundColor: "#fff",
    paddingTop: 5,
    paddingLeft: 5,
    paddingBottom: 50,
  },
});

interface RefundDocumentProps {
  bidder: {
    receipt_number: string;
    auction_date: string;
    full_name: string;
  };
  items: {
    barcode: string;
    price: number;
    control: string;
    description: string;
    qty: string;
    remarks?: string;
  }[];
}

const RefundDocument: React.FC<RefundDocumentProps> = ({ bidder, items }) => {
  const [reason, setReason] = useState<string | null>();

  useEffect(() => {
    if (items.length && items[0]) {
      setReason(items[0].remarks);
    }
  }, [items]);
  return (
    <Document pageMode="fullScreen">
      <Page size="A4" style={styles.page} wrap={true}>
        <RefundReceiptTop bidder={bidder} />
        <RefundHeading bidder={bidder} />
        <View
          style={{
            display: "flex",
            width: 580,
            borderRight: 1,
            borderLeft: 1,
          }}
        >
          <RefundTableHeader />
          <RefundTableRow items={items} />
        </View>
        <View>
          <RefundTableFooter reason={reason} />
          <RefundSignatories />
        </View>
      </Page>
    </Document>
  );
};

export default RefundDocument;
