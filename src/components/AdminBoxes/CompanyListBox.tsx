import "./CompanyListBox.css";
import { useEffect, useState } from "react";
import axios from "axios";

export const CompanyListBox = () => {
  const org_info_url =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get(`${org_info_url}/organizations`);
        setOrganizations(response.data);
      } catch (err: any) {
        console.error("Error fetching organizations:", err);
        setError("Failed to fetch organizations.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  return (
    <div className="topBox">
      <h2>List Of Organizations</h2>
      <a href="/managesponsors" className="stats-button">
        Manage Sponsors
      </a>
      {isLoading ? (
        <p>Loading organizations…</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="list">
          {organizations.length ? (
            organizations.map((org) => (
              <div key={org.OrganizationID} className="organization-block">
                <img
                  src={org.LogoUrl ? org.LogoUrl : "/images/DefaultOrg.jpg"}
                  alt={org.OrganizationName}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                  }}
                />
                <h3>{org.OrganizationName}</h3>
              </div>
            ))
          ) : (
            <p>No organizations found.</p>
          )}
        </div>
      )}
    </div>
  );
};
