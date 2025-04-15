import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AuthContext } from "react-oidc-context";
import "./Manageusers.css";
import "./CartContext.css";

// Define item type
export interface CartItem {
  name: string;    // Name of the item
  cost: number;    // Cost (in points)
  quantity: number;
  org: number;     // Organization ID
  id: number;      // trackID of the item
  driverEmail?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // Look for an existing item with same name & org
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem.name === item.name && cartItem.org === item.org
      );
      if (existingItemIndex !== -1) {
        // If found, increment quantity
        return prevCart.map((cartItem, idx) =>
          idx === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      // If it doesn't exist, add it
      return [...prevCart, item];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a <CartProvider>.");
  }
  return context;
};

// Getting SQL friendly date
function getCurrentMySQLDate(): string {
  const now = new Date();

  // Pad single digits with a leading zero
  const pad = (num: number): string => (num < 10 ? "0" + num : num.toString());

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// API LINKS
const PUR_API = import.meta.env.VITE_API_PURCHASES;
const PROD_PUR_API = import.meta.env.VITE_API_PRODUCTS_PURCHASED;
const POINT_CHANGE_API = import.meta.env.VITE_API_POINTCHANGES;
const SPONSOR_API = import.meta.env.VITE_API_SPONSOR;
const EMAIL_API = import.meta.env.VITE_API_EMAIL;
const DRIVER_API = import.meta.env.VITE_API_DRIVER;
const ORG_API = import.meta.env.VITE_API_ORGANIZATION;

// API call function for purchases
async function callAPI(url: string, methodType: string, data: object): Promise<any> {
  try {
    const response = await fetch(url, {
      method: methodType, // HTTP method
      headers: {
        "Content-Type": "application/json", // Content type header
      },
      body: JSON.stringify(data), // Convert the data to JSON string
    });
    if (response.ok) {
      // If the request was successful
      const responseData = await response.json();
      console.log("Success: " + JSON.stringify(responseData));
      return responseData;
    } else {
      // Handle error if response status is not OK
      console.log(`API call failed for url ${url} : ${response.status} - ${response.statusText}`);
      throw new Error(`API call failed for url ${url} : ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    // Catch any network or other errors
    throw new Error(`API call failed for url ${url} - Network Error: ${error}`);
  }
}

// GET API call function for purchases
async function callAPIGET(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      method: "GET", // HTTP method
    });
    if (response.ok) {
      // If the request was successful
      const responseData = await response.json();
      console.log("Success: " + JSON.stringify(responseData));
      return responseData;
    } else {
      // Handle error if response status is not OK
      console.log(`API call failed for url ${url} : ${response.status} - ${response.statusText}`);
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

  // Fetch all organizations (full list with names)
  const [organizations, setOrganizations] = useState<{ OrganizationID: number; 
    OrganizationName: string;
    PointDollarRatio: number; }[]>([]);
  
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(`${ORG_API}/organizations`);
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
  const [currentOrganizations, setCurrentOrganizations] = useState<{
    DriversEmail: string;
    DriversSponsorID: number;
    DriversPoints: number;
  }[]>([]);
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
    ? currentOrganizations.filter((org) => org.DriversSponsorID === Number(impersonation.sponsorOrgID))
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

  // Handler for organization change via dropdown
  const handleOrganizationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrganizationID(Number(event.target.value));
  };

  // Helper to get the organization name from its ID using the organizations list
  const getOrganizationName = (orgID: number): string => {
    const orgFound = organizations.find((org) => org.OrganizationID === orgID);
    return orgFound ? orgFound.OrganizationName : "Unknown Organization";
  };

  const { cart, removeFromCart, clearCart } = useCart();

  const filteredCart = cart.filter((item) => item.org === selectedOrganizationID);
  const totalCost = filteredCart.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  const subtotal = totalCost;
  const point_conversion = organizations.find((org) => org.OrganizationID === selectedOrganizationID)?.PointDollarRatio || 0;
  const total_points = subtotal*point_conversion;
  const isCartEmpty = filteredCart.length === 0;

  const [orderPlacedEmails, setOrderPlacedEmails] = useState<number>(0);
  // Fetch driver order placed notification preference
  useEffect(() => {
    if (userEmail) {
      const fetchNotificationPref = async () => {
        try {
          const response = await fetch(
            DRIVER_API + "/driver?DriverEmail=" + encodeURIComponent(userEmail)
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

  const handleSubmitOrder = async () => {
    if (!selectedOrganizationID) {
      alert("Select an organization before submitting the order!");
      return;
    }

    // Determine the driver context
    const driverEmail = impersonation ? impersonation.email : userEmail;
    const sponsorOrgID = impersonation
      ? Number(impersonation.sponsorOrgID)
      : selectedOrganizationID;

    // Ensure driverEmail and sponsorOrgID are available
    if (!driverEmail || !sponsorOrgID) {
      alert("Unable to process the order. Missing driver or organization information.");
      return;
    }

    // Check point balance
    const orgIndex = currentOrganizations.findIndex((org) => org.DriversSponsorID === sponsorOrgID);
    if (orgIndex === -1 || currentOrganizations[orgIndex].DriversPoints < total_points) {
      alert("Insufficient points!");
      return;
    }

    // Prepare purchase data
    const purchaseData = {
      PurchaseDriver: driverEmail,
      PurchaseDate: getCurrentMySQLDate(),
      PurchaseStatus: "Ordered",
      PurchaseSponsorID: sponsorOrgID,
      PurchasePrice: totalCost,
    };

    try {
      // Post purchase
      console.log("Posting purchase data:", purchaseData);
      const purchaseResult = await callAPI(`${PUR_API}/purchase`, "POST", purchaseData);
      const purchaseID = purchaseResult?.PurchaseID;
      if (!purchaseID) {
        throw new Error("Failed to create purchase.");
      }

      // Get sponsor email for point change
      let sponsorEmail = "";
      const sponsorResult = await callAPIGET(`${SPONSOR_API}/sponsors?UserOrganization=${sponsorOrgID}`);
      sponsorEmail = sponsorResult[0]?.UserEmail;
      if (!sponsorEmail) {
        throw new Error("Failed to retrieve sponsor email.");
      }

      // Subtract points
      const pointChangeData = {
        PointChangeDriver: driverEmail,
        PointChangeSponsor: sponsorEmail,
        PointChangeNumber: -total_points,
        PointChangeAction: "Subtract",
        PointChangeReason: `Purchase Order ${purchaseID}`
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
          emailBody += `Product Name: ${item.name}\t Point Price: ${item.cost}\n`;
          return callAPI(`${PROD_PUR_API}/productpurchased`, "POST", productData);
        })
      );

      // Remove items from the cart (for the current organization)
      const indicesToRemove = cart
        .map((item, index) => (item.org === sponsorOrgID ? index : -1))
        .filter((index) => index !== -1)
        .sort((a, b) => b - a); // Remove from highest index to lowest

      indicesToRemove.forEach((index) => {
        removeFromCart(index);
      });

      // Send confirmation email if enabled
      if (orderPlacedEmails === 1) {
        emailBody += "Order Total: " + totalCost;
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
    <div className="cart-page">
      <nav className="cart-page__navbar">
        <div className="cart-page__navbar-content">
          <div className="cart-page__navbar-left">
            <a href="/" className="cart-page__brand">
              MoneyMiles
            </a>
          </div>
          {!impersonation && currentOrganizations.length > 1 && (
            <div className="cart-page__org-selector">
              <select
                id="org-selector"
                value={selectedOrganizationID ?? ""}
                onChange={handleOrganizationChange}
              >
                {currentOrganizations.map((org) => (
                  <option key={org.DriversSponsorID} value={org.DriversSponsorID}>
                    {getOrganizationName(org.DriversSponsorID)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </nav>

      {/* Main cart container */}
      <div className="cart-page__container">
        <div className="cart-page__content">
          {isCartEmpty ? (
            <>
              <h1 className="cart-page__title">Looks like your bag is empty</h1>
              <button
                className="cart-page__button cart-page__button--secondary"
                onClick={() => (window.location.href = "/catalog")}
              >
                Continue Shopping
              </button>
            </>
          ) : (
            <>
              <h1>Your Bag</h1>
              {filteredCart.map((item, index) => (
                <div key={index} className="cart-page__item">
                  <div className="cart-page__item-left">
                    <h3 className="cart-page__item-title">{item.name}</h3>
                    <div className="cart-page__item-details">
                      <span className="cart-page__item-cost">{(item.cost*point_conversion).toFixed(2)} points</span>
                      <span className="cart-page__item-quantity">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  
                  <div className="cart-page__item-right">
                    <button
                      className="cart-page__button cart-page__button--remove"
                      onClick={() => removeFromCart(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* NEW: Remove All Button */}
              <button
                className="cart-page__button cart-page__button--secondary"
                onClick={clearCart}
              >
                Remove All
              </button>

              <button
                className="cart-page__button cart-page__button--secondary"
                onClick={() => (window.location.href = "/catalog")}
              >
                Continue Shopping
              </button>
            </>
          )}
        </div>

        {/* Order summary box on the right */}
        <div className="cart-page__summary">
          <h2 className="cart-page__summary-title">Order Summary</h2>

          <div className="cart-page__summary-row">
            <span>Organization</span>
            <span>{getOrganizationName(selectedOrganizationID ?? 0)}</span>
          </div>

          <div className="cart-page__summary-row">
            <span>Current Points</span>
            <span>
              {
                currentOrganizations.find(
                  (org) => org.DriversSponsorID === selectedOrganizationID
                )?.DriversPoints ?? 0
              }
            </span>
          </div>

          <div className="cart-page__summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="cart-page__summary-row">
            <span>Point to Dollar Ratio</span>
            <span>{point_conversion}</span>
          </div>

          <div className="cart-page__summary-row cart-page__summary-total">
            <span>Point total</span>
            <span>{(total_points).toFixed(2)} points</span>
          </div>  
          <button
            className="cart-page__button cart-page__button--primary"
            onClick={handleSubmitOrder}
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
};
