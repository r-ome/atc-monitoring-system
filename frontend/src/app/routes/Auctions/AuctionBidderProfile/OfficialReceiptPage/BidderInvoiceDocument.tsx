import { Document, Page, Font, View, StyleSheet } from "@react-pdf/renderer";

import InvoiceHeading from "./InvoiceHeading";
import InvoiceTableHeader from "./InvoiceTableHeader";
import BidderReceiptTop from "./BidderReceiptTop";
import BidderReceiptBottom from "./BidderReceiptBottom";
import InvoiceTableRow from "./InvoiceTableRow";

import InvoiceTableFooter from "./InvoiceTableFooter";
import InvoiceTermsAndConditions from "./InvoiceTermsAndConditions";
import InvoiceSignatories from "./InvoiceSignatories";

import ArialRegular from "@assets/fonts/arial/ARIAL.TTF";
import ArialBold from "@assets/fonts/arial/ArialCEMTBlack.ttf";
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

interface BidderInvoiceDocumentProps {
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
    bidder: string;
    qty: string;
  }[];
}

const BidderInvoiceDocument: React.FC<BidderInvoiceDocumentProps> = ({
  bidder,
  items,
}) => {
  const chunkSize = 25;
  const newArr = items.reduce((acc: any, _: any, i: any) => {
    if (i % chunkSize === 0) {
      acc.push({ items: items.slice(i, i + chunkSize) });
    }
    return acc;
  }, []);

  const totalItemPrice = items.reduce((acc: any, item: any) => {
    return (acc = acc + item.price);
  }, 0);

  return (
    <Document pageMode="fullScreen">
      {newArr.map((item: any, i: number, arr: any) => {
        return (
          <Page size="A4" key={i} style={styles.page} wrap={true}>
            <BidderReceiptTop bidder={bidder} />
            <InvoiceHeading bidder={bidder} />
            <View
              style={{
                display: "flex",
                width: 585,
                borderRight: 1,
                borderLeft: 1,
              }}
            >
              <InvoiceTableHeader />
              <InvoiceTableRow items={item.items} />
            </View>
            {i === arr.length - 1 ? (
              <View>
                <InvoiceTableFooter
                  bidder={bidder}
                  totalItemPrice={totalItemPrice}
                />
                <InvoiceTermsAndConditions />
                <InvoiceSignatories bidder={bidder} />
              </View>
            ) : null}
            <BidderReceiptBottom bidder={bidder} />
          </Page>
        );
      })}
    </Document>
  );
};

export default BidderInvoiceDocument;
