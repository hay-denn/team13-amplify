import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AuthContext } from "react-oidc-context";
import "./Manageusers.css";

// Define item type
interface CartItem {
  name: string; //Name of the item (can be anything, this info is not stored in our DB)
  cost: number; //cost (in points) of item
  quantity: number; //quantity of item (probably just use 1)
  org: number; //the organization ID for the catalog that the user is adding the item from
  id: number; //the trackID of the item
  driverEmail?: string; //the email of the driver (if applicable)
}

// Define context type
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem.name === item.name && cartItem.org === item.org
      );
      if (existingItemIndex !== -1) {
        return prevCart.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      return [...prevCart, item];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart context
export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]); // Explicitly type the cart state

  useEffect(() => {
    // Load cart from localStorage or initialize it
    const storedCart = localStorage.getItem("cart");
    setCart(storedCart ? JSON.parse(storedCart) : []);
  }, []);

  const addToCart = (item: CartItem) => {
    const updatedCart = [...cart, item];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return { cart, addToCart, removeFromCart, clearCart }; // Include removeFromCart here
};

//Getting SQL friendly date
function getCurrentMySQLDate(): string {
  const now = new Date();

  // Pad single digits with a leading zero
  const pad = (num: number): string => num < 10 ? '0' + num : num.toString();

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1); // Months are 0-indexed
  const day = pad(now.getDate());

  return `${year}-${month}-${day}`;
}

//API LINKS
const PUR_API = import.meta.env.VITE_API_PURCHASES;
const PROD_PUR_API = import.meta.env.VITE_API_PRODUCTS_PURCHASED;
const POINT_CHANGE_API = import.meta.env.VITE_API_POINTCHANGES;
const SPONSOR_API = import.meta.env.VITE_API_SPONSOR;
const EMAIL_API = import.meta.env.VITE_API_EMAIL;
const DRIVER_API = import.meta.env.VITE_API_DRIVER;
const ORG_API = import.meta.env.VITE_API_ORGANIZATION;


//API call function for purchases
async function callAPI(url: string, methodType: string, data: object): Promise<any> {
  try {
    const response = await fetch(url, {
      method: methodType, // HTTP method
      headers: {
        'Content-Type': 'application/json', // Content type header
      },
      body: JSON.stringify(data), // Convert the data to JSON string
    });
    if (response.ok) {
      // If the request was successful
      const responseData = await response.json();
      console.log('Success: ' + JSON.stringify(responseData))
      return responseData;
    } else {
      // Handle error if response status is not OK
      console.log(`API call failed for url ${url} : ${response.status} - ${response.statusText}`); // Display error alert with status and message
      throw new Error(`API call failed for url ${url} : ${response.status} - ${response.statusText}`);

    }
  } catch (error) {
    // Catch any network or other errors
    throw new Error(`API call failed for url ${url} - Network Error: ${error}`);
  }
}

//GET API call function for purchases
async function callAPIGET(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      method: "GET", // HTTP method
    });
    if (response.ok) {
      // If the request was successful
      const responseData = await response.json();
      console.log('Success: ' + JSON.stringify(responseData))
      return responseData;
    } else {
      // Handle error if response status is not OK
      console.log(`API call failed for url ${url} : ${response.status} - ${response.statusText}`); // Display error alert with status and message
      throw new Error(`API call failed for url ${url} : ${response.status} - ${response.statusText}`);

    }
  } catch (error) {
    // Catch any network or other errors
    throw new Error(`API call failed for url ${url} - Network Error: ${error}`);
  }
}

// Cart Page Component
export const CartPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const storedImpersonation = localStorage.getItem("impersonatingDriver");
  const impersonation = storedImpersonation ? JSON.parse(storedImpersonation) : null;
  
  // When impersonating, use the sponsor org id; otherwise use the driver's email
  const userEmail = impersonation ? impersonation.email : authContext?.user?.profile?.email || "";

  
  const [organizations, setOrganizations] = useState<{ OrganizationID: number; OrganizationName: string }[]>([]);
  const [currentOrganizations, setCurrentOrganizations] = useState<{
    DriversEmail: string; 
    DriversSponsorID: number; 
    DriversPoints: number
  }[]>([]);


  const [orderPlacedEmails, setOrderPlacedEmails] = useState<number>(0);
  // Fetch driver order placed notification preference
   useEffect(() => {
    if (userEmail) {
      const fetchNotificationPref = async () => {
        try {
          const response = await fetch(
            DRIVER_API + encodeURIComponent(userEmail)
          );
          const data = await response.json();
          if (data && data.DriverOrderPlacedNotification !== undefined) {
            // Here we assume the attribute appears only once and is either 1 or 0
            setOrderPlacedEmails(data.DriverOrderPlacedNotification);
          }
        } catch (error) {
          console.error("Error fetching organizations:", error);
        }
    };
    fetchNotificationPref();
    }
  }, [userEmail]);

  // Fetch all organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(
          `${ORG_API}/organizations`
        );
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

  // Fetch driver's relationships
  useEffect(() => {
    if (userEmail) {
      const getDriverRelationships = async () => {
        try {
          const driverRelationshipURL = "https://obf2ta0gw9.execute-api.us-east-1.amazonaws.com/dev1";
          const response = await fetch(
            `${driverRelationshipURL}/driverssponsors?DriversEmail=${encodeURIComponent(userEmail)}`
          );
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

  // Filter organizations: if impersonating, only include the organization that matches impersonation.sponsorOrgID; otherwise, display all
  const filteredOrgs = impersonation?.sponsorOrgID
    ? currentOrganizations.filter(org => org.DriversSponsorID === Number(impersonation.sponsorOrgID))
    : currentOrganizations;

  // Default selected organization state. Initialize when filteredOrgs changes.
  const [selectedOrganizationID, setSelectedOrganizationID] = useState<number | null>(
    filteredOrgs.length > 0 ? filteredOrgs[0].DriversSponsorID : null
  );

  useEffect(() => {
    if (filteredOrgs.length > 0 && selectedOrganizationID === null) {
      setSelectedOrganizationID(filteredOrgs[0].DriversSponsorID);
    }
  }, [filteredOrgs, selectedOrganizationID]);

  const handleOrganizationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrganizationID(Number(event.target.value));
  };

  const { cart, removeFromCart } = useCart();
  const filteredCart = cart.filter((item) => item.org === selectedOrganizationID);
  const totalCost = filteredCart.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (!selectedOrganizationID) {
      alert("Select an organization before submitting the order!");
      return;
    }
  
    // Determine the driver context
    const driverEmail = impersonation
      ? impersonation.email // Impersonated driver
      : userEmail; // Normal signed-in driver
  
    const sponsorOrgID = impersonation
      ? Number(impersonation.sponsorOrgID) // Impersonated driver's sponsorOrgID
      : selectedOrganizationID; // Selected organization for the signed-in driver
  
    // Ensure driverEmail and sponsorOrgID are available
    if (!driverEmail || !sponsorOrgID) {
      alert("Unable to process the order. Missing driver or organization information.");
      return;
    }
  
    // Check point balance
    const orgIndex = currentOrganizations.findIndex(
      (org) => org.DriversSponsorID === sponsorOrgID
    );
  
    if (orgIndex === -1 || currentOrganizations[orgIndex].DriversPoints < totalCost) {
      alert("Insufficient points!");
      return;
    }
  
    // Prepare purchase data
    const purchaseData = {
      PurchaseDriver: driverEmail,
      PurchaseDate: getCurrentMySQLDate(),
      PurchaseStatus: "Ordered",
      PurchaseSponsorID: sponsorOrgID,
    };
  
    try {
      // Post purchase
      const purchaseResult = await callAPI(`${PUR_API}/purchase`, "POST", purchaseData);
      const purchaseID = purchaseResult?.PurchaseID;
  
      if (!purchaseID) {
        throw new Error("Failed to create purchase.");
      }
  
      // Get sponsor email for point change
      let sponsorEmail = "";
      if (impersonation) {
        sponsorEmail = impersonation.email;
      } else {
        const sponsorResult = await callAPIGET(`${SPONSOR_API}/sponsors?UserOrganization=${sponsorOrgID}`);
        sponsorEmail = sponsorResult[0]?.UserEmail;
      }
  
      if (!sponsorEmail) {
        throw new Error("Failed to retrieve sponsor email.");
      }
  
      // Subtract points
      const pointChangeData = {
        PointChangeDriver: driverEmail,
        PointChangeSponsor: sponsorEmail,
        PointChangeNumber: -totalCost,
        PointChangeAction: "Subtract",
      };
      await callAPI(`${POINT_CHANGE_API}/pointchange`, "POST", pointChangeData);
  
      // Add purchased products
      let emailBody = "Thank you for your order!\nProducts Purchased:\n";
      await Promise.all(
        filteredCart.map((item) => {
          const productData = {
            ProductPurchasedID: item.id,
            PurchaseAssociatedID: purchaseID,
            ProductPurchaseQuantity: item.quantity,
          };
          emailBody += `${item.name}\n`;
          return callAPI(`${PROD_PUR_API}/productpurchased`, "POST", productData);
        })
      );
  
      // Remove items from the cart
      const indicesToRemove = cart
        .map((item, index) => (item.org === sponsorOrgID ? index : -1))
        .filter((index) => index !== -1)
        .sort((a, b) => b - a); // Remove from highest index to lowest
  
      indicesToRemove.forEach((index) => {
        removeFromCart(index);
      });
  
      // Send confirmation email if enabled
      if (orderPlacedEmails === 1) {
        const emailData = {
          username: driverEmail,
          emailSubject: "Thanks for your purchase!",
          emailBody,
        };
        await callAPI(`${EMAIL_API}/send-email`, "POST", emailData);
      }
  
      alert("Purchase success!");
    } catch (error) {
      console.error("Error occurred processing purchase:", error);
      alert("Error processing purchase. Please try again.");
    }
  };

  return (
    <div className="container manage-users-container py-3 m-5">
      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h1 className="text-2xl font-bold mb-2">Shopping Cart</h1>
          <label htmlFor="organizationDropdown" className="mr-2">Select Organization:</label>
          <select
            id="organizationDropdown"
            value={selectedOrganizationID || ""}
            onChange={handleOrganizationChange}
          >
            <option value="" disabled>
              Select an Organization
            </option>
            {filteredOrgs.map((org) => {
              const organization = organizations.find(
                (o) => o.OrganizationID === org.DriversSponsorID
              );
              return (
                <option key={org.DriversSponsorID} value={org.DriversSponsorID}>
                  {organization ? organization.OrganizationName : "Unknown Organization"}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="card manage-users-card mt-5">
        <div className="card-body">
          {filteredCart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul>
              {filteredCart.map((item) => {
                const itemIndex = cart.findIndex(
                  (cartItem) =>
                    cartItem.name === item.name &&
                    cartItem.org === item.org &&
                    cartItem.quantity === item.quantity &&
                    cartItem.cost === item.cost &&
                    cartItem.id === item.id
                );
                return (
                  <li key={itemIndex} className="flex justify-between items-center border-b p-2">
                    <span>
                      {item.name} (x{item.quantity}) - {item.cost * item.quantity} Points
                    </span>
                    <button
                      className="text-black px-2 py-1 rounded"
                      onClick={() => removeFromCart(itemIndex)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <h2 className="text-xl font-bold mt-4">Total: {totalCost.toFixed(2)} Points</h2>
          <button
                      className="text-black px-2 py-1 rounded"
                      onClick={() => handleSubmitOrder()}
                    >
                      Submit Order
                    </button>
        </div>
      </div>
    </div>
  );
};