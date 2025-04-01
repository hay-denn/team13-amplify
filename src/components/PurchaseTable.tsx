import React, { useState, useEffect } from 'react';
import './PurchaseTable.css';

interface Purchase {
  PurchaseID: string;
  PurchaseDriver: string;
  PurchaseDate: string; // Format: YYYY-MM-DD
  PurchaseStatus: string;
  PurchaseSponsorID: string;
}

interface ProductPurchased {
  ProductPurchasedID: string;
  PurchaseAssociatedID: string;
  ProductPurchaseQuantity: number;
}

interface PointChange {
  PointChangeID: string;
  PointChangeDriver: string;
  PointChangeSponsor: string;
  PointChangeNumber: number;
  PointChangeAction: string;
  PointChangeDate: string;
}

interface PurchaseTableProps {
  userEmail: string;
}

const PurchaseTable: React.FC<PurchaseTableProps> = ({ userEmail: initialUserEmail }) => {
  // State variables
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [productsPurchased, setProductsPurchased] = useState<ProductPurchased[]>([]);
  const [pointChanges, setPointChanges] = useState<PointChange[]>([]);
  // Mapping from ProductPurchasedID to fetched product name
  const [productNames, setProductNames] = useState<{ [key: string]: string }>({});
  // Storing the userEmail passed in as a state variable
  const [userEmail] = useState<string>(initialUserEmail);
  // Tracks which purchase rows have been expanded (viewed)
  const [expandedPurchases, setExpandedPurchases] = useState<{ [key: string]: boolean }>({});

  // Function to fetch purchases. Returns the JSON data directly.
  const getPurchases = async (): Promise<Purchase[]> => {
    try {
      const response = await fetch(
        `https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1/purchases`
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data as Purchase[];
    } catch (error) {
      console.error("Error getting purchases:", error);
      return [];
    }
  };

  // Function to fetch products purchased. Returns the JSON data directly.
  const getProductsPurchased = async (): Promise<ProductPurchased[]> => {
    try {
      const response = await fetch(
        `https://ptgem248l6.execute-api.us-east-1.amazonaws.com/dev1/productspurchased`
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data as ProductPurchased[];
    } catch (error) {
      console.error("Error getting products purchased:", error);
      return [];
    }
  };

  // Function to fetch point changes. Returns the JSON data directly.
  const getPointChanges = async (): Promise<PointChange[]> => {
    try {
      const response = await fetch(
        `https://kco45spzej.execute-api.us-east-1.amazonaws.com/dev1/pointchanges`
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data as PointChange[];
    } catch (error) {
      console.error("Error getting point changes:", error);
      return [];
    }
  };

  // New function: Fetch product details from iTunes API using the ProductPurchasedID.
  const fetchProductDetails = async (productPurchasedID: string): Promise<string> => {
    try {
      const response = await fetch(`https://itunes.apple.com/lookup?id=${productPurchasedID}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch product details, status: ${response.status}`);
      }
      const json = await response.json();
      if (json.resultCount > 0 && json.results && json.results[0].trackName) {
        return json.results[0].trackName;
      } else {
        return "Item Name Not Found";
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      return "Item Name Not Found";
    }
  };

  // useEffect hooks to load data when the component mounts
  useEffect(() => {
    const fetchPurchases = async () => {
      const data = await getPurchases();
      setPurchases(data);
    };
    fetchPurchases();
  }, []);

  useEffect(() => {
    const fetchProductsPurchased = async () => {
      const data = await getProductsPurchased();
      setProductsPurchased(data);
    };
    fetchProductsPurchased();
  }, []);

  useEffect(() => {
    const fetchPointChanges = async () => {
      const data = await getPointChanges();
      setPointChanges(data);
    };
    fetchPointChanges();
  }, []);

  // Handler to expand the purchase row to show its purchased products along with their names
  const handleViewClick = async (purchaseId: string) => {
    // Mark the purchase as expanded
    setExpandedPurchases(prev => ({ ...prev, [purchaseId]: true }));

    // Find all products associated with the purchase
    const purchaseProducts = productsPurchased.filter(
      product => product.PurchaseAssociatedID === purchaseId
    );

    // Fetch details for each product in parallel
    const details = await Promise.all(
      purchaseProducts.map(product => fetchProductDetails(product.ProductPurchasedID))
    );

    // Update the productNames state with the fetched track names
    const newMapping = purchaseProducts.reduce((acc, product, index) => {
      acc[product.ProductPurchasedID] = details[index];
      return acc;
    }, {} as { [key: string]: string });

    setProductNames(prev => ({ ...prev, ...newMapping }));
  };

  // Modified cancel handler that now accepts the purchase cost.
  const handleCancel = (purchaseId: string, purchaseCost: number) => {
    // TODO: Implement cancel purchase functionality using purchaseId and purchaseCost.
    console.log(`Cancel purchase ${purchaseId} with cost ${purchaseCost}`);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="purchase-table-container">
      <table className="purchase-table">
        <thead>
          <tr>
            <th>Purchase Date</th>
            <th>Purchase Status</th>
            <th>Purchase Items</th>
            <th>Purchase Cost</th>
            <th>Cancel Purchase</th>
          </tr>
        </thead>
        <tbody>
          {purchases
            .filter(purchase => purchase.PurchaseDriver === userEmail)
            .map(purchase => {
              // Find the point change corresponding to this purchase.
              const matchingPointChange = pointChanges.find(
                pointChange =>
                  pointChange.PointChangeDriver === userEmail &&
                  pointChange.PointChangeAction === `Purchase - ${purchase.PurchaseID}`
              );
              const purchaseCost = matchingPointChange ? matchingPointChange.PointChangeNumber : 0;
              
              return (
                <tr key={purchase.PurchaseID}>
                  <td>{purchase.PurchaseDate}</td>
                  <td>{purchase.PurchaseStatus}</td>
                  <td>
                    {expandedPurchases[purchase.PurchaseID] ? (
                      <ul>
                        {productsPurchased
                          .filter(product => product.PurchaseAssociatedID === purchase.PurchaseID)
                          .map(product => (
                            <li key={product.ProductPurchasedID}>
                              {productNames[product.ProductPurchasedID]
                                ? productNames[product.ProductPurchasedID]
                                : "Loading..."}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <button onClick={() => handleViewClick(purchase.PurchaseID)}>View</button>
                    )}
                  </td>
                  <td>{purchaseCost}</td>
                  <td>
                    {purchase.PurchaseDate === today && (
                      <button onClick={() => handleCancel(purchase.PurchaseID, purchaseCost)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseTable;
