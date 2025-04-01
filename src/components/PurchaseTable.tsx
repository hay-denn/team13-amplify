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

interface Organization {
  OrganizationID: string;
  PointDollarRatio: number;
}

interface PurchaseTableProps {
  userEmail: string;
}

const PurchaseTable: React.FC<PurchaseTableProps> = ({ userEmail: initialUserEmail }) => {
  // State variables
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [productsPurchased, setProductsPurchased] = useState<ProductPurchased[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  // Mapping from ProductPurchasedID to fetched product cost
  const [productCosts, setProductCosts] = useState<{ [key: string]: number }>({});
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


  // Function to fetch organizations. Returns the JSON data directly.
  const getOrganizations = async (): Promise<Organization[]> => {
    try {
      // Placeholder endpoint – replace with your actual endpoint.
      const response = await fetch(`https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data as Organization[];
    } catch (error) {
      console.error("Error getting organizations:", error);
      return [];
    }
  };

  // New function: Fetch product cost details from iTunes API using the ProductPurchasedID.
  // Returns trackPrice multiplied by the PointDollarRatio where OrganizationID equals the purchase's PurchaseSponsorID.
  const fetchProductDetails = async (
    productPurchasedID: string,
    purchaseSponsorID: string
  ): Promise<number> => {
    try {
      const response = await fetch(`https://itunes.apple.com/lookup?id=${productPurchasedID}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch product details, status: ${response.status}`);
      }
      const json = await response.json();
      if (json.resultCount > 0 && json.results && json.results[0].trackPrice != null) {
        const trackPrice = json.results[0].trackPrice;
        const org = organizations.find(o => o.OrganizationID === purchaseSponsorID);
        const ratio = org ? org.PointDollarRatio : 1;
        return trackPrice * ratio;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      return 0;
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
    const fetchOrganizations = async () => {
      const data = await getOrganizations();
      setOrganizations(data);
    };
    fetchOrganizations();
  }, []);

  // Handler to expand the purchase row to show its purchased products along with their costs.
  // It also fetches the cost for each product and updates the productCosts state.
  const handleViewClick = async (purchaseId: string) => {
    // Mark the purchase as expanded.
    setExpandedPurchases(prev => ({ ...prev, [purchaseId]: true }));

    // Retrieve the purchase to get its PurchaseSponsorID.
    const purchase = purchases.find(p => p.PurchaseID === purchaseId);
    const sponsorId = purchase ? purchase.PurchaseSponsorID : "";

    // Find all products associated with the purchase.
    const purchaseProducts = productsPurchased.filter(
      product => product.PurchaseAssociatedID === purchaseId
    );

    // Fetch cost details for each product in parallel, accounting for quantity.
    const details = await Promise.all(
      purchaseProducts.map(product =>
        fetchProductDetails(product.ProductPurchasedID, sponsorId).then(
          cost => cost * product.ProductPurchaseQuantity
        )
      )
    );

    // Update the productCosts state with the fetched costs.
    const newMapping = purchaseProducts.reduce((acc, product, index) => {
      acc[product.ProductPurchasedID] = details[index];
      return acc;
    }, {} as { [key: string]: number });

    setProductCosts(prev => ({ ...prev, ...newMapping }));
  };

  // Modified cancel handler that now accepts the purchase cost.
  const handleCancel = (purchaseId: string, purchaseCost: number) => {
    // TODO: Implement cancel purchase functionality using purchaseId and purchaseCost.
    console.log(`Cancel purchase ${purchaseId} with cost ${purchaseCost}`);
  };

  // Get today's date in YYYY-MM-DD format.
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
              // Filter the products associated with this purchase.
              const purchaseProducts = productsPurchased.filter(
                product => product.PurchaseAssociatedID === purchase.PurchaseID
              );
              // Compute total cost for the purchase by summing the product costs.
              const totalCost = purchaseProducts.reduce(
                (sum, product) => sum + (productCosts[product.ProductPurchasedID] || 0),
                0
              );
              
              return (
                <tr key={purchase.PurchaseID}>
                  <td>{purchase.PurchaseDate}</td>
                  <td>{purchase.PurchaseStatus}</td>
                  <td>
                    {expandedPurchases[purchase.PurchaseID] ? (
                      <ul>
                        {purchaseProducts.map(product => (
                          <li key={product.ProductPurchasedID}>
                            {productCosts[product.ProductPurchasedID] !== undefined
                              ? productCosts[product.ProductPurchasedID]
                              : "Loading..."}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <button onClick={() => handleViewClick(purchase.PurchaseID)}>
                        View
                      </button>
                    )}
                  </td>
                  <td>{totalCost}</td>
                  <td>
                    {purchase.PurchaseDate.split('T')[0] === today && (
                      <button onClick={() => handleCancel(purchase.PurchaseID, totalCost)}>
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
