import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuction, usePayments } from "@context";
import BidderTransactions from "./BidderTransactions";
import BidderItems from "./BidderItems";
import { Card, Descriptions, Skeleton, Tabs } from "antd";
import { usePageLayoutProps } from "@layouts/PageLayout";
import { useBreadcrumbs } from "app/hooks";
import { formatNumberToCurrency } from "@lib/utils";

const AuctionBidderProfile = () => {
  const params = useParams();
  const {
    bidder,
    fetchBidderAuctionProfile,
    isLoading: isFetchingAuctionBidderProfile,
    error: FetchBidderProfileErrorResponse,
  } = useAuction();
  const { payment, fetchBidderAuctionTransactions } = usePayments();
  const { openNotification } = usePageLayoutProps();
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    if (!bidder) return;
    setBreadcrumb({
      title: `Bidder ${bidder.bidder_number}`,
      path: `bidders/${bidder.bidder_id}`,
      level: 3,
    });
  }, [bidder, setBreadcrumb]);

  useEffect(() => {
    const { auction_id: auctionId, bidder_id: bidderId } = params;

    if (bidderId && auctionId) {
      const fetchInitialData = async () => {
        await fetchBidderAuctionProfile(auctionId, bidderId);
      };
      fetchInitialData();
    }
  }, [params, fetchBidderAuctionProfile]);

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (bidder && auctionId) {
      const fetchInitialData = async () => {
        await fetchBidderAuctionTransactions(
          auctionId,
          bidder.auction_bidders_id
        );
      };
      fetchInitialData();
    }
  }, [params, bidder, fetchBidderAuctionTransactions]);

  useEffect(() => {
    const { auction_id: auctionId, bidder_id: bidderId } = params;
    if (bidderId && auctionId) {
      const fetchInitialData = async () => {
        await fetchBidderAuctionProfile(auctionId, bidderId);
      };

      if (payment) {
        fetchInitialData();
      }
    }
  }, [params, payment, fetchBidderAuctionProfile]);

  useEffect(() => {
    if (FetchBidderProfileErrorResponse && !isFetchingAuctionBidderProfile) {
      openNotification("Error fetching Bidder Profile", "error", "Error!");
    }
  }, [
    FetchBidderProfileErrorResponse,
    isFetchingAuctionBidderProfile,
    openNotification,
  ]);

  if (!bidder) return <Skeleton />;

  return (
    <div className="w-full">
      <div className="flex h-full gap-2">
        <div className="w-2/6">
          <Card>
            <Descriptions
              size="small"
              layout="vertical"
              title={`Bidder ${bidder?.bidder_number}`}
              bordered
              column={4}
              items={[
                {
                  key: "1",
                  label: "Full Name",
                  span: 4,
                  children: bidder.full_name,
                },
                {
                  key: "8",
                  label: "Balance",
                  span: 4,
                  children: (
                    <span
                      className={`${
                        bidder.balance > 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {bidder.balance < 0
                        ? `(${formatNumberToCurrency(bidder.balance).replace(
                            "-",
                            ""
                          )})`
                        : `${formatNumberToCurrency(bidder.balance)}`}
                    </span>
                  ),
                },
                {
                  key: "5",
                  label: "Total Item Price",
                  span: 2,
                  children: formatNumberToCurrency(bidder.total_item_price),
                },

                {
                  key: "2",
                  label: "Total Items",
                  span: 1,
                  children: bidder.total_items,
                },
                {
                  key: "6",
                  label: "Unpaid Items",
                  span: 1,
                  children: bidder.total_unpaid_items,
                },
                {
                  key: "3",
                  label: "Service Charge",
                  span: 2,
                  children: `${bidder.service_charge}%`,
                },
                {
                  key: "4",
                  label: "Registration Fee",
                  span: 2,
                  children: formatNumberToCurrency(bidder.registration_fee),
                },
              ]}
            ></Descriptions>
          </Card>
        </div>
        <div className="w-4/6">
          <Card>
            <Tabs
              defaultActiveKey="1"
              className="w-full"
              items={[
                { key: "1", label: "ITEMS", children: <BidderItems /> },
                {
                  key: "2",
                  label: "TRANSACTIONS",
                  children: <BidderTransactions />,
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionBidderProfile;
