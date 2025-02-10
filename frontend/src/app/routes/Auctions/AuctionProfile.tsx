import { useEffect } from "react";
import {
  useNavigate,
  useParams,
  Outlet,
  useLocation,
  NavLink,
} from "react-router-dom";
import { Button } from "../../../components";
import { useAuction } from "../../../context";
import { AUCTIONS_403 } from "../errors";
import { useSession } from "../../hooks";

const AuctionProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const {
    auction,
    fetchAuctionDetails,
    fetchRegisteredBidders,
    fetchMonitoring,
    fetchManifestRecords,
    isLoading: isFetchingAuctionDetails,
    errors,
  } = useAuction();
  const [sessionAuction, setSessionAuction] = useSession<any>("auction", null);

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
    params.auction_id,
    fetchRegisteredBidders,
    fetchAuctionDetails,
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
  }, [JSON.stringify(auction)]);

  const renderProfileDetails = (auction: any) => {
    let auctionDetails = auction;
    let profileDetails = [];
    for (let key in auctionDetails) {
      let label = key;
      if (label === "auction_date") label = "Auction Date";
      label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
      profileDetails.push({ label, value: auctionDetails[key] });
    }

    return (
      <>
        {profileDetails
          .filter(
            (item) =>
              !["auction id", "auction date"].includes(item.label.toLowerCase())
          )
          .map((item, i) => {
            return (
              <div
                key={i}
                className="flex justify-between items-center p-2 w-1/5"
              >
                <div>{item.label}:</div>
                <div className="text-lg font-bold">{item.value}</div>
              </div>
            );
          })}
      </>
    );
  };

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

  if (errors && errors.error === AUCTIONS_403) {
    return (
      <>
        <div className="w-full">
          <Button
            buttonType="secondary"
            onClick={() => navigate("/auctions")}
            className="text-blue-500"
          >
            Go Back
          </Button>
        </div>
        <div className="border p-2 rounded border-red-500 mb-10">
          <h1 className="text-red-500 text-xl flex justify-center">
            We're not able to find the what you're looking for...
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full">
        <Button
          buttonType="secondary"
          onClick={() => navigate("/auctions")}
          className="text-blue-500"
        >
          Go Back
        </Button>
      </div>

      {!isFetchingAuctionDetails && auction ? (
        <div className="h-full">
          <div className="flex flex-col gap-2">
            <div className="w-full border rounded shadow-md p-4 h-full">
              <h1 className="text-3xl font-bold">{auction?.auction_date}</h1>
              <div className="flex mt-4">
                <div className="flex-col w-full gap-4">
                  {renderProfileDetails(auction)}
                </div>
              </div>
              <div className="flex gap-2">
                {renderAuctionNavigation(auction)}
              </div>
            </div>

            <div className="">
              <Outlet />
            </div>
          </div>
        </div>
      ) : (
        <div className="border p-2 flex justify-center">Loading...</div>
      )}
    </>
  );
};

export default AuctionProfile;
