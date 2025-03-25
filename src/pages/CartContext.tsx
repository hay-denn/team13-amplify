import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AuthContext } from "react-oidc-context";
import "./Manageusers.css";


// Define item type
interface CartItem {
  name: string;
  cost: number;
  quantity: number;
  org: number;
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
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.name === item.name && cartItem.org === item.org);
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

// Cart Page Component
export const CartPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const userEmail = authContext?.user?.profile?.email || "";
  
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

  const { cart, removeFromCart } = useCart();
  const filteredCart = cart.filter((item) => item.org === selectedOrganizationID);
  const totalCost = filteredCart.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <div className="container manage-users-container py-3 m-5">
      <div className="card manage-users-card mt-5">
        <div className="card-body">
        <h1 className="text-2xl font-bold mb-2">Shopping Cart</h1>
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
        </div>
      </div>
      <div className="card manage-users-card mt-5">
      <div className="card-body">
        {filteredCart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {filteredCart.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b p-2">
                <span>{item.name} (x{item.quantity}) - {item.cost * item.quantity} Points</span>
                <button className="text-black px-2 py-1 rounded" onClick={() => removeFromCart(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <h2 className="text-xl font-bold mt-4">Total: {totalCost.toFixed(2)} Points</h2>
      </div>
      </div>
    </div>
  );
};
