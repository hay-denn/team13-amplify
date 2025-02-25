import React, { useState, useEffect } from "react";
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminDeleteUserCommand, AdminUpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
import "./Modal.css";

async function callAPI(url: string, methodType: string, data: object): Promise<void> {
    try {
        const response = await fetch(url, {
            method: methodType,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            const responseData = await response.json();
            alert('Success: ' + JSON.stringify(responseData));
        } else {
            alert('Error: ' + response.status + ' - ' + response.statusText);
        }
    } catch (error) {
        alert('Network Error: ' + error);
    }
}

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
const USER_POOL_ID = "us-east-1_uN566DiPO"; // Replace with actual Cognito User Pool ID

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { firstName: string; familyName: string; email: string; userType: string; newUser: boolean };
}

const userTypes = ["Admin", "Driver", "Sponsor"];

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, initialData }) => {
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState(userTypes[1]); // Default to "Driver"
  const [newUser, setNewUser] = useState(true);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName);
      setFamilyName(initialData.familyName);
      setEmail(initialData.email);
      setUserType(initialData.userType);
      setNewUser(initialData.newUser);
    } else {
      setFirstName("");
      setFamilyName("");
      setEmail("");
      setUserType(userTypes[1]);
      setNewUser(true);
    }
  }, [initialData, isOpen]);

  // Cognito: Create User
  const handleCreateCognitoUser = async () => {
    try {
      const command = new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: "given_name", Value: firstName },
          { Name: "family_name", Value: familyName },
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" },
        ],
        MessageAction: "SUPPRESS", // Suppresses Cognito email invite
      });
      await cognitoClient.send(command);
      alert("Cognito user created successfully!");
    } catch (error) {
      console.error("Cognito Create User Error:", error);
      alert("Failed to create Cognito user.");
    }
  };

  // Cognito: Update User Attributes
  const handleUpdateCognitoUser = async () => {
    try {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: "given_name", Value: firstName },
          { Name: "family_name", Value: familyName },
        ],
      });
      await cognitoClient.send(command);
      alert("Cognito user updated successfully!");
    } catch (error) {
      console.error("Cognito Update User Error:", error);
      alert("Failed to update Cognito user.");
    }
  };

  // Cognito: Delete User
  const handleDeleteCognitoUser = async () => {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
      });
      await cognitoClient.send(command);
      alert("Cognito user deleted successfully!");
    } catch (error) {
      console.error("Cognito Delete User Error:", error);
      alert("Failed to delete Cognito user.");
    }
  };

  const handleDeleteUser = async () => {
    await handleDeleteCognitoUser(); // Delete from Cognito first

    // Then delete from the separate database
    const DRIVER_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
    const SPONSOR_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
    const ADMIN_URL = "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";

    if (!newUser) {
      if (userType === "Driver") {
        const data = { "DriverEmail": email };
        callAPI(`${DRIVER_URL}/driver`, "DELETE", data);
      } else if (userType === "Admin") {
        const data = { "AdminEmail": email };
        callAPI(`${ADMIN_URL}/admin`, "DELETE", data);
      } else if (userType === "Sponsor") {
        const data = { "UserEmail": email };
        callAPI(`${SPONSOR_URL}/sponsor`, "DELETE", data);
      } else {
        alert("Invalid user type!");
      }
    }
    onClose();
  };

  const handleSaveUser = async () => {
    if (newUser) {
      await handleCreateCognitoUser();
    } else {
      await handleUpdateCognitoUser();
    }

    // Keep existing API call logic for your separate database
    const DRIVER_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
    const SPONSOR_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
    const ADMIN_URL = "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";

    if (newUser) {
      if (userType === "Driver") {
        const data = { "DriverEmail": email, "DriverFName": firstName, "DriverLName": familyName };
        callAPI(`${DRIVER_URL}/driver`, "POST", data);
      } else if (userType === "Admin") {
        const data = { "AdminEmail": email, "AdminFName": firstName, "AdminLName": familyName };
        callAPI(`${ADMIN_URL}/admin`, "POST", data);
      } else if (userType === "Sponsor") {
        const data = { "UserEmail": email, "UserFName": firstName, "UserLName": familyName, "UserOrganization": 1 };
        callAPI(`${SPONSOR_URL}/sponsor`, "POST", data);
      }
    } else {
      if (userType === "Driver") {
        const data = { "DriverEmail": email, "DriverFName": firstName, "DriverLName": familyName };
        callAPI(`${DRIVER_URL}/driver`, "PUT", data);
      } else if (userType === "Admin") {
        const data = { "AdminEmail": email, "AdminFName": firstName, "AdminLName": familyName };
        callAPI(`${ADMIN_URL}/admin`, "PUT", data);
      } else if (userType === "Sponsor") {
        const data = { "UserEmail": email, "UserFName": firstName, "UserLName": familyName, "UserOrganization": 1 };
        callAPI(`${SPONSOR_URL}/sponsor`, "PUT", data);
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">✖</button>
        <h2>{newUser ? "Create User" : "Edit User"}</h2>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="modal-input" />
        <input type="text" placeholder="Family Name" value={familyName} onChange={(e) => setFamilyName(e.target.value)} className="modal-input" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="modal-input" readOnly={!newUser} />
        <select value={userType} onChange={(e) => setUserType(e.target.value)} className="modal-select">{userTypes.map((type) => (<option key={type} value={type}>{type}</option>))}</select>
        {!newUser && <button onClick={handleDeleteUser} className="modal-button delete">Delete User</button>}
        <button onClick={handleSaveUser} className="modal-button">{newUser ? "Create User" : "Save Changes"}</button>
      </div>
    </div>
  );
};

export default Modal;
