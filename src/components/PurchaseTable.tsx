import React, { useState, useEffect } from 'react';
import './PurchaseTable.css';

interface Purchase {
  PurchaseID: string;
  PurchaseDriver: string;
  PurchaseDate: string; // Format: YYYY-MM-DD
  PurchaseStatus: string;
  PurchaseSponsorID: string;
  PurchasePrice: number;
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

interface ProductDetail {
  trackName: string;
  cost: number;
}

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
      console.log(`API call failed for url ${url} : ${response.status} - ${response.statusText}`);
      throw new Error(`API call failed for url ${url} : ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`API call failed for url ${url} - Network Error: ${error}`);
  }
}

async function callAPIGET(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      method: "GET",
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log('Success: ' + JSON.stringify(responseData))
      return responseData;
    } else {
      console.log(`API call failed for url ${url} : ${response.status} - ${response.statusText}`);
      throw new Error(`API call failed for url ${url} : ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`API call failed for url ${url} - Network Error: ${error}`);
  }
}

const PurchaseTable: React.FC<PurchaseTableProps> = ({ userEmail: initialUserEmail }) => {
  // State variables
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [productsPurchased, setProductsPurchased] = useState<ProductPurchased[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  // Mapping from ProductPurchasedID to fetched product details (trackName and cost)
  const [productDetails, setProductDetails] = useState<{ [key: string]: ProductDetail }>({});
  // Storing the userEmail passed in as a state variable
  const [userEmail] = useState<string>(initialUserEmail);
  // Tracks which purchase rows have been expanded (viewed)
  const [expandedPurchases, setExpandedPurchases] = useState<{ [key: string]: boolean }>({});

    const [orderIssueEmail, setOrderIssueEmails] = useState<number>(0);
    // Fetch driver order placed notification preference
     useEffect(() => {
      if (userEmail) {
        const fetchNotificationPref = async () => {
          try {
            const response = await fetch(
              "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1/driver?DriverEmail=" + encodeURIComponent(userEmail)
            );
            const data = await response.json();
            if (data && data.DriverOrderIssueNotification !== undefined) {
              // Here we assume the attribute appears only once and is either 1 or 0
              setOrderIssueEmails(data.DriverOrderIssueNotification);
            }
          } catch (error) {
            console.error("Error fetching organizations:", error);
          }
      };
      fetchNotificationPref();
      }
    }, [userEmail]);

  // Function to fetch purchases.
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

  // Function to fetch products purchased.
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

  // Function to fetch organizations.
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

  // New function: Fetch product details from iTunes API.
  // Returns an object containing trackName and cost (trackPrice * PointDollarRatio)
  const fetchProductDetails = async (
    productPurchasedID: string,
    purchaseSponsorID: string
  ): Promise<ProductDetail> => {
    try {
      const response = await fetch(`https://itunes.apple.com/lookup?id=${productPurchasedID}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch product details, status: ${response.status}`);
      }
      const json = await response.json();
      if (json.resultCount > 0 && json.results && json.results[0].trackPrice != null) {
        const trackPrice = json.results[0].trackPrice;
        const trackName = json.results[0].trackName || "Item Name Not Found";
        const org = organizations.find(o => o.OrganizationID === purchaseSponsorID);
        const ratio = org ? org.PointDollarRatio : 1;
        const cost = trackPrice * ratio;
        return { trackName, cost };
      } else {
        return { trackName: "Item Name Not Found", cost: 0 };
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      return { trackName: "Item Name Not Found", cost: 0 };
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

  // Handler to expand the purchase row to show its purchased products along with their details.
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

    // Fetch details for each product in parallel, accounting for quantity.
    const details = await Promise.all(
      purchaseProducts.map(product =>
        fetchProductDetails(product.ProductPurchasedID, sponsorId).then(result => ({
          trackName: result.trackName,
          // Multiply cost by quantity for total cost per product.
          cost: result.cost * product.ProductPurchaseQuantity,
        }))
      )
    );

    // Update the productDetails state with the fetched details.
    const newMapping = purchaseProducts.reduce((acc, product, index) => {
      acc[product.ProductPurchasedID] = details[index];
      return acc;
    }, {} as { [key: string]: ProductDetail });

    setProductDetails(prev => ({ ...prev, ...newMapping }));
  };

  // Modified cancel handler that now accepts the purchase cost.
  // It updates the Purchase Status locally to "Canceled" so that the UI reflects the cancellation and removes the Cancel button.
  const handleCancel = async (orgID: string, purchaseId: string, purchaseCost: number) => {
    try {
      const sponsorResult = await callAPIGET(`https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1/sponsors?UserOrganization=${orgID}`);
      const sponsorResultData = await sponsorResult;
      const sponsorEmail = sponsorResultData[0]?.UserEmail || "";
      if (sponsorEmail !== undefined) {
        const pointChange = purchaseCost;
        const pointChangeData = {
          "PointChangeDriver": userEmail,
          "PointChangeSponsor": sponsorEmail, 
          "PointChangeNumber": pointChange,
          "PointChangeAction": "Add"
        };
        console.log(pointChangeData);
        await callAPI(`https://kco45spzej.execute-api.us-east-1.amazonaws.com/dev1/pointchange`, "POST", pointChangeData);
  
        const purchaseData = {
          "PurchaseID": purchaseId,
          "PurchaseStatus": "Canceled"
        };
        await callAPI("https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1/purchase", "PUT", purchaseData);

        if (orderIssueEmail === 1) {
          const emailData = {
            "username" : userEmail,
            "emailSubject" : "Update to your order",
            "emailBody" : "An order on your account was canceled. You have been refunded the order cost of " + purchaseCost + " points."
          }
          await callAPI("https://7auyafrla5.execute-api.us-east-1.amazonaws.com/dev1/send-email", "POST", emailData);
        }

        // Update local state so that the Purchase Status is updated to "Canceled"
        setPurchases(prevPurchases =>
          prevPurchases.map(p =>
            p.PurchaseID === purchaseId ? { ...p, PurchaseStatus: "Canceled" } : p
          )
        );
  
        console.log(`Cancel purchase ${purchaseId} with cost ${purchaseCost}`);
        alert("Purchase canceled!");
      } else {
        alert("Purchase unable to be canceled. Try again.");
      }
    } catch (error) {
      alert("Purchase unable to be canceled. Try again.");
    }
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

              return (
                <tr key={purchase.PurchaseID}>
                  <td>{purchase.PurchaseDate}</td>
                  <td>{purchase.PurchaseStatus}</td>
                  <td>
                    {expandedPurchases[purchase.PurchaseID] ? (
                      <ul>
                        {purchaseProducts.map(product => (
                          <li key={product.ProductPurchasedID}>
                            {productDetails[product.ProductPurchasedID]
                              ? `${productDetails[product.ProductPurchasedID].trackName}: $${productDetails[product.ProductPurchasedID].cost.toFixed(2)}`
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
                  <td>
                    {purchase.PurchasePrice.toFixed(2)}
                  </td>
                  <td>
                    {purchase.PurchaseDate.split('T')[0] === today && purchase.PurchaseStatus !== "Canceled" && (
                      <button onClick={() => handleCancel(purchase.PurchaseSponsorID, purchase.PurchaseID, purchase.PurchasePrice || 0)}>
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
