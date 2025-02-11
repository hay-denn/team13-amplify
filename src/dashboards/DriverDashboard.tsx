import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";

const DriverDashboard = () => {
  const auth = useAuth();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const cognitoGroups: string[] = auth.user?.profile?.["cognito:groups"] as string[] || [];

  useEffect(() => {
    if (!auth.user?.id_token) return;

    // Check if the message has already been dismissed
    if (localStorage.getItem("welcomeDismissed") === "true") {
      setShowWelcomeMessage(false);
      return;
    }

    try {
      // Extract and decode JWT payload
      const idToken = auth.user.id_token;
      const payloadBase64 = idToken.split(".")[1]; // Get JWT payload
      const decodedPayload = JSON.parse(atob(payloadBase64)); // Decode Base64

      if (decodedPayload.iat) {
        const issuedAt = decodedPayload.iat; // 'iat' in Unix timestamp (seconds)
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const timeSinceSignUp = currentTime - issuedAt;

        // Show welcome message only if sign-up happened in the last 60 sec
        if (timeSinceSignUp <= 60) {
          setShowWelcomeMessage(true);
        }
      }
    } catch (error) {
      console.error("❌ Error decoding ID Token:", error);
    }
  }, [auth.user]);

  // Logout handler - Clears session and removes welcome message permanently
  const handleLogout = () => {
    auth.removeUser();
    localStorage.setItem("welcomeDismissed", "true"); // Prevent message from reappearing
    setShowWelcomeMessage(false);
  };

  return (
    <div>
      <h1>Driver Dashboard</h1>
      {showWelcomeMessage && <p style={{ color: "green", fontWeight: "bold" }}>🎉 Welcome to your new account!</p>}
      <p>Welcome, Driver!</p>

      <pre> Hello: {auth.user?.profile?.email} </pre>
      <pre> ID Token: {auth.user?.id_token || "No ID Token Available"} </pre>
      <pre> Access Token: {auth.user?.access_token || "No Access Token"} </pre>
      <pre> Refresh Token: {auth.user?.refresh_token || "No Refresh Token"} </pre>
      <pre> Group: {cognitoGroups[0] || "No Group"} </pre>

      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
};

export default DriverDashboard;