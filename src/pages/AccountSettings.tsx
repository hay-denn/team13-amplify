import React, { useState, useEffect } from "react";
// Not using "Auth" from AWS Amplify at all
import { useAuth } from "react-oidc-context";
import EditableInput from "../components/EditableInput";

const REGION = "us-east-1"; // or your region
const COGNITO_API_URL = `https://cognito-idp.${REGION}.amazonaws.com/`;

export const AccountSettings: React.FC = () => {
  const auth = useAuth();
  
  // Toggles the change password form
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  // Form fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // For live password strength checks
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [isLongEnough, setIsLongEnough] = useState(false);

  // Show/hide the password text
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error/success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setHasNumber(/\d/.test(newPassword));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(newPassword));
    setHasUpperCase(/[A-Z]/.test(newPassword));
    setHasLowerCase(/[a-z]/.test(newPassword));
    setIsLongEnough(newPassword.length >= 8);
  }, [newPassword]);

  // Show the form
  const handleOpenForm = () => {
    setShowChangePasswordForm(true);
  };

  // Hide and reset the form
  const handleCancel = () => {
    setShowChangePasswordForm(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Direct call to Cognito ChangePassword API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Basic client-side checks
    if (!hasNumber || !hasSpecialChar || !hasUpperCase || !hasLowerCase || !isLongEnough) {
      setErrorMessage("New password does not meet the requirements.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    // You need the Cognito "access_token" from your OIDC library
    // For example, with react-oidc-context, it might be something like:
    // auth.user?.access_token or auth.user?.access_token?
    const userAccessToken = auth.user?.access_token; // Adjust to match your setup
    if (!userAccessToken) {
      setErrorMessage("Cannot change password: no access token is available.");
      return;
    }

    try {
      // Make the POST request to Cognito
      const response = await fetch(COGNITO_API_URL, {
        method: "POST",
        headers: {
          "X-Amz-Target": "AWSCognitoIdentityProviderService.ChangePassword",
          "Content-Type": "application/x-amz-json-1.1",
        },
        body: JSON.stringify({
          PreviousPassword: oldPassword,
          ProposedPassword: newPassword,
          AccessToken: userAccessToken,
        }),
      });

      // Parse response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error changing password");
      }

      setSuccessMessage("Password changed successfully.");
      setShowChangePasswordForm(false);

      // (Optional) If you want to force a fresh login, clear local tokens or call an OIDC signOut
      // await auth.signoutRedirect();

    } catch (err: any) {
      console.error("Error changing password:", err);
      setErrorMessage(err.message || "Error changing password");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

      {/* Example of other user attributes */}
      <EditableInput
        attributeName="Email: "
        attributeValue={auth.user?.profile.email || ""}
      />
      <EditableInput
        attributeName="First Name: "
        attributeValue={auth.user?.profile.name || ""}
      />
      <EditableInput
        attributeName="Last Name: "
        attributeValue={auth.user?.profile.family_name || ""}
      />

      <h3 className="mt-4">Change Your Password</h3>
      {!showChangePasswordForm && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          onClick={handleOpenForm}
        >
          Change Password
        </button>
      )}

      {showChangePasswordForm && (
        <div className="border border-gray-300 p-4 rounded">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block font-semibold">Old Password</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
                <button
                  type="button"
                  className="text-sm underline"
                  onClick={() => setShowOldPassword((prev) => !prev)}
                >
                  {showOldPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block font-semibold">New Password</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
                <button
                  type="button"
                  className="text-sm underline"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
              {/* Live password feedback */}
              <ul className="mt-1 text-sm">
                <li className={hasNumber ? "text-green-600" : "text-red-600"}>
                  Contains at least 1 number
                </li>
                <li className={hasSpecialChar ? "text-green-600" : "text-red-600"}>
                  Contains at least 1 special character
                </li>
                <li className={hasUpperCase ? "text-green-600" : "text-red-600"}>
                  Contains at least 1 uppercase letter
                </li>
                <li className={hasLowerCase ? "text-green-600" : "text-red-600"}>
                  Contains at least 1 lowercase letter
                </li>
                <li className={isLongEnough ? "text-green-600" : "text-red-600"}>
                  Minimum 8 characters
                </li>
              </ul>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block font-semibold">Confirm New Password</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
                <button
                  type="button"
                  className="text-sm underline"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
