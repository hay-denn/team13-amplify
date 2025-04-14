import { RecentSponsorPurchases } from "../components/SponsorDashBoardBoxes/RecentSponsorPurchases";
import { ChartBox } from "../components/SponsorDashBoardBoxes/chartBox";
import "./SponsorDashboard.css";
import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import axios from "axios";
import { Faststats } from "../components/SponsorDashBoardBoxes/faststats";
interface OrganizationData {
  OrganizationID: number;
  OrganizationName: string;
  OrganizationDescription: string;
  PointDollarRatio: string;
  AmountOfProducts: number;
  ProductType: string;
  MaxPrice: string;
  SearchTerm: string;
  HideDescription: number;
  LogoUrl: string | null;
  WebsiteUrl: string | null;
  HideWebsiteUrl: number;
}

export const SponsorDashboard = () => {
  const auth = useAuth();
  const [currsponsor_email] = useState(auth.user?.profile.email || "");
  const [currsponsor_name] = useState(auth.user?.profile.given_name || "");

  const [currentSponsorId, setCurrentSponsorId] = useState<any>("");

  const [organizationData, setOrganizationData] =
    useState<OrganizationData | null>(null);

  //makes sure to change this back
  const [sponsorIdLoaded, setSponsorIdLoaded] = useState(false);
  const url_getSponsorID =
    "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";

  const url_getSponsorOrgInfo =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

  const getCurrentSponsorOrganization = async () => {
    try {
      const response = await axios.get(
        `${url_getSponsorID}/sponsor?UserEmail=${currsponsor_email}`
      );
      setCurrentSponsorId(response.data.UserOrganization);
      setSponsorIdLoaded(true);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

  useEffect(() => {
    getCurrentSponsorOrganization();
  }, []);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await axios.get(
          `${url_getSponsorOrgInfo}/organization?OrganizationID=${currentSponsorId}`
        );
        setOrganizationData(response.data);
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganization();
  }, [currentSponsorId]);

  if (!sponsorIdLoaded) {
    return <div>Loading Org Info...</div>;
  }

  return (
    <div className="container-fluid my-0">
      <h1 className="text-center mb-4 mt-3">
        <div className="welcome-message">Welcome Back {currsponsor_name}!</div>
      </h1>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="box box1">
            <RecentSponsorPurchases SponsorID={currentSponsorId} />
          </div>
        </div>

        <div className="col-md-6">
          <div className="box box2">
            <ChartBox SponsorID={currentSponsorId} />
          </div>
        </div>
        <div className="col-md-2 p-0">
          <div className="box box1 m-0 p-2">
            <Faststats SponsorID={currentSponsorId} />
          </div>
        </div>

        <div className="col-md-4">
          <div className="box box3">Leading Users</div>
        </div>
        <div className="col-md-4">
          <div className="box box4">
            Company Notices From {organizationData?.OrganizationName}
          </div>
        </div>
        <div className="col-md-4">
          <div className="box box5">
            Number Of Products in the Catalog:
            {organizationData?.AmountOfProducts}
          </div>
        </div>
      </div>
    </div>
  );
};
