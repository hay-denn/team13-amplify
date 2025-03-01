import React, { useState, useEffect } from "react";
import { Modal as BootstrapModal, Button, Form } from "react-bootstrap";
import "./Modal.css";
import { useAuth } from "react-oidc-context";

const USER_POOL_ID = "us-east-1_uN566DiPO";




async function callAPI(url: string, methodType: string, data: object): Promise<void> {
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
        alert('Success: ' + JSON.stringify(responseData)); // Display success alert with response data
      } else {
        // Handle error if response status is not OK
        alert('Error: ' + response.status + ' - ' + response.statusText); // Display error alert with status and message
      }
    } catch (error) {
      // Catch any network or other errors
      alert('Network Error: ' + error); // Display network error alert
    }
}


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

  // Populate form fields when initialData changes
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
      setUserType(userTypes[1]); // Reset to default
      setNewUser(true);
    }
  }, [initialData, isOpen]);

  async function manageCognitoUser(
    action: "createUser" | "updateUser" | "deleteUser",
    userPoolId: string,
    username: string,
    accessToken: string, // The access token from OIDC authentication
    attributes?: Record<string, string>,
    password?: string
  ): Promise<void> {
    try {
      const response = await fetch("https://7auyafrla5.execute-api.us-east-1.amazonaws.com/dev1/manage-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          userPoolId,
          username,
          accessToken, // Pass the access token to validate
          attributes,
          password,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log("Success:", data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  }

  const handleDeleteUser = async () => {
    const DRIVER_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
    const SPONSOR_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
    const ADMIN_URL = "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";
    if (!newUser) {
        if (userType == "Driver") {
            const data = {
            };
            callAPI(`${DRIVER_URL}/driver?DriverEmail=${encodeURIComponent(email)}`, "DELETE", data);
        } else if (userType == "Admin") {
          const data = {
          };
          callAPI(`${SPONSOR_URL}/driver?DriverEmail=${encodeURIComponent(email)}`, "DELETE", data);
        } else if (userType == "Sponsor") {
          const data = {
          };
          callAPI(`${ADMIN_URL}/driver?DriverEmail=${encodeURIComponent(email)}`, "DELETE", data);
        } else {
          alert("Invalid user type!");
        }
    }
    onClose();
  };

  const handleSaveUser = async () => {
    const DRIVER_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
    const SPONSOR_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
    const ADMIN_URL = "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";

    const auth = useAuth();
    if (!auth.user?.access_token) {
      console.error("user not authenticated!");
    } else {
      if (newUser) {
        manageCognitoUser("createUser", USER_POOL_ID, email, auth.user.access_token, {given_name: firstName, family_name: familyName, email: email}, "Password1!");
        //create new user
        if (userType == "Driver") {
            const data = {
                "DriverEmail": email,
                "DriverFName": firstName,
                "DriverLName": familyName,
            };
            callAPI(`${DRIVER_URL}/driver`, "POST", data);
        } else if (userType == "Admin") {
          const data = {
               "AdminEmail": email,
               "AdminFName": firstName,
               "AdminLName": familyName
          };
        callAPI(`${ADMIN_URL}/admin`, "POST", data);
        } else if (userType == "Sponsor") {
          const data = {
            "UserEmail": email,
            "UserFName": firstName,
            "UserLName": familyName,
            "UserOrganization": 1 //this is temporary until sponsor organizations are implemented
       };
       callAPI(`${SPONSOR_URL}/sponsor`, "POST", data);
        } else {
          alert("Invalid user type!");
        }
    } else {
      //update an exisitng user
      if (userType == "Driver") {
        const data = {
            "DriverEmail": email,
            "DriverFName": firstName,
            "DriverLName": familyName,
        };
        callAPI(`${DRIVER_URL}/driver`, "PUT", data);
      } else if (userType == "Admin") {
        const data = {
             "AdminEmail": email,
             "AdminFName": firstName,
             "AdminLName": familyName
        };
        callAPI(`${ADMIN_URL}/admin`, "PUT", data);
      } else if (userType == "Sponsor") {
        const data = {
          "UserEmail": email,
          "UserFName": firstName,
          "UserLName": familyName,
          "UserOrganization": 1 //this is temporary until sponsor organizations are implemented
        };
        callAPI(`${SPONSOR_URL}/sponsor`, "PUT", data);
      } else {
        alert("Invalid user type!");
      }
    }
    }

    onClose(); // Close the modal
  };

  if (!isOpen) return null;
  //readOnly={!newUser} add this to email to prevent edits when not a new user

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">✖</button>
        <h2>{newUser ? "Create User" : "Edit User"}</h2>

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="modal-input"
        />
        <input
          type="text"
          placeholder="Family Name"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          className="modal-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="modal-input"
        />

        <select value={userType} onChange={(e) => setUserType(e.target.value)} className="modal-select">
          {userTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Show delete button only when editing an existing user */}
        {!newUser && (
          <button onClick={handleDeleteUser} className="modal-button delete">
            Delete User
          </button>
        )}

        <button onClick={handleSaveUser} className="modal-button">
          {newUser ? "Create User" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

// Sponsor Apply Modal added below
export const SponsorApplyModal = ({ show, handleClose, driverEmail, fetchApplications}: { show: boolean; handleClose: () => void; driverEmail: string; fetchApplications: () => void;}) => {
  const [sponsorId, setSponsorId] = useState("");
  const [sponsorEmail, setSponsorEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!driverEmail.trim()) {
          alert("Driver email is required.");
          return;
      }
      if (!sponsorId.trim() || isNaN(Number(sponsorId))) {
          alert("Please enter a valid Sponsor ID.");
          return;
      }
      if (!sponsorEmail.trim()) {
          alert("Sponsor email is required.");
          return;
      }

      const applicationData = {
          ApplicationDriver: driverEmail,
          ApplicationOrganization: Number(sponsorId),
          ApplicationSponsorUser: sponsorEmail,
          ApplicationStatus: "Submitted", 
      };

      try {
          const response = await fetch("https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1/driversponsorapplication", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(applicationData),
          });

          if (response.ok) {
              alert("Application submitted successfully!");
              setSponsorId("");
              setSponsorEmail("");
              handleClose();
              fetchApplications();
          } else {
              alert("Failed to submit application.");
          }
      } catch (error) {
          console.error("Error submitting application:", error);
          alert("An error occurred while submitting the application.");
      }
  };

  return (
      <BootstrapModal show={show} onHide={handleClose} centered backdrop="static">
          <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Apply for a Sponsor</BootstrapModal.Title>
          </BootstrapModal.Header>
          <BootstrapModal.Body>
              <Form onSubmit={handleSubmit}>
                  {/* Driver's Email (Pre-filled) */}
                  <Form.Group className="mb-3">
                      <Form.Label>Driver Email</Form.Label>
                      <Form.Control
                          type="email"
                          value={driverEmail}
                          readOnly
                      />
                  </Form.Group>

                  {/* Sponsor ID (Integer) */}
                  <Form.Group className="mb-3">
                      <Form.Label>Sponsor ID</Form.Label>
                      <Form.Control
                          type="number"
                          placeholder="Enter Sponsor ID"
                          value={sponsorId}
                          onChange={(e) => setSponsorId(e.target.value)}
                          required
                      />
                  </Form.Group>

                  {/* Sponsor User's Email */}
                  <Form.Group className="mb-3">
                      <Form.Label>Sponsor User's Email</Form.Label>
                      <Form.Control
                          type="email"
                          placeholder="Enter Sponsor's Email"
                          value={sponsorEmail}
                          onChange={(e) => setSponsorEmail(e.target.value)}
                          required
                      />
                  </Form.Group>

                  {/* Submit Button */}
                  <Button variant="primary" type="submit">
                      Submit Application
                  </Button>
              </Form>
          </BootstrapModal.Body>
      </BootstrapModal>
  );
};

export default Modal;


