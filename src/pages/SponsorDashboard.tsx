import { RecentSponsorPurchases } from "../components/SponsorDashBoardBoxes/RecentSponsorPurchases";
import { ChartBox } from "../components/Charts/chartBox";
import "./SponsorDashboard.css";
import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import axios from "axios";

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
  const [currsponsor_name] = useState(auth.user?.profile.family_name || "");

  const [currentSponsorId, setCurrentSponsorId] = useState("");

  const [organizationData, setOrganizationData] =
    useState<OrganizationData | null>(null);

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

  return (
    <div className="container my-4 ">
      <h1 className="text-center mb-5 mt-5">
        Welcome Back {currsponsor_name}!
      </h1>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="box box1">
            <RecentSponsorPurchases SponsorID={currentSponsorId} />
          </div>
        </div>

        <div className="col-md-6">
          <div className="box box2">
            <ChartBox />
          </div>
        </div>
        <div className="col-md-2">
          <div className="box box1">Monthly Point Leaders</div>
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
