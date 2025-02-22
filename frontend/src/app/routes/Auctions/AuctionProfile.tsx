import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuction, useBidders } from "@context";
import { Card, Skeleton, Statistic, Tabs } from "antd";
import { usePageLayoutProps } from "@layouts";
import AuctionBidders from "./AuctionBidders";
import AuctionPayments from "./AuctionPayments";
import Monitoring from "./Monitoring";
import ManifestList from "./ManifestList";
import { useBreadcrumbs } from "app/hooks";
import { UserOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { formatNumberToCurrency } from "@lib/utils";

const AuctionProfile = () => {
  const location = useLocation();
  const params = useParams();
  const {
    auction,
    fetchAuctionDetails,
    fetchRegisteredBidders,
    fetchMonitoring,
    fetchManifestRecords,
    isLoading: isFetchingAuctionDetails,
    error: ErrorResponse,
    resetActionItem,
  } = useAuction();
  const {
    fetchBidders,
    isLoading: isFetchingBidders,
    error: BidderErrorResponse,
  } = useBidders();
  const { openNotification } = usePageLayoutProps();
  const { setBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    if (!auction) return;
    setBreadcrumb({
      title: auction.auction_date,
      path: `${auction.auction_id}`,
      level: 2,
    });
  }, [auction, setBreadcrumb]);

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      const fetchInitialData = async () => {
        await Promise.all([
          fetchBidders(),
          fetchAuctionDetails(auctionId),
          fetchMonitoring(auctionId),
          fetchRegisteredBidders(auctionId),
          fetchManifestRecords(auctionId),
        ]);
        // await fetchBidders();
        // await fetchAuctionDetails(auctionId);
        // await fetchMonitoring(auctionId);
        // await fetchRegisteredBidders(auctionId);
        // await fetchManifestRecords(auctionId);
      };
      fetchInitialData();
    }
  }, [
    params,
    fetchBidders,
    fetchRegisteredBidders,
    fetchAuctionDetails,
    fetchManifestRecords,
    fetchMonitoring,
    location.key,
  ]);

  useEffect(() => {
    if (!isFetchingAuctionDetails) {
      if (ErrorResponse && ErrorResponse.httpStatus === 500) {
        openNotification(
          "There might be problems in the server. Please contact your admin.",
          "error",
          "Server Error"
        );
        resetActionItem();
      }
    }
  }, [
    ErrorResponse,
    isFetchingAuctionDetails,
    openNotification,
    resetActionItem,
  ]);

  useEffect(() => {
    if (!isFetchingBidders) {
      if (BidderErrorResponse && BidderErrorResponse.httpStatus === 500) {
        openNotification(
          "There might be problems in the server. Please contact your admin.",
          "error",
          "Server Error"
        );
      }
    }
  }, [BidderErrorResponse, isFetchingBidders, openNotification]);

  if (!auction) return <Skeleton />;

  return (
    <>
      <div className="h-full">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 w-full justify-evenly h-full">
            {[
              {
                title: "Bidders",
                value: `${auction.number_of_bidders} Bidders`,
                prefix: <UserOutlined />,
              },
              {
                title: "Total Items",
                value: `${auction.total_items} Items`,
                prefix: <ShoppingCartOutlined />,
              },
              {
                title: "Total Sales",
                value: formatNumberToCurrency(auction.total_items_price),
                prefix: null,
              },
              {
                title: "Total Registration Fee",
                value: formatNumberToCurrency(auction.total_registration_fee),
                prefix: null,
              },
            ].map((item, i) => (
              <Card key={i} variant="borderless" className="flex-1">
                <Statistic
                  title={item.title}
                  value={item.value}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={item.prefix}
                />
              </Card>
            ))}
          </div>

          <Card>
            <Tabs
              defaultActiveKey="1"
              className="w-full"
              items={[
                {
                  key: "1",
                  label: "Monitoring",
                  children: <Monitoring />,
                },
                { key: "2", label: "Bidders", children: <AuctionBidders /> },
                {
                  key: "3",
                  label: "Payments",
                  children: <AuctionPayments />,
                },
                {
                  key: "4",
                  label: "Manifest Records",
                  children: <ManifestList />,
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default AuctionProfile;
