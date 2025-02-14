import { Table } from "@components";
import { usePayments } from "@context";

const TransactionsTable: React.FC = () => {
  const { bidderTransactions, isLoading } = usePayments();
  return (
    <>
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Bidder Transactions</h1>
      </div>

      <Table
        data={bidderTransactions}
        loading={isLoading}
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
