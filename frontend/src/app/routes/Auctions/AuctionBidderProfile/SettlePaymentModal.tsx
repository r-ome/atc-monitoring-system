import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Typography, Descriptions } from "antd";
import { formatNumberToCurrency } from "@lib/utils";
import { PaymentDetails } from "@types";
import { useParams } from "react-router-dom";
import { usePayments } from "@context";
import { usePageLayoutProps } from "@layouts/PageLayout";
import { SERVER_ERROR_MESSAGE } from "../../errors";

interface SettlePaymentModalProps {
  open: boolean;
  paymentDetails: PaymentDetails;
  onCancel: () => void;
}

const SettlePaymentModal: React.FC<SettlePaymentModalProps> = ({
  open,
  onCancel,
  paymentDetails,
}) => {
  const params = useParams();
  const methods = useForm();
  const {
    paymentDetails: SuccessResponse,
    isLoading: isSettlingPartialPayment,
    error: ErrorResponse,
    settlePartialPayment,
  } = usePayments();
  const [statePaymentDetails, setStatePaymentDetails] =
    useState<PaymentDetails>(paymentDetails);
  const [initialValues, setInitialValues] = useState<{
    totalItemPrice: number;
    hasRegistrationFee: boolean;
    grandTotalPrice: number;
  }>({ totalItemPrice: 0, hasRegistrationFee: false, grandTotalPrice: 0 });
  const { openNotification } = usePageLayoutProps();

  const handlePartialPayment = methods.handleSubmit(async () => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      await settlePartialPayment(auctionId, paymentDetails.payment_id);
    }
  });

  useEffect(() => {
    if (!isSettlingPartialPayment) {
      if (ErrorResponse) {
        let message = "Server Error";
        if (ErrorResponse.httpStatus === 500) {
          message = SERVER_ERROR_MESSAGE;
        }
        openNotification(message, "error", "Error");
      }

      if (SuccessResponse) {
        setStatePaymentDetails(paymentDetails);
        if (statePaymentDetails.payment_id !== paymentDetails.payment_id) {
          openNotification("Successfully Settled Payment!!");
          onCancel();
        }
      }
    }
  }, [
    isSettlingPartialPayment,
    SuccessResponse,
    statePaymentDetails.payment_id,
    paymentDetails,
    ErrorResponse,
    openNotification,
    onCancel,
  ]);

  useEffect(() => {
    if (!paymentDetails) return;

    const totalItemPrice = paymentDetails.auction_inventories.reduce(
      (totalUnpaidItemPrice, item) => totalUnpaidItemPrice + item.price,
      0
    );
    const hasRegistrationFee = paymentDetails.receipt_number.includes("-1");
    let grandTotalPrice =
      totalItemPrice + (totalItemPrice * paymentDetails.service_charge) / 100;

    if (initialValues.hasRegistrationFee) {
      grandTotalPrice = grandTotalPrice - paymentDetails.registration_fee;
    }

    setInitialValues({ totalItemPrice, hasRegistrationFee, grandTotalPrice });
  }, [paymentDetails, initialValues.hasRegistrationFee]);

  const ComputationBreakdown = () => (
    <>
      <div className="mb-4 bg-gray-100 p-2 rounded">
        <pre className="text-sm">
          Total = Total Item Price + (Total Item Price x Service Charge){" "}
          {initialValues.hasRegistrationFee ? "" : "- Registration Fee"}
        </pre>
        <pre className="text-sm my-2">
          Total = {formatNumberToCurrency(initialValues.totalItemPrice)} + (
          {formatNumberToCurrency(initialValues.totalItemPrice)} x{" "}
          {paymentDetails.service_charge}%){" "}
          {initialValues.hasRegistrationFee
            ? `- ${formatNumberToCurrency(paymentDetails.registration_fee)}`
            : ""}
        </pre>
        <pre className="text-sm my-2">
          Total = {formatNumberToCurrency(initialValues.totalItemPrice)} +{" "}
          {formatNumberToCurrency(
            (initialValues.totalItemPrice * paymentDetails.service_charge) / 100
          )}{" "}
          {initialValues.hasRegistrationFee
            ? `- ${formatNumberToCurrency(paymentDetails.registration_fee)}`
            : ""}
        </pre>
        <pre className="text-sm">------------------------------</pre>
        <pre className="text-sm">
          Total = {formatNumberToCurrency(initialValues.grandTotalPrice)}
        </pre>
        <pre className="text-sm my-2">
          Partial Payment = {formatNumberToCurrency(paymentDetails.amount_paid)}
        </pre>
        <pre className="text-sm">------------------------------</pre>
        <pre className="text-sm my-2">Balance = Total - Partial Payment</pre>
        <pre>
          Balance = {formatNumberToCurrency(initialValues.grandTotalPrice)} -{" "}
          {formatNumberToCurrency(paymentDetails.amount_paid)}
        </pre>
        <pre className="text-sm my-2 text-red-500">
          Balance = {formatNumberToCurrency(paymentDetails.balance)}
        </pre>
      </div>
    </>
  );

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handlePartialPayment}
      confirmLoading={isSettlingPartialPayment}
      okText="Confirm Payment"
      title={
        <Typography.Title level={3}>Settle Partial Payment</Typography.Title>
      }
      width={1000}
      className="w-full"
    >
      <div className="flex flex-col gap-4">
        <div>
          <ComputationBreakdown />
        </div>

        <div>
          <Descriptions
            bordered
            size="default"
            items={[
              {
                label: "Total Number of Items",
                children: `${paymentDetails.auction_inventories.length} items`,
                span: 3,
              },
              {
                label: "Inital Payment",
                children: formatNumberToCurrency(paymentDetails.amount_paid),
                span: 3,
              },
              {
                label: "Registration Fee",
                children: formatNumberToCurrency(
                  paymentDetails.registration_fee
                ),
                span: 3,
              },
              {
                label: "Service Charge",
                children: `${paymentDetails.service_charge}%`,
                span: 3,
              },
              {
                label: "Total",
                children: (
                  <Typography.Title className="font-bold" level={5}>
                    <span className="text-red-500">
                      {formatNumberToCurrency(paymentDetails.balance)}
                    </span>
                  </Typography.Title>
                ),
                span: 3,
              },
            ]}
          ></Descriptions>
        </div>
      </div>
    </Modal>
  );
};

export default SettlePaymentModal;
