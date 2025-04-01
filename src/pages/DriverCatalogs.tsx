import { useState } from "react";
import DisplayCatalog from "../components/DisplayCatalog";
import { DriverCatalogsTest } from "./DriverCatalogsTest";

interface DriverCatalogsProps {
  inputUserEmail: string;
}

export const DriverCatalogs = ({ inputUserEmail }: DriverCatalogsProps) => {
  const [selectedOrgId, setSelectedOrgId] = useState<number>(13);

  // This callback is passed down and called by the child when the user selects an org
  const handleSelectedOrgChange = (orgId: number) => {
    setSelectedOrgId(orgId);
  };

  return (
    <div>
      <div className="shopTitle">
        <h1>Purchase Items from Your Sponsors</h1>
      </div>
      <DriverCatalogsTest
        inputUserEmail={inputUserEmail}
        onOrganizationSelect={handleSelectedOrgChange}
      ></DriverCatalogsTest>

      <DisplayCatalog currentCatalog={selectedOrgId}></DisplayCatalog>
    </div>
  );
};
