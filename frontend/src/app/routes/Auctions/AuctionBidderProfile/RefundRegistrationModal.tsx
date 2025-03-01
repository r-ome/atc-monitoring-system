import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePayments } from "@context";
import { Alert, Modal, Typography } from "antd";
import { PaymentDetails } from "@types";
import { usePageLayoutProps } from "@layouts";
import { AUCTION_PAYMENTS_402, SERVER_ERROR_MESSAGE } from "../../errors";

interface RefundRegistrationModalProps {
  open: boolean;
  paymentDetails: PaymentDetails;
  onCancel: () => void;
}

const RefundRegistrationModal: React.FC<RefundRegistrationModalProps> = ({
  open,
  onCancel,
  paymentDetails,
}) => {
  const params = useParams();
  const [paymentDetailsState, setPaymentDetailsState] =
    useState<PaymentDetails>(paymentDetails);
  const {
    isLoading,
    refundRegistrationFee,
    paymentDetails: SuccessResponse,
    error: ErrorResponse,
  } = usePayments();
  const { openNotification } = usePageLayoutProps();

  useEffect(() => {
    if (!isLoading) {
      if (ErrorResponse) {
        let message = "Server Error";
        if (ErrorResponse.httpStatus === 500) {
          message = SERVER_ERROR_MESSAGE;
        }

        if (ErrorResponse.error === AUCTION_PAYMENTS_402) {
          message = "Bidder already refunded registration fee!";
        }

        openNotification(message, "error", "Error");
      }

      if (SuccessResponse) {
        setPaymentDetailsState(paymentDetails);
        if (paymentDetailsState.payment_id !== paymentDetails.payment_id) {
          openNotification("Successfully refunded Bidder's Registration fee!");
          onCancel();
        }
      }
    }
  }, [
    isLoading,
    SuccessResponse,
    ErrorResponse,
    openNotification,
    onCancel,
    paymentDetails,
    paymentDetailsState.payment_id,
  ]);

  const handleSubmit = async () => {
    const { auction_id: auctionId } = params;
    if (auctionId && paymentDetails) {
      await refundRegistrationFee(auctionId, paymentDetails.auction_bidders_id);
    }
  };

  return (
    <Modal
      open={open}
      okText="Yes, Refund Registration"
      okButtonProps={{ color: "red", variant: "outlined" }}
      confirmLoading={isLoading}
      onOk={handleSubmit}
      onCancel={onCancel}
      title="Refund Registration"
    >
      <Alert
        type="warning"
        message={
          <Typography.Title level={3} className="text-center">
            You are about to REFUND the REGISTRATION of this bidder. Are you
            sure?
          </Typography.Title>
        }
      ></Alert>
    </Modal>
  );
};

export default RefundRegistrationModal;
