import {
  AuctionDetails,
  Bidder,
  BidderAuctionProfile,
  Branch,
  Container,
  Supplier,
} from "@types";

interface ProfileDetailsProps {
  title: string;
  profile:
    | Bidder
    | Branch
    | Supplier
    | Container
    | AuctionDetails
    | BidderAuctionProfile;
  excludedProperties?: string[];
  renamedProperties?: { [key: string]: string };
}

type IDetails = {
  label: string;
  value: any;
};

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  title,
  profile,
  excludedProperties = [],
  renamedProperties = {},
}) => {
  let details: IDetails[] = [];
  for (const [key, value] of Object.entries(profile)) {
    if (!excludedProperties.includes(key)) {
      let label = "";
      if (Object.keys(renamedProperties).includes(key)) {
        label = renamedProperties[key];
      } else {
        label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
      }

      const newValue = Array.isArray(value) ? value.length : value;
      details = [...details, { label, value: newValue }];
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex mt-4">
        <div className="flex-col w-full gap-4">
          {details.map((item, i) => (
            <div key={i} className="flex justify-between items-center p-2">
              <div>{item.label}:</div>
              {/* @ts-ignore */}
              <div className="text-lg font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProfileDetails;
