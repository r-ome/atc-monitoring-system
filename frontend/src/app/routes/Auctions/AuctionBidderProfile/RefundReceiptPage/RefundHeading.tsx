import { View, Image, Text } from "@react-pdf/renderer";
import moment from "moment";
import atc_receipt_logo from "@assets/atc_receipt_logo.png";

const RefundHeading = ({ bidder }: any) => {
  return (
    <View
      fixed
      style={{ marginBottom: 20 }}
      render={() => {
        return (
          <>
            <View style={{ flexDirection: "row" }}>
              <Image
                src={atc_receipt_logo}
                style={{ width: 200, height: 50 }}
              />
              <View
                style={{
                  borderTop: 1,
                  borderBottom: 1,
                  borderRight: 1,
                  borderLeft: 1,
                  marginLeft: 5,
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 5,
                  fontSize: 10,
                  width: 190,
                }}
              >
                <Text>Auction Date:</Text>
                <Text
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: 10,
                    marginTop: 5,
                    fontWeight: "bold",
                  }}
                >
                  {moment(new Date(bidder.auction_date)).format(
                    "dddd, MMMM DD, YYYY"
                  )}
                </Text>
              </View>
              <View
                style={{
                  borderTop: 1,
                  borderBottom: 1,
                  borderRight: 1,
                  borderLeft: 1,
                  marginLeft: 5,
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 5,
                  fontSize: 10,
                  width: 180,
                }}
              >
                <Text>BIDDER No:</Text>
                <Text
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: 18,
                  }}
                >
                  {bidder.receipt_number}
                </Text>
              </View>
            </View>
          </>
        );
      }}
    ></View>
  );
};

export default RefundHeading;
