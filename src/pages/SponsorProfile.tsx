import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./SponsorProfile.css";

const API_BASE_URL = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

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

export const SponsorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/organization?OrganizationID=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load sponsor");
        return res.json();
      })
      .then((data) => {
        setSponsor(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!sponsor) return <div className="p-8 text-center">Sponsor not found.</div>;

  return (
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
        <p><strong>Point-to-Dollar Ratio:</strong> {sponsor.PointDollarRatio}</p>
        <p><strong>Number of Products:</strong> {sponsor.AmountOfProducts}</p>
        <p><strong>Product Type:</strong> {sponsor.ProductType}</p>
        <p><strong>Maximum Price:</strong> ${sponsor.MaxPrice}</p>
        {sponsor.SearchTerm && (
          <p><strong>Search Term:</strong> {sponsor.SearchTerm}</p>
        )}

        {sponsor.WebsiteUrl && !sponsor.HideWebsiteUrl && (
          <p>
            <strong>Website:</strong>{" "}
            <a
              href={sponsor.WebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {sponsor.WebsiteUrl}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};
