import React, { useState, useEffect, useContext } from "react";
import { AuthContext, useAuth } from "react-oidc-context";
import EditableInput from "../components/EditableInput";
import { signOutRedirect } from "../main";


const REGION = "us-east-1";
const COGNITO_API_URL = `https://cognito-idp.${REGION}.amazonaws.com/`;

export const AccountSettings: React.FC = () => {
  const auth = useAuth();
  const authContext = useContext(AuthContext);

  // States for user attributes
  const [email, setEmail] = useState(auth.user?.profile.email || "");
  const [firstName, setFirstName] = useState(auth.user?.profile.given_name || "");
  const [lastName, setLastName] = useState(auth.user?.profile.family_name || "");

  // Toggles the change password form
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  // Form fields for password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // For live checks (keep them even if UI doesn't update)
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [isLongEnough, setIsLongEnough] = useState(false);

  // Show/hide password text
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error/success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Additional state for capturing missing requirements
  const [missingRequirements, setMissingRequirements] = useState<string[]>([]);

  // Keep the effect for password checks
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
    setMissingRequirements([]);
  };

  // ==========================
  //  1) UPDATE USER ATTRIBUTES
  // ==========================
  //Calling our database
  const callAPI = async(url: string, methodType: string, data: object): Promise<void> => {
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
        alert('User edit saved!'); // Display success alert with response data
      } else {
        // Handle error if response status is not OK
        alert('Unable to make user edit - Error: ' + response.status + ' - ' + response.statusText); // Display error alert with status and message
      }
    } catch (error) {
      // Catch any network or other errors
      alert('Unable to make user edit - Network Error: ' + error); // Display network error alert
    }
}

  const handleUpdateAttributes = async () => {
    const DRIVER_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
    const SPONSOR_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
    const ADMIN_URL = "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";
    if (auth.isAuthenticated) {
      const cognitoGroups: string[] =
      (auth.user?.profile?.["cognito:groups"] as string[]) || [];
      const userGroup = cognitoGroups[0];
      if (userGroup === "Driver") {
        const data = {
            "DriverEmail": email,
            "DriverFName": firstName,
            "DriverLName": lastName
        };
        callAPI(`${DRIVER_URL}/driver`, "PUT", data);
      } else if (userGroup === "Sponsor") {
        const data = {
            "UserEmail": email,
            "UserFName": firstName,
            "UserLName": lastName,
        };
        callAPI(`${SPONSOR_URL}/sponsor`, "PUT", data);
      } else if (userGroup === "Admin") {
          const data = {
            "AdminEmail": email,
            "AdminFName": firstName,
            "AdminLName": lastName
        };
        callAPI(`${ADMIN_URL}/admin`, "PUT", data);
      } else {
        alert("User has invalid type. Cannot save changes to app database!");
      }
    } else {
      alert("Unable to save edits. User not authenticated!");
    }
    setErrorMessage("");
    setSuccessMessage("");

    const userAccessToken = auth.user?.access_token;
    if (!userAccessToken) {
      setErrorMessage("Cannot update attributes: no access token available.");
      return;
    }

    try {
      const response = await fetch(COGNITO_API_URL, {
        method: "POST",
        headers: {
          "X-Amz-Target": "AWSCognitoIdentityProviderService.UpdateUserAttributes",
          "Content-Type": "application/x-amz-json-1.1",
        },
        body: JSON.stringify({
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "given_name", Value: firstName },
            { Name: "family_name", Value: lastName },
          ],
          AccessToken: userAccessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error updating user attributes");
      }

      
      setSuccessMessage("Attributes updated successfully.");
      alert("✅ Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating user attributes:", error);
      setErrorMessage(error.message || "Error updating user attributes");
    }
  };

  // =====================
  //  2) CHANGE PASSWORD
  // =====================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setMissingRequirements([]);

    // Collect any missing requirements
    const issues: string[] = [];
    if (!hasNumber) issues.push("Must contain at least 1 number");
    if (!hasSpecialChar) issues.push("Must contain at least 1 special character");
    if (!hasUpperCase) issues.push("Must contain at least 1 uppercase letter");
    if (!hasLowerCase) issues.push("Must contain at least 1 lowercase letter");
    if (!isLongEnough) issues.push("Must be at least 8 characters long");

    // If any requirement is missing, display them and stop
    if (issues.length > 0) {
      setMissingRequirements(issues);
      setErrorMessage("New password does not meet the requirements.");
      return;
    }

    // Check if newPassword & confirmNewPassword match
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    // Confirm we have an access token
    const userAccessToken = auth.user?.access_token;
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error changing password");
      }

      setSuccessMessage("Password changed successfully.");
      setShowChangePasswordForm(false);
      window.alert("✅ Password changed successfully.");

      // Signout and redirect after changing pw
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await authContext?.removeUser();
      signOutRedirect();

    } catch (err: any) {
      console.error("Error changing password:", err);
      setErrorMessage(err.message || "Error changing password");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

      <EditableInput
        attributeName="Email: "
        attributeValue={email}
        onChange={(value) => setEmail(value)}
      />
      <EditableInput
        attributeName="First Name: "
        attributeValue={firstName}
        onChange={(value) => setFirstName(value)}
      />
      <EditableInput
        attributeName="Last Name: "
        attributeValue={lastName} 
        onChange={(value) => setLastName(value)}
      />


      {/* Button to update attributes */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleUpdateAttributes}
      >
        Update Profile
      </button>

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

            {/* If there are missing requirements, show them in a list */}
            {missingRequirements.length > 0 && (
              <div>
                <p className="text-red-600 mb-2">Requirements not met:</p>
                <ul className="list-disc ml-5 text-red-600">
                  {missingRequirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Error/Success Messages */}
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
