import "./topBox.css";
import { AuthContext } from "react-oidc-context";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Purchase {
  PurchaseID: number;
  PurchaseDriver: string;
  PurchaseDate: string;
  PurchaseStatus: string;
  PurchaseSponsorID: number;
  PurchasePrice: number;
}

export const TopBox = () => {
  let navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const storedImpersonation = localStorage.getItem("impersonatingDriver");
  const impersonation = storedImpersonation
    ? JSON.parse(storedImpersonation)
    : null;

  const purchase_url =
    "https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1";

  const userEmail = impersonation
    ? impersonation.email
    : authContext?.user?.profile?.email || "";
  //Gets the purhcases info and filters it by your eamil

  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const fetchOrganizations = async (): Promise<void> => {
      try {
        const response = await fetch(`${purchase_url}/purchases`);

        const data: Purchase[] = await response.json();

        const filteredPurchases = data.filter(
          (purchase) => purchase.PurchaseDriver === userEmail
        );
        setPurchases(filteredPurchases);

        const sortedPurchases = filteredPurchases.sort(
          (a, b) =>
            new Date(b.PurchaseDate).getTime() -
            new Date(a.PurchaseDate).getTime()
        );
        setPurchases(sortedPurchases);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, [userEmail, purchase_url]);

  return (
    <div className="topBox">
      <h3>Your Most Recent Purchases</h3>
      <button
        className="btn btn-primary"
        onClick={() => navigate("../account")}
      >
        View Recent Purchases
      </button>
      <div className="list">
        {purchases.length ? (
          <ul>
            {purchases.map((purchase) => (
              <li key={purchase.PurchaseID} className="purchase-item">
                <div>
                  <strong>🛒 Purchase ID:</strong> {purchase.PurchaseID}
                </div>

                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(purchase.PurchaseDate).toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong> {purchase.PurchaseStatus}
                </div>
                <div>
                  <strong>Sponsor ID:</strong> {purchase.PurchaseSponsorID}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No purchases found.</p>
        )}
      </div>
    </div>
  );
};
