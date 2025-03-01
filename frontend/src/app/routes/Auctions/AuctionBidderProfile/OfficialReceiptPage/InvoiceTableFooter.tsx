import { Text, View, StyleSheet } from "@react-pdf/renderer";

const rowAttributes = {
  borderRightColor: "black",
  paddingTop: 5,
  borderBottom: 1,
  fontSize: 10,
};
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    height: 24,
    fontSize: 10,
    borderLeft: 1,
    borderColor: "#000",
  },
  totalNoOfItemsLabel: {
    ...rowAttributes,
    width: "30%",
    textAlign: "right",
    paddingRight: 3,
    borderRight: 1,
  },
  totalNoOfItemsValue: {
    ...rowAttributes,
    paddingLeft: 3,
    width: "45%",
    textAlign: "center",
    fontWeight: "bold",
    borderRight: 1,
  },
  totalLabel: {
    ...rowAttributes,
    fontWeight: "bold",
    width: "10%",
    textAlign: "center",
    borderRight: 1,
  },
  totalValue: {
    ...rowAttributes,
    textAlign: "right",
    paddingRight: 5,
    width: "15%",
  },
});

const InvoiceTableFooter = ({ bidder, totalItemPrice }: any) => {
  const serviceCharge = parseInt(bidder.service_charge, 10);
  const totalPrice = totalItemPrice;
  const grandTotalPrice = bidder.balance || bidder.amount_paid;
  const serviceChargeAmount = (totalPrice * serviceCharge) / 100;

  const receiptNumber = bidder.receipt_number.split("-");
  const less =
    receiptNumber.length > 1 && parseInt(receiptNumber[1]) > 1
      ? 0
      : bidder.registration_fee;

  return (
    <View
      style={{
        display: "flex",
        borderRight: 1,
        borderColor: "#000",

        width: 585,
      }}
    >
      <View style={styles.row} wrap={false}>
        <Text style={styles.totalNoOfItemsLabel}>TOTAL No. OF ITEMS:</Text>
        <Text style={styles.totalNoOfItemsValue}>
          {bidder.total_unpaid_items}
        </Text>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>{totalPrice.toLocaleString()}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.totalNoOfItemsLabel}>PULL OUT BY:</Text>
        <Text style={styles.totalNoOfItemsValue}></Text>
        <Text style={styles.totalLabel}>{bidder.service_charge}%</Text>
        <Text style={styles.totalValue}>
          {serviceChargeAmount.toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.totalNoOfItemsLabel}>CHECKED BY:</Text>
        <Text style={styles.totalNoOfItemsValue}></Text>
        <Text style={styles.totalLabel}>LESS</Text>
        <Text style={{ ...styles.totalValue, backgroundColor: "#feb2b2" }}>
          {less}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.totalNoOfItemsLabel}>PULL OUT DATE:</Text>
        <Text style={{ ...styles.totalNoOfItemsValue, width: "30%" }}></Text>
        <Text
          style={{
            ...styles.totalLabel,
            width: "25%",
            textAlign: "right",
            paddingRight: 5,
          }}
        >
          STORAGE FEE
        </Text>
        <Text style={styles.totalValue}></Text>
      </View>

      <View style={{ ...styles.row, backgroundColor: "#bff0fd" }}>
        <Text style={{ ...styles.totalNoOfItemsLabel, borderRight: 0 }}></Text>
        <Text
          style={{
            ...styles.totalNoOfItemsValue,
            width: "30%",
            borderRight: 0,
          }}
        ></Text>
        <Text
          style={{
            ...styles.totalLabel,
            width: "25%",
            textAlign: "right",
            paddingRight: 5,
          }}
        >
          GRAND TOTAL
        </Text>
        <Text
          style={{
            ...styles.totalValue,
            fontWeight: "bold",
            backgroundColor:
              parseInt(bidder.balance, 10) < 0 ? "#feb2b2" : "transparent",
          }}
        >
          {grandTotalPrice < 0
            ? `(${(grandTotalPrice * -1).toLocaleString()})`
            : grandTotalPrice.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

export default InvoiceTableFooter;
