// OrganizationSettings.tsx
import { useEffect, useState } from "react";
import "./OrganizationSettings.css";

const API_BASE_URL = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";
const SPONSOR_BASE_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";

interface Organization {
  OrganizationID: number;
  OrganizationName: string;
  OrganizationDescription: string;
  HideDescription: boolean;
  LogoUrl: string | null;
  WebsiteUrl: string | null;
  HideWebsiteUrl: boolean;
}

interface OrganizationSettingsProps {
  userEmail: string; // Provided by App.tsx
}

export const OrganizationSettings = ({ userEmail }: OrganizationSettingsProps) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 1) Fetch sponsor’s org by email
    //    Suppose the response is the full org data, e.g. { OrganizationID, OrganizationName, ... }
    fetch(`${SPONSOR_BASE_URL}/sponsor?UserEmail=${encodeURIComponent(userEmail)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setOrganization(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading organization:", err);
        setMessage("Error loading organization.");
        setLoading(false);
      });
  }, [userEmail]);

  // Handle text changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!organization) return;
    setOrganization({ ...organization, [e.target.name]: e.target.value });
  };

  // Toggle HideDescription
  const handleToggleDescription = () => {
    if (!organization) return;
    setOrganization({
      ...organization,
      HideDescription: !organization.HideDescription,
    });
  };

  // Toggle HideWebsiteUrl
  const handleToggleWebsite = () => {
    if (!organization) return;
    setOrganization({
      ...organization,
      HideWebsiteUrl: !organization.HideWebsiteUrl,
    });
  };

  // Save changes with PUT /organization
  const handleSave = async () => {
    if (!organization) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/organization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          OrganizationID: organization.OrganizationID,
          OrganizationName: organization.OrganizationName,
          OrganizationDescription: organization.OrganizationDescription,
          HideDescription: organization.HideDescription,
          LogoUrl: organization.LogoUrl,
          WebsiteUrl: organization.WebsiteUrl,
          HideWebsiteUrl: organization.HideWebsiteUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }
      setMessage("Changes saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update organization.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="org-settings-page">Loading...</div>;
  if (!organization) return <div className="org-settings-page">No organization found.</div>;

  return (
    <div className="org-settings-page">
      <h2>Organization Settings</h2>
      {message && <p className="status-message">{message}</p>}

      <div className="org-form">
        <label>
          Name:
          <input
            name="OrganizationName"
            value={organization.OrganizationName}
            onChange={handleChange}
          />
        </label>

        <label>
          Description:
          <textarea
            name="OrganizationDescription"
            value={organization.OrganizationDescription}
            onChange={handleChange}
          />
        </label>

        <label>
          Logo URL:
          <input
            name="LogoUrl"
            value={organization.LogoUrl || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          Website URL:
          <input
            name="WebsiteUrl"
            value={organization.WebsiteUrl || ""}
            onChange={handleChange}
          />
        </label>

        <label className="checkbox-toggle">
          <input
            type="checkbox"
            checked={organization.HideWebsiteUrl}
            onChange={handleToggleWebsite}
          />
          Do not display website publicly
        </label>

        <label className="checkbox-toggle">
          <input
            type="checkbox"
            checked={organization.HideDescription}
            onChange={handleToggleDescription}
          />
          Do not display description publicly
        </label>

        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};
