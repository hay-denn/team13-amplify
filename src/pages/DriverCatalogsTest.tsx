import { useState, useEffect } from "react";
// import { useCart } from "./CartContext";
import "./Catalog.css";

const ORGANIZATIONS_API_URL =
  "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations";
const DRIVERS_SPONSORS_API_URL =
  "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";

interface DriverCatalogsProps {
  inputUserEmail: string;
  onOrganizationSelect?: (orgId: number) => void;
}

export const DriverCatalogsTest = ({
  inputUserEmail,
  onOrganizationSelect,
}: DriverCatalogsProps) => {
  const storedImpersonation = localStorage.getItem("impersonatingDriver");
  const impersonation = storedImpersonation
    ? JSON.parse(storedImpersonation)
    : null;

  const userEmail = impersonation ? impersonation.email : inputUserEmail || "";

  const [organizations, setOrganizations] = useState<
    { OrganizationID: number; OrganizationName: string }[]
  >([]);
  const [currentOrganizations, setCurrentOrganizations] = useState<
    {
      DriversEmail: string;
      DriversSponsorID: number;
      DriversPoints: number;
    }[]
  >([]);

  // State for selected organization
  const [selectedOrganizationID, setSelectedOrganizationID] = useState<
    number | null
  >(null);

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(ORGANIZATIONS_API_URL);
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Unexpected response format:", data);
          return;
        }
        setOrganizations(data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };
    fetchOrganizations();
  }, []);

  // Fetch driver's relationships
  useEffect(() => {
    if (userEmail) {
      const getDriverRelationships = async () => {
        try {
          const response = await fetch(
            `${DRIVERS_SPONSORS_API_URL}/driverssponsors?DriversEmail=${encodeURIComponent(
              userEmail
            )}`
          );
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
          const data = await response.json();
          setCurrentOrganizations(data);

          if (data.length > 0 && selectedOrganizationID === null) {
            setSelectedOrganizationID(data[0].DriversSponsorID);
            if (onOrganizationSelect) {
              onOrganizationSelect(data[0].DriversSponsorID);
            }
          }
        } catch (error) {
          console.error("Error getting the driver's relationships:", error);
        }
      };
      getDriverRelationships();
    }
  }, [userEmail, onOrganizationSelect, selectedOrganizationID]);

  // If impersonating, filter org list to the single org
  const filteredOrgs = impersonation?.sponsorOrgID
    ? currentOrganizations.filter(
        (org) => org.DriversSponsorID === Number(impersonation.sponsorOrgID)
      )
    : currentOrganizations;

  const selectedOrganization = filteredOrgs.find(
    (org) => org.DriversSponsorID === selectedOrganizationID
  );

  // Handle click on organization box
  const handleOrganizationClick = (orgId: number) => {
    setSelectedOrganizationID(orgId);
    if (onOrganizationSelect) {
      onOrganizationSelect(orgId);
    }
  };

  // Testing adding items to cart
  // const { addToCart } = useCart();

  // const handleTestAddItems = () => {
  //   const testItems = [
  //     {
  //       name: "C.O.U.N.T.R.Y.",
  //       cost: 1.29,
  //       quantity: 1,
  //       org: 4,
  //       id: 977746853,
  //     },
  //     { name: "Blown Away", cost: 1.29, quantity: 1, org: 7, id: 510168338 },
  //     { name: "Blown Away", cost: 1.29, quantity: 1, org: 4, id: 510168338 },
  //     {
  //       name: "C.O.U.N.T.R.Y.",
  //       cost: 1.29,
  //       quantity: 1,
  //       org: 7,
  //       id: 977746853,
  //     },
  //   ];
  //   testItems.forEach(addToCart);
  //   alert("Test items added to cart!");
  // };
  const selectedOrgInfo = organizations.find(
    (o) => o.OrganizationID === selectedOrganizationID
  );

  const orgName = selectedOrgInfo
    ? selectedOrgInfo.OrganizationName
    : "Unknown Organization";
  const orgId = selectedOrgInfo?.OrganizationID;
  return (
    <div>
      <div className="container-fluid">
        {/* Row of clickable organization boxes */}
        <div className="organizations-row">
          {filteredOrgs.map((org) => {
            const organizationInfo = organizations.find(
              (o) => o.OrganizationID === org.DriversSponsorID
            );

            return (
              <div
                key={org.DriversSponsorID}
                className={`org-box ${
                  org.DriversSponsorID === selectedOrganizationID
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleOrganizationClick(org.DriversSponsorID)}
              >
                {organizationInfo
                  ? organizationInfo.OrganizationName
                  : "Unknown Organization"}
              </div>
            );
          })}
        </div>

        <div className="point-balance">
          <b>
            Current Point Balance For {orgName} (ID={orgId}):{"  "}
            {selectedOrganization?.DriversPoints !== undefined
              ? selectedOrganization.DriversPoints
              : "N/A"}
          </b>
        </div>

        {/* <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleTestAddItems}
      >
        Add Test Items
      </button> */}
      </div>
    </div>
  );
};
