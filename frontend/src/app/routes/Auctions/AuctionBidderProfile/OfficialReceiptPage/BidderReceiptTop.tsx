import { View, Text } from "@react-pdf/renderer";

const BidderReceiptTop = ({ bidder }: any) => (
  <View fixed>
    <Text
      style={{
        position: "absolute",
        fontSize: 8,
        top: 10,
        right: 20,
        textAlign: "center",
        color: "grey",
      }}
      render={() => bidder.receipt_number}
      fixed
    />
  </View>
);

export default BidderReceiptTop;
