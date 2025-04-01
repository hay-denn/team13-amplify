import DisplayCatalog from "../components/DisplayCatalog";
import { DriverCatalogsTest } from "./DriverCatalogsTest";

interface DriverCatalogsProps {
  inputUserEmail: string; 
}

export const DriverCatalogs = ( {inputUserEmail}: DriverCatalogsProps) => {
  return (
    <div>
      <p>WIP</p>
      <p></p>
      <div className="shopTitle">
        <h1>Purchase Items from Your Sponsors</h1>
      </div>
      <DriverCatalogsTest inputUserEmail={inputUserEmail}></DriverCatalogsTest>

      <DisplayCatalog></DisplayCatalog>
    </div>
  );
};
