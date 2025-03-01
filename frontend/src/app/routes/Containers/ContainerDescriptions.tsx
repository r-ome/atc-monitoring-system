import moment from "moment";
import { Descriptions } from "antd";
import { Container } from "@types";
import { formatNumberToCurrency } from "@lib/utils";

interface ContainerDescriptionsProps {
  container: Container;
}

const ContainerDescriptions: React.FC<ContainerDescriptionsProps> = ({
  container,
}) => {
  const formatDate = (date: string) =>
    moment(new Date(date)).format("MMMM DD, YYYY");

  return (
    <Descriptions
      bordered
      layout="horizontal"
      column={3}
      items={[
        {
          key: "1",
          label: "Container Number",
          span: 2,
          children: container.container_num,
        },
        {
          key: "16",
          label: "Invoice Number",
          span: 2,
          children: container.invoice_num,
        },
        {
          key: "20",
          span: 2,
          label: (
            <>
              Total <span className="font-bold text-green-500">SOLD</span> items
              Price
            </>
          ),
          children: formatNumberToCurrency(container.total_sold_item_price),
        },
        {
          key: "21",
          span: 2,
          label: (
            <>
              <span className="text-green-500 font-bold">SOLD</span> items
            </>
          ),
          children: container.sold_items,
        },
        {
          key: "4",
          label: "Carrier",
          span: 2,
          children: container.carrier,
        },
        {
          key: "5",
          label: "Vessel",
          span: 2,
          children: container.vessel,
        },

        {
          key: "2",
          label: "Bill of Lading Number",
          children: container.bill_of_lading_number,
        },
        {
          key: "3",
          label: "Port of landing",
          children: container.port_of_landing,
        },
        {
          key: "17",
          label: "Gross Weight",
          children: container.gross_weight,
        },
        {
          key: "7",
          label: "Departure Date From Japan",
          children: formatDate(container.departure_date_from_japan),
        },
        {
          key: "8",
          label: "ETA to PH",
          children: formatDate(container.eta_to_ph),
        },
        {
          key: "9",
          label: "Arrival date to PH Warehouse",
          children: formatDate(container.arrival_date_warehouse_ph),
        },
        {
          key: "10",
          label: "Sorting Date",
          children: formatDate(container.sorting_date),
        },
        {
          key: "11",
          label: "Auction Date",
          children: formatDate(container.auction_date),
        },
        {
          key: "12",
          label: "Payment Date",
          children: formatDate(container.payment_date),
        },
        {
          key: "13",
          label: "Telegraphic Transferred",
          children: formatDate(container.telegraphic_transferred),
        },
        {
          key: "14",
          label: "Vanning Date",
          children: formatDate(container.vanning_date),
        },
        {
          key: "15",
          label: "Devanning Date",
          children: formatDate(container.devanning_date),
        },
      ]}
    ></Descriptions>
  );
};

export default ContainerDescriptions;
