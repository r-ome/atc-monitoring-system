import { Text, View, StyleSheet } from "@react-pdf/renderer";

const rowAttributes = {
  borderRightColor: "black",
  paddingTop: 8,
  borderRight: 1,
  paddingRight: 5,
  borderBottom: 1,
  fontSize: 10,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    height: 30,
    fontSize: 10,
    borderLeft: 1,
    borderColor: "#000",
  },
  remarks: {
    ...rowAttributes,
    width: "30%",
    textAlign: "right",
    paddingRight: 3,
  },
  remarksValueRow: {
    ...rowAttributes,
    width: "70%",
  },
  remarksValuePartial: {
    position: "absolute",
    right: 5,
    bottom: 12,
    fontSize: 8,
  },
  remarksValueBalance: {
    position: "absolute",
    right: 60,
    bottom: 0,
    fontSize: 8,
  },
  signature: {
    ...rowAttributes,
    fontWeight: "bold",
    width: "10%",
    textAlign: "center",
  },
  totalValue: {
    ...rowAttributes,
    borderRight: 0,
    textAlign: "right",
    width: "15%",
    paddingRight: 5,
  },
});

const InvoiceSignatories = ({ bidder }: any) => {
  return (
    <View style={{ width: 585 }}>
      <View style={styles.row}>
        <Text style={{ ...styles.remarks }}>REMARKS</Text>
        <View style={{ ...styles.remarksValueRow }}>
          <Text style={styles.remarksValuePartial}>PARTIAL: ____________</Text>
          <Text style={styles.remarksValueBalance}>BALANCE:</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.remarks}>SIGNATURE:</Text>
        <Text
          style={{
            ...styles.remarksValueRow,
            paddingLeft: 10,
            textAlign: "center",
            paddingTop: 15,
            fontSize: 10,
            width: "30%",
          }}
        >
          {bidder.full_name}
        </Text>
        <Text
          style={{
            width: "20%",
            borderRight: 1,
            borderBottom: 1,
            borderColor: "black",
            textAlign: "center",
            paddingTop: 10,
          }}
        >
          SIGNATURE:
        </Text>
        <Text
          style={{
            width: "20%",
            borderRight: 1,
            borderBottom: 1,
            borderColor: "black",
          }}
        ></Text>
      </View>
    </View>
  );
};

export default InvoiceSignatories;
