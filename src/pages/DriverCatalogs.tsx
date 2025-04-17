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
        <h1 className="catalog-title">🎁 Redeem Your Points</h1>
        <p className="centered-paragraph">
          Select a Catalog from your list of Organizations.
          <br />
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
