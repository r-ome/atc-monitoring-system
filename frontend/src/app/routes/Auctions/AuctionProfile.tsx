import { useEffect } from "react";
import {
  useNavigate,
  useParams,
  Outlet,
  useLocation,
  NavLink,
} from "react-router-dom";
import { ProfileDetails } from "@components";
import { useAuction } from "@context";
import { useSession } from "../../hooks";
import { Card, Button } from "antd";
import RenderServerError from "../ServerCrashComponent";

const AuctionProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [sessionAuction, setSessionAuction] = useSession<any>("auction", null);
  const {
    auction,
    fetchAuctionDetails,
    fetchRegisteredBidders,
    fetchMonitoring,
    fetchManifestRecords,
    isLoading: isFetchingAuctionDetails,
    error,
  } = useAuction();

  useEffect(() => {
    const { auction_id: auctionId } = params;
    if (auctionId) {
      const fetchInitialData = async () => {
        await fetchAuctionDetails(auctionId);
        await fetchMonitoring(auctionId);
        await fetchRegisteredBidders(auctionId);
        await fetchManifestRecords(auctionId);
      };
      fetchInitialData();
    }
  }, [
    params,
    fetchRegisteredBidders,
    fetchAuctionDetails,
    fetchManifestRecords,
    fetchMonitoring,
    location.key,
  ]);

  useEffect(() => {
    if (auction) {
      if (sessionAuction) {
        if (sessionAuction.auction_id !== auction.auction_id) {
          setSessionAuction(auction);
          return;
        }
      }
      setSessionAuction(auction);
    }
  }, [auction?.auction_id, sessionAuction?.auction_id]);

  const renderAuctionNavigation = (auction: any) => {
    const navigation = [
      {
        label: "Bidders",
        route: `/auctions/${auction.auction_id}`,
      },
      {
        label: "Payments",
        route: "payments",
      },
      {
        label: "Monitoring",
        route: "monitoring",
      },
      {
        label: "Manifests",
        route: "manifest-records",
      },
    ];
    return navigation.map((item, i) => (
      <NavLink
        key={i}
        state={auction}
        to={item.route}
        end
        className={({ isActive }: any) =>
          "p-2 rounded cursor-pointer hover:text-blue-500 " +
          (isActive ? "text-blue-500 font-bold underline" : "text-black")
        }
      >
        {item.label}
      </NavLink>
    ));
  };

  if (error?.httpStatus === 500) {
    return <RenderServerError {...error} />;
  }

  if (isFetchingAuctionDetails || !auction) {
    return <div className="border p-2 flex justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="w-full mb-2">
        <Button
          type="dashed"
          onClick={() => navigate("/auctions")}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>

      <div className="h-full">
        <div className="flex flex-col gap-2">
          <div className="flex w-full justify-between h-full">
            <div className="w-2/6">
              <Card title={auction?.auction_date}>
                <ProfileDetails
                  profile={auction}
                  excludedProperties={["auction_id", "auction_date"]}
                />
              </Card>
            </div>
            <Card className="flex gap-2 border h-full text-3xl shadow">
              {renderAuctionNavigation(auction)}
            </Card>
          </div>

          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionProfile;
