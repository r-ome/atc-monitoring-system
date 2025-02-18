import { Table } from "@components";
import { useNavigate } from "react-router-dom";
import { usePayments } from "@context";
import { BidderAuctionTransaction } from "@types";

const TransactionsTable: React.FC = () => {
  const navigate = useNavigate();
  const { bidderTransactions, isLoading } = usePayments();
  return (
    <>
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Bidder Transactions</h1>
      </div>

      <Table
        data={bidderTransactions}
        loading={isLoading}
        onRowClick={(payment: BidderAuctionTransaction) => {
          if (payment.purpose === "REGISTRATION") {
            alert("NOTHING TO SEE HERE");
          } else {
            navigate(`../payments/${payment.payment_id}`);
          }
        }}
        rowKeys={[
          "created_at",
          "amount_paid",
          "purpose",
          "receipt_number",
          "total_items",
          "payment_type",
        ]}
        columnHeaders={[
          "Date",
          "Amount Paid",
          "purpose",
          "Receipt Number",
          "Total Items",
          "Payment Type",
        ]}
      />
    </>
  );
};

export default TransactionsTable;
