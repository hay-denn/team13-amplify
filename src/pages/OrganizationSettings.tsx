import { useEffect, useState } from "react";
import "./OrganizationSettings.css";

const API_BASE_URL = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

export const OrganizationSettings = () => {
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // TODO: Replace with dynamic org ID for the logged-in sponsor
  const organizationID = 3;

  useEffect(() => {
    fetch(`${API_BASE_URL}/organization?OrganizationID=${organizationID}`)
      .then((res) => res.json())
      .then((data) => {
        setOrganization(data);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Error loading organization.");
        setLoading(false);
      });
  }, [organizationID]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setOrganization({ ...organization, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setOrganization({
      ...organization,
      HideDescription: !organization.HideDescription,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/organization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          OrganizationID: organizationID,
          OrganizationName: organization.OrganizationName,
          OrganizationDescription: organization.OrganizationDescription,
          HideDescription: organization.HideDescription || false,
          LogoUrl: organization.LogoUrl || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage("Changes saved successfully.");
    } catch {
      setMessage("Failed to update organization.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="org-settings-page">Loading...</div>;

  return (
    <div className="org-settings-page">
      <h2>Organization Settings</h2>
      {message && <p className="status-message">{message}</p>}

      <div className="org-form">
        <label>
          Name:
          <input
            name="OrganizationName"
            value={organization.OrganizationName || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          Description:
          <textarea
            name="OrganizationDescription"
            value={organization.OrganizationDescription || ""}
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

        <label className="checkbox-toggle">
          <input
            type="checkbox"
            checked={organization.HideDescription || false}
            onChange={handleToggle}
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
