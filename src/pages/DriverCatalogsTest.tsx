import { useContext, useState, useEffect } from "react";
import { AuthContext } from "react-oidc-context";
import { useCart } from "./CartContext";

export const DriverCatalogsTest = () => {
      const authContext = useContext(AuthContext);

      const storedImpersonation = localStorage.getItem("impersonatingDriver");
      const impersonation = storedImpersonation ? JSON.parse(storedImpersonation) : null;

      const userEmail = impersonation ? impersonation.email : authContext?.user?.profile?.email || "";
      
      const [organizations, setOrganizations] = useState<{ OrganizationID: number; OrganizationName: string }[]>([]);
      const [currentOrganizations, setCurrentOrganizations] = useState<{ DriversEmail: string; DriversSponsorID: number; DriversPoints: number }[]>([]);
    
      useEffect(() => {
        const fetchOrganizations = async () => {
          try {
            const response = await fetch("https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations");
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
    
      useEffect(() => {
        if (userEmail) {
          const getDriverRelationships = async () => {
            try {
              const driverRelationshipURL = "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";
              const response = await fetch(`${driverRelationshipURL}/driverssponsors?DriversEmail=${encodeURIComponent(userEmail)}`);
              if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
              }
              const data = await response.json();
              setCurrentOrganizations(data);
            } catch (error) {
              console.error("Error getting the driver's relationships:", error);
            }
          };
          getDriverRelationships();
        }
      }, [userEmail]);
    
      const [selectedOrganizationID, setSelectedOrganizationID] = useState<number | null>(
        currentOrganizations.length > 0 ? currentOrganizations[0].DriversSponsorID : null
      );
    
      const handleOrganizationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOrganizationID(Number(event.target.value));
      };

      const selectedOrganization = currentOrganizations.find(
        (org) => org.DriversSponsorID === selectedOrganizationID
      );


      //Testing adding items to cart
      const { addToCart } = useCart();


      const handleTestAddItems = () => {
        const testItems = [
          { name: "Item A", cost: 10, quantity: 1, org: 4 },
          { name: "Item B", cost: 15, quantity: 1, org: 7 },
          { name: "Item C", cost: 20, quantity: 1, org: 4 },
          { name: "Item D", cost: 5, quantity: 1, org: 7 },
        ];
        testItems.forEach(addToCart);
        alert("Test items added to cart!");
      };
      
    return (    
    <div>
        <br />
        <br />
        <br />

        <h1>Catalog</h1>

        <h3>Select an organization from the dropdown to view their catalog</h3>

        <label htmlFor="organizationDropdown" className="mr-2">Select Organization:</label>

        <select id="organizationDropdown" value={selectedOrganizationID || ""} onChange={handleOrganizationChange}>
        <option value="" disabled>Select an Organization</option>
        {currentOrganizations.map((org) => {
            const organization = organizations.find((o) => o.OrganizationID === org.DriversSponsorID);
            return (
            <option key={org.DriversSponsorID} value={org.DriversSponsorID}>
                {organization ? organization.OrganizationName : "Unknown Organization"}
            </option>
            );
        })}
        </select>

        <b>Current Point Balance: {selectedOrganization?.DriversPoints || "N/A"}</b>

        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleTestAddItems}>
          Add Test Items
        </button>
    </div>
    );

};
