import { View, Image, Text } from "@react-pdf/renderer";
import moment from "moment";
import atc_receipt_logo from "@assets/atc_receipt_logo.png";

const InvoiceHeading = ({ bidder }: any) => {
  return (
    <View
      fixed
      style={{ marginBottom: 20 }}
      render={() => {
        return (
          <>
            <View style={{ fontWeight: "bold", flexDirection: "row" }}>
              <Image
                src={atc_receipt_logo}
                style={{
                  width: 200,
                  height: 50,
                }}
              />
              <Text
                style={{
                  marginLeft: 20,
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                Auction Date:{" "}
                {moment(new Date(bidder.auction_date)).format(
                  "dddd, MMMM DD, YYYY"
                )}
              </Text>
            </View>
            <View style={{ fontWeight: "bold", flexDirection: "row" }}>
              <Text
                style={{
                  marginLeft: 20,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                NAME:
              </Text>

              <View
                style={{
                  borderTop: 1,
                  borderBottom: 1,
                  borderRight: 1,
                  borderLeft: 1,
                  marginLeft: 5,
                  borderColor: "black",
                }}
              >
                <Text
                  style={{
                    marginBottom: 4,
                    fontSize: 10,
                    width: 225,
                    alignItems: "center",
                    paddingTop: 3,
                    paddingLeft: 2,
                  }}
                >
                  {bidder.full_name}
                </Text>
              </View>
              <View style={{ display: "flex", alignItems: "flex-end" }}>
                <Text
                  style={{
                    marginTop: -30,
                    fontSize: 12,
                    paddingTop: 3,
                    paddingLeft: 2,
                  }}
                >
                  BIDDER
                </Text>
                <Text
                  style={{
                    marginTop: 0,
                    fontSize: 12,
                    paddingTop: 3,
                    paddingLeft: 2,
                  }}
                >
                  No:
                </Text>
              </View>
              <View
                style={{
                  borderTop: 1,
                  borderBottom: 1,
                  borderRight: 1,
                  borderLeft: 1,
                  marginLeft: 5,
                  marginTop: -30,
                  width: 200,
                  display: "flex",
                  justifyContent: "center",
                  borderColor: "black",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 40,
                    paddingTop: 3,
                    paddingLeft: 2,
                    display: "flex",
                    justifyContent: "center",
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

export default InvoiceHeading;
