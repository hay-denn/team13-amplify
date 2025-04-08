import { useState } from "react";
import DisplayCatalog from "../components/DisplayCatalog";
import { DriverCatalogsTest } from "./DriverCatalogsTest";
import "./DriverCatalogs.css";

interface DriverCatalogsProps {
  inputUserEmail: string;
}

export const DriverCatalogs = ({ inputUserEmail }: DriverCatalogsProps) => {
  // Use null to indicate no org is selected
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  // This callback is passed down and called by the child when the user selects an org
  const handleSelectedOrgChange = (orgId: number) => {
    setSelectedOrgId(orgId);
  };

  return (
    <div className="driver-catalogs-wrapper">
      <div className="CatalogTitle">
        <h1>🎁 Redeem Your Points</h1>
        <p className="centered-paragraph">
          Browse and purchase items from your sponsor organizations.
          <br />
          Select a Sponsor from your organizations from the list below to view their catalog!
        </p>
      </div>

      <DriverCatalogsTest
        inputUserEmail={inputUserEmail}
        onOrganizationSelect={handleSelectedOrgChange}
      />

      {/* Only display the catalog if an organization has been selected */}
      {selectedOrgId ? (
        <DisplayCatalog currentCatalog={selectedOrgId} />
      ) : (
        <div>Please select an organization to view the catalog.</div>
      )}
    </div>
  );
};

export default DriverCatalogs;
