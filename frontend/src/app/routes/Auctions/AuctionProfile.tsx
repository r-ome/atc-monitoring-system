import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuction, useBidders } from "@context";
import { Card, Descriptions, Skeleton, Tabs } from "antd";
import { usePageLayoutProps, BreadcrumbsType } from "@layouts";
import AuctionBidders from "./AuctionBidders";
import AuctionPayments from "./AuctionPayments";
import Monitoring from "./Monitoring";
import ManifestList from "./ManifestList";
import { useSession } from "app/hooks";
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
  const { pageBreadcrumbs, openNotification, setPageBreadCrumbs } =
    usePageLayoutProps();
  const [, setBreadcrumbsSession] = useSession<BreadcrumbsType[]>(
    "breadcrumbs",
    pageBreadcrumbs
  );

  useEffect(() => {
    if (!auction) return;
    const newBreadcrumb = [
      { title: "Auctions List", path: "/auctions" },
      { title: auction.auction_date, path: `${auction.auction_id}` },
    ];
    setBreadcrumbsSession(newBreadcrumb);
    setPageBreadCrumbs(newBreadcrumb);
  }, [auction, setPageBreadCrumbs, setBreadcrumbsSession]);

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      const fetchInitialData = async () => {
        await fetchBidders();
        await fetchAuctionDetails(auctionId);
        await fetchMonitoring(auctionId);
        await fetchRegisteredBidders(auctionId);
        await fetchManifestRecords(auctionId);
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
          <div className="flex w-full justify-between h-full">
            <div className="w-3/6">
              <Card loading={isFetchingAuctionDetails}>
                <Descriptions
                  size="small"
                  layout="vertical"
                  title={auction?.auction_date}
                  bordered
                  column={4}
                  items={[
                    {
                      key: "1",
                      label: "Total Bidders",
                      children: auction?.number_of_bidders,
                    },
                    {
                      key: "2",
                      label: "Total Items",
                      children: auction?.total_items,
                    },
                    {
                      key: "3",
                      label: "Total Sales",
                      children: formatNumberToCurrency(
                        auction.total_items_price
                      ),
                    },
                    {
                      key: "4",
                      label: "Total Registration Fee",
                      children: formatNumberToCurrency(
                        auction.total_registration_fee
                      ),
                    },
                  ]}
                ></Descriptions>
              </Card>
            </div>
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
