import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AuthContext } from "react-oidc-context";
import "./Manageusers.css";
import "./CartContext.css";

// Define item type
interface CartItem {
  name: string; //Name of the item (can be anything, this info is not stored in our DB)
  cost: number; //cost (in points) of item
  quantity: number; //quantity of item (probably just use 1)
  org: number; //the organization ID for the catalog that the user is adding the item from
  id: number; //the trackID of the item
}

// Define context type
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
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
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
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
const PUR_API = "https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1";
const PROD_PUR_API = "https://ptgem248l6.execute-api.us-east-1.amazonaws.com/dev1";
const POINT_CHANGE_API = "https://kco45spzej.execute-api.us-east-1.amazonaws.com/dev1";
const SPONSOR_API = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1"
const EMAIL_API = "https://7auyafrla5.execute-api.us-east-1.amazonaws.com/dev1";


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

  
  const [organizations, setOrganizations] = useState<{ OrganizationID: number; 
                                                      OrganizationName: string;
                                                      PointDollarRatio: number}[]>([]);
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
            "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1/driver?DriverEmail=" + encodeURIComponent(userEmail)
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
          "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations"
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
          const driverRelationshipURL = "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";
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
    if (selectedOrganizationID) {
    //check point balance 

    //get correct organization for point balance check
    let curOrgIndex = -1;
    if (impersonation) {
      curOrgIndex = Number(impersonation.sponsorOrgID);
    } else {
      curOrgIndex = filteredOrgs.findIndex(
        (driverorg) =>
          driverorg.DriversSponsorID === selectedOrganizationID
      );
      console.log(curOrgIndex)
    }

    if (filteredOrgs[curOrgIndex].DriversPoints >= totalCost) {
        //post purchase
            const purchaseData = {
              "PurchaseDriver" : userEmail,
              "PurchaseDate": getCurrentMySQLDate(),
              "PurchaseStatus":"Delivered",
              "PurchaseSponsorID": selectedOrganizationID
          }
          try {
            const purchaseResult = await callAPI(`${PUR_API}/purchase`, "POST", purchaseData);
            const purchaseResultData = await purchaseResult;
            const purchaseID = purchaseResultData?.PurchaseID;
            if (purchaseID !== undefined) {
              //Get a sponsor email from this organization for the point change
              let sponsorEmail = "";
              if (impersonation) {
                sponsorEmail = impersonation.email;
              } else {
                const sponsorResult = await callAPIGET(`${SPONSOR_API}/sponsors?UserOrganization=${selectedOrganizationID}`);
                const sponsorResultData = await sponsorResult;
                sponsorEmail = sponsorResultData[0]?.UserEmail;
              }
              if (sponsorEmail !== undefined) {
                const pointChange = (totalCost * -1);
                const pointChangeData = {
                  "PointChangeDriver": userEmail,
                  "PointChangeSponsor": sponsorEmail, 
                  "PointChangeNumber": pointChange,
                  "PointChangeAction": "Subtract"
                }
                callAPI(`${POINT_CHANGE_API}/pointchange`, "POST", pointChangeData);
                
                let emailBody = "Thank you for your order!\nProducts Purchased:\n";
                await Promise.all(
                  filteredCart.map((item) => {
                    const productData = {
                      "ProductPurchasedID": item.id,
                      "PurchaseAssociatedID": purchaseID,
                      "ProductPurchaseQuantity": item.quantity
                    };
                    emailBody = emailBody + item.name + "\n"
                    console.log(productData);
                    
                    return callAPI(`${PROD_PUR_API}/productpurchased`, "POST", productData);
                  })
                );

                  // Remove all items in filteredCart from the global cart.
                  // Compute the indices in the global cart that match the selected organization.
                  const indicesToRemove = cart
                  .map((item, index) => item.org === selectedOrganizationID ? index : -1)
                  .filter((index) => index !== -1)
                  .sort((a, b) => b - a); // Remove from highest index to lowest.

                indicesToRemove.forEach((index) => {
                  removeFromCart(index);
                });
                if (orderPlacedEmails === 1) {
                  const emailData = {
                    "username" : userEmail,
                    "emailSubject" : "Thanks for your purchase!",
                    "emailBody" : emailBody
                  };
                  callAPI(`${EMAIL_API}/send-email`, "POST", emailData);
                }
                alert("Purchase success!");
              } else {
                console.log("Could not retrieve a sponsor ID for the purchase");
                alert("Error processing purchase. Please try again.");
              }
            }
          } catch (error) {
            console.error("Error occurred processing purchase", error);
            alert("Error processing purchase. Please try again.")
          }
    } else {
      alert("Insufficient points!");
    }

  } else {
    alert("Select an organization before submitting order!");
  }
}

  // Function to get organization name by ID
  const getOrganizationName = (orgID: number): string => {
    const org = organizations.find((org) => org.OrganizationID === orgID);
    return org ? org.OrganizationName : "Unknown Organization";
  };

  const getOrganizationPointRatio = (orgID: number): number => {
    const org = organizations.find((org) => org.OrganizationID === orgID);
    return org ? org.PointDollarRatio : 1; // Default to 1 if not found
  };

  // Calculate subtotal and point conversion
  const subtotal = totalCost / 100;
  const point_conversion = selectedOrganizationID !== null 
    ? getOrganizationPointRatio(selectedOrganizationID) 
    : 1; // Default to 1 if no organization is selected

  const total_points = subtotal * point_conversion;

  // Check if cart is empty
  const isCartEmpty = filteredCart.length === 0;

  return (
    <div className="cart-page">
      <nav className="cart-page__navbar">
        <div className="cart-page__navbar-content">
          <div className="cart-page__navbar-left">
            <a href="/" className="cart-page__brand">
              MoneyMiles
            </a>
          </div>
  
            {currentOrganizations.length > 1 && (
            <div className="cart-page__org-dropdown-wrapper">
              <label htmlFor="organization-select" className="cart-page__org-dropdown-label">
              Change Organization ▾
              </label>
              <select
              id="organization-select"
              className="cart-page__org-dropdown-menu"
              value={selectedOrganizationID || ""}
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
                  <div className="cart-page__item-info">
                    <h2>{item.name}</h2>
                    <p>Cost: {item.cost} points</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <button
                    className="cart-page__button cart-page__button--remove"
                    onClick={() => removeFromCart(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button className="cart-page__button cart-page__button--primary" onClick={handleSubmitOrder}>
                Submit Order
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
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-page__summary-row">
            <span>Point Ratio</span>
            <span>{point_conversion.toFixed(2)}</span>
          </div>
          <div className="cart-page__summary-row cart-page__summary-total">
            <span>Estimated total</span>
            <span>{total_points.toFixed(2)} points</span>
          </div>
        </div>
      </div>
    </div>
  ); 
}