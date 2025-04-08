import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SponsorApplyModal } from "../components/Modal";
import "./SponsorProfile.css";

const API_BASE_URL =
  "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

const DRIVER_SPONSOR_URL="https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";

interface Sponsor {
  OrganizationID: number;
  OrganizationName: string;
  OrganizationDescription: string;
  PointDollarRatio: string;
  AmountOfProducts: number;
  ProductType: string;
  MaxPrice: string;
  SearchTerm: string | null;
  HideDescription: boolean;
  LogoUrl: string | null;
  WebsiteUrl: string | null;
  HideWebsiteUrl: boolean;
}

interface SponsorProfileProps {
  inputUserEmail: string;
}

// handle check if driver is already sponsored by this sponsor
const checkIfDriverIsSponsored = async (
  driverEmail: string,
  sponsorID: number
) => {
  try {
    const response = await fetch(
      `${DRIVER_SPONSOR_URL}/driverssponsor?DriversEmail=${driverEmail}&DriversSponsorID=${sponsorID}`
    );
    const data = await response.json();
    return data.length > 0;
  } catch (error) {
    console.error("Error checking sponsorship:", error);
    return false;
  }
}

export const SponsorProfile = (inputUserEmail: SponsorProfileProps) => {

  const { id } = useParams<{ id: string }>();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // -- Determine current user's email --
  const storedImpersonation = localStorage.getItem("impersonatingDriver");
  const impersonation = storedImpersonation
    ? JSON.parse(storedImpersonation)
    : null;

  if (impersonation) {
    inputUserEmail = impersonation.email;
  }

  const userEmail = inputUserEmail.inputUserEmail || "";

  // 1) Fetch sponsor details
  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/organization?OrganizationID=${id}`
        );
        if (!res.ok) throw new Error("Failed to load sponsor");

        const data = await res.json();
        setSponsor(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSponsor();
    }
  }, [id]);

  // 3) Render states
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!sponsor) return <div className="p-8 text-center">Sponsor not found.</div>;

  // 4) Layout with "Apply" button
  return (
    <>
    <div className="sponsor-profile-container">
      {sponsor.LogoUrl && (
        <img
          src={sponsor.LogoUrl}
          alt={`${sponsor.OrganizationName} Logo`}
          className="sponsor-profile-logo"
        />
      )}

      <h1>{sponsor.OrganizationName}</h1>

      {!sponsor.HideDescription && (
        <p className="sponsor-profile-description">
          {sponsor.OrganizationDescription || "No description available."}
        </p>
      )}

      <div className="sponsor-profile-details">
        <p>
          <strong>Point-to-Dollar Ratio:</strong> {sponsor.PointDollarRatio}
        </p>
        <p>
          <strong>Number of Products:</strong> {sponsor.AmountOfProducts}
        </p>
        <p>
          <strong>Product Type:</strong> {sponsor.ProductType}
        </p>
        <p>
          <strong>Maximum Price:</strong> ${sponsor.MaxPrice}
        </p>
        {sponsor.SearchTerm && (
          <p>
            <strong>Search Term:</strong> {sponsor.SearchTerm}
          </p>
        )}

        {sponsor.WebsiteUrl && !sponsor.HideWebsiteUrl && (
          <p>
            <strong>Website:</strong>{" "}
            <a href={sponsor.WebsiteUrl} target="_blank" rel="noopener noreferrer">
              {sponsor.WebsiteUrl}
            </a>
          </p>
        )}
      </div>

      <div className="mt-4">
        {sponsor && (
          <button
        className="apply-button"
        onClick={async () => {
          const isSponsored = await checkIfDriverIsSponsored(userEmail, sponsor.OrganizationID);
          if (!isSponsored) {
            setShowModal(true);
          } else {
            alert("You are already sponsored by this organization.");
          }
        }}
          >
        Apply Now!
          </button>
        )}
      </div>
    </div>
    
    <SponsorApplyModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        driverEmail={userEmail}
        organizationIDInput={sponsor.OrganizationID}
        fetchApplications={() => {}}
      />
    </>
  );
};
