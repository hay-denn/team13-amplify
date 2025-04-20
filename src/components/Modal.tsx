import React, { useState, useEffect } from "react";
import { Modal as BootstrapModal, Button, Form } from "react-bootstrap";
import "./Modal.css";
import { useAuth } from "react-oidc-context";

const USER_POOL_ID = "us-east-1_uN566DiPO";
const API_SPONSOR_ORG_URL = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";
const API_DRIVER_SPONSOR_APP_URL = "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1"

const DRIVER_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
const SPONSOR_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
const ADMIN_URL = "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";

const DRIVER_SPONSOR_URL = "https://obf2ta0gw9.execute-api.us-east-1.amazonaws.com/dev1";


async function getDriverSponsors(driverEmail: string) {
  try {
    const response = await fetch(`${DRIVER_SPONSOR_URL}/driverssponsors?DriversEmail=${encodeURIComponent(driverEmail)}`);
    if (!response.ok) throw new Error("Failed to fetch organizations");
    return await response.json();
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return [];
  }
}

async function getOrgs() {
  try {
    const response = await fetch(`${API_SPONSOR_ORG_URL}/organizations`);
    if (!response.ok) throw new Error("Failed to fetch organizations");
    return await response.json();
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return [];
  }
}
    

async function manageCognitoUser (
  action: "createUser" | "updateUser" | "deleteUser" | "resetPassword",
  userPoolId: string,
  username: string,
  accessToken: string, // The access token from OIDC authentication
  attributes?: Record<string, string>,
  password?: string,
  userGroup?: string
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
        userGroup
      }),
    });

    const data = await response.json();
    if (response.ok) {
      if (action === "resetPassword") {
        alert("Password reset email sent to user!");
      }
      console.log("Success:", data.message);
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error(`Error performing ${action}:`, error);
  }
};


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
        console.log('Success: ' + JSON.stringify(responseData))
        alert('User edit successful!'); // Display success alert with response data
      } else {
        // Handle error if response status is not OK
        const responseData: Record<string, any> = await response.json();
        let string = "";
        for (const key in responseData) {
          string += `${key}: ${responseData[key]}\n`;
        }
        alert('Unable to make user edit - Error: ' + response.status + ' - ' + data); // Display error alert with status and message
      }
    } catch (error) {
      // Catch any network or other errors
      alert('Unable to make user edit - Network Error: ' + error); // Display network error alert
    }
}


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { 
    firstName: string; 
    familyName: string; 
    email: string; 
    userType: string; 
    newUser: boolean; 
    org?: string;
    };
  emailList?: string[];
}

const userTypes = ["Admin", "Driver", "Sponsor"];

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, initialData, emailList }) => {

  //Used to store user data attributes for user we're editing/creating
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState(userTypes[1]); // Default to "Driver"
  const [newUser, setNewUser] = useState(true);
  const [tempPassword, setTempPassword] = useState("");

  //Auth component to get access_token, verify authentication of user, etc.
  const auth = useAuth();

  //Used to restrict admins from deleting other admins (demoing purposes)
  const [demoMode] = useState<boolean>(true);

    //Selecting orgs (to be removed)
    const [orgs, setOrgs] = useState<{ OrganizationID: number; OrganizationName: string }[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<number | null>(null);

  useEffect(() => {
    getOrgs().then(setOrgs);
  }, []);


  // Populate form fields when initialData changes
  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName);
      setFamilyName(initialData.familyName);
      setEmail(initialData.email);
      setUserType(initialData.userType);
      setNewUser(initialData.newUser);
      setTempPassword("Temppass123@"); //default temp password
      if (initialData.org) {
        //The org is passed in as the name. This code gets the orgID from the passed in name and sets the selected org to that ID.
        //That way we can make edits to the sponsor org of a driver or sponsor
        const matchedOrg = orgs.find(org => org.OrganizationName === initialData.org);
        const orgId = matchedOrg ? matchedOrg.OrganizationID : null; // Returns the ID if found, otherwise null
        if (orgId) {
          setSelectedOrg(orgId);

        }
      }
    } else {
      setFirstName("");
      setFamilyName("");
      setEmail("");
      setUserType(userTypes[1]); // Reset to default
      setNewUser(true);
    }
  }, [initialData, isOpen, orgs]);

  const handleDeleteUser = async () => {
    if (!newUser) {    
      if (!auth.user?.access_token) {
        alert("Unable to make user edit. You are not signed in.");
      } else {
        if (!demoMode || userType != "Admin") {
          await manageCognitoUser("deleteUser", USER_POOL_ID, email, auth.user.access_token, {given_name: firstName, family_name: familyName, email: email}, "", userType);
        } else {
          alert("Admin account deletion is not allowed from Manage Users page.");
        }
        if (userType == "Driver") {
            const data = {
            };
            callAPI(`${DRIVER_URL}/driver?DriverEmail=${encodeURIComponent(email)}`, "DELETE", data);
        } else if (userType == "Admin") {
          const data = {
          };
          if (!demoMode) {
            callAPI(`${ADMIN_URL}/admin?AdminEmail=${encodeURIComponent(email)}`, "DELETE", data);
          }
        } else if (userType == "Sponsor") {
          const data = {
          };
          callAPI(`${SPONSOR_URL}/sponsor?UserEmail=${encodeURIComponent(email)}`, "DELETE", data);
        } else {
          alert("Invalid user type!");
        }
      }
    }
    onClose();
  };

  const handleSaveUser = async () => {

    if (!auth.user?.access_token) {
      alert("Unable to make user edit. You are not signed in.");
    } else {
      if (newUser) {
      await manageCognitoUser("createUser", USER_POOL_ID, email, auth.user.access_token, {given_name: firstName, family_name: familyName, email: email, email_verified: "true"}, tempPassword, userType);
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
            "UserOrganization": selectedOrg
       };
       callAPI(`${SPONSOR_URL}/sponsor`, "POST", data);
        } else {
          alert("Invalid user type!");
        }
    } else {
      //update an exisitng user
      await manageCognitoUser("updateUser", USER_POOL_ID, email, auth.user.access_token, {given_name: firstName, family_name: familyName, email: email}, "", userType);
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
          "UserOrganization": selectedOrg //this is temporary until sponsor organizations are implemented
        };
        callAPI(`${SPONSOR_URL}/sponsor`, "PUT", data);
      } else {
        alert("Invalid user type!");
      }
    }
    }

    onClose(); // Close the modal
  };

  const handlePasswordReset = async () => {
    if (!auth.user?.access_token) {
      alert("Unable to reset password. You are not signed in.");
      return;
    }
  
    try {
      // Reset the user's password
      await manageCognitoUser(
        "resetPassword",
        USER_POOL_ID,
        email,
        auth.user.access_token,
        {},
        "",
        userType
      );
  
      // Log the password change
      console.log("Logging password change...");
      console.log("Request Body:", {
        user: email,
        changeDate: new Date().toISOString(),
        changeType: "admin reset",
      });
  
      try {
        const logResponse = await fetch(
          "https://8y9n1ik5pc.execute-api.us-east-1.amazonaws.com/dev1/passwordChanges",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: email,
              changeDate: new Date().toISOString(),
              changeType: "admin reset",
            }),
          }
        );
  
        if (!logResponse.ok) {
          const errorText = await logResponse.text();
          console.error("Failed to log password change:", errorText);
        } else {
          console.log("Password change logged successfully.");
        }
      } catch (err) {
        console.error("Error logging password change:", err);
      }
  
      alert("Password reset successfully!");
    } catch (err) {
      console.error("Error resetting password:", err);
      alert("Failed to reset password.");
    }
  };


//check if email matches an existing user
const checkEmail = (inputEmail: string, inputElement: HTMLInputElement) => {
  if (emailList?.includes(inputEmail) && inputEmail !== initialData?.email) {
    console.log('match found for ' + inputEmail);
    inputElement.setCustomValidity("This email matches an existing user.");
    inputElement.reportValidity();
  } else {
      inputElement.setCustomValidity("");
  }
};

//Handle updates to the email input element
const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    checkEmail(inputEmail, e.target);
}

//Handle temp password changes
const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const inputPassword = e.target.value;
  setTempPassword(inputPassword);
  checkPassword(inputPassword, e.target);
}

//check password validation
const checkPassword = (inputTempPassword: string, inputElement: HTMLInputElement) => {
  let validationMsg = "";
  if (!(/\d/.test(inputTempPassword))) {
    validationMsg += "Missing a number\n";
  }
  if (!(/[!@#$%^&*(),.?":{}|<>]/.test(inputTempPassword))) {
    validationMsg += "Missing a special character\n";
  }
  if (!(/[A-Z]/.test(inputTempPassword))) {
    validationMsg += "Missing uppercase letter\n";
  }
  if (!(/[a-z]/.test(inputTempPassword))) {
    validationMsg += "Missing lowercase letter\n";
  }
  if (inputTempPassword.length < 8) {
    validationMsg += "Password must be 8 characters or longer\n";
  }
  inputElement.setCustomValidity(validationMsg);
  inputElement.reportValidity();
}

  if (!isOpen) return null;

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
          readOnly={!newUser} //i don't think it's possible to change the email in our db, so for now it's not editable for existing accounts
          onChange={handleEmailChange}
          onFocus={handleEmailChange}
          className="modal-input"
        />
        
        {/* Don't show temp password field for existing user */}
        {newUser && (
          <input
          type="text"
          placeholder="Temporary Password"
          value={tempPassword}
          onChange={handlePasswordChange}
          className="modal-input"
        />)}

        { userType === "Sponsor" && (
            <select value={selectedOrg ?? ""} onChange={(e) => setSelectedOrg(Number(e.target.value))} className="modal-select">
            <option value="" disabled>Select Organization</option>
            {orgs.map((org) => (
              <option key={org.OrganizationID} value={org.OrganizationID}>
                {org.OrganizationName}
              </option>
            ))}
          </select>
        )}


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
      
        {!newUser && (
          <button onClick={handlePasswordReset} className="modal-button delete">
            Reset User's Password
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
export const SponsorApplyModal = ({
  show, 
  handleClose, 
  driverEmail, 
  fetchApplications,
  organizationIDInput=-1}: { 
    show: boolean; 
    handleClose: () => void; 
    driverEmail: string;
    fetchApplications: () => void;
    organizationIDInput?: number;
  }) => {

  const auth = useAuth();

  const currentDriverEmail = driverEmail || auth.user?.profile?.email || "";
  
  const [organizations, setOrganizations] = useState<{ OrganizationID: number; OrganizationName: string }[]>([]);
  const [selectedOrg, setSelectedOrgID] = useState<number | null>(null);
  const [reason, setReason] = useState<string>("");
  
  useEffect(() => {
    if (show) {
      fetch(`${API_SPONSOR_ORG_URL}/organizations`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setOrganizations(data);
          } else {
            console.error("Unexpected response format:", data);
          }
        })
        .catch((error) => console.error("Error fetching organizations:", error));
    }
  }, [show]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!currentDriverEmail) {
      alert("Driver email is required.");
      return;
    }
    if (!selectedOrg && organizationIDInput === -1) {
      alert("Please select a sponsor.");
      return;
    }

    if (!reason.trim()) {
      alert("Reason for application is required.");
      return;
    }
    const selectedOrgID = organizationIDInput !== -1 ? organizationIDInput : selectedOrg;

    const applicationData = {
      ApplicationDriver: currentDriverEmail,
      ApplicationOrganization: selectedOrgID,
      ApplicationStatus: "Submitted",
      ApplicationReason: reason,
    };

    try {
      const response = await fetch(`${API_DRIVER_SPONSOR_APP_URL}/driversponsorapplication`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        setSelectedOrgID(null);
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
                          value={currentDriverEmail}
                          readOnly
                      />
                  </Form.Group>

                  {/* Organization */}
                  <Form.Group className="mb-3">
                    <Form.Label>Select Sponsor</Form.Label>
                    <Form.Select
                      value={organizationIDInput !== -1 ? organizationIDInput : selectedOrg ?? ""}
                      onChange={(e) => setSelectedOrgID(Number(e.target.value))}
                      required
                      disabled={organizationIDInput !== -1} // Make dropdown read-only if organizationIDInput is provided
                    >
                      <option value="" disabled>
                      -- Select a Sponsor --
                      </option>
                      {organizations.map((sponsor) => (
                      <option
                        key={sponsor.OrganizationID}
                        value={sponsor.OrganizationID}
                      >
                        {sponsor.OrganizationName}
                      </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Add application reason */}
                  <Form.Group className="mb-3">
                      <Form.Label>Reason for Application</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows={3}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
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



//Modal to view the organizations for a Driver
interface ViewOrgProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const ViewOrgModal: React.FC<ViewOrgProps> = ({ isOpen, onClose, email }) => {
  const [orgs, setOrgs] = useState<{ OrganizationID: number; OrganizationName: string }[]>([]);
  const [driverOrgs, setDriverOrgs] = useState<
    { DriversEmail: string; DriversSponsorID: number; DriversPoints: number }[]
  >([]);
  const [selectedOrg, setSelectedOrg] = useState<number | "">("");

  const auth = useAuth();

  useEffect(() => {
    // Get the full list of organizations
    getOrgs().then(setOrgs);
    // Retrieve driver organizations and filter:
    // 1. Keep only organizations where DriversEmail matches the provided email.
    // 2. Remove duplicates (based on DriversSponsorID).
    getDriverSponsors(email)
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter((item) => item.DriversEmail === email);
          const unique = Array.from(
            new Map(filtered.map((org) => [org.DriversSponsorID, org])).values()
          );
          setDriverOrgs(unique);
        }
      })
      .catch((error) => console.error("Error processing driver organizations:", error));
  }, [email]);

  const handleSaveChanges = async () => {
    if (!auth.user?.access_token) {
      alert("Cannot make change. Not authorized!");
    } else {
      const data = {
        DriversEmail: email,
        DriversSponsorID: selectedOrg.toString(),
      };
      callAPI(`${DRIVER_SPONSOR_URL}/driverssponsor`, "POST", data);
      onClose();
    }
  };

  const handleRemoveOrganization = async (organizationID: number) => {
    if (!auth.user?.access_token) {
      alert("Cannot make change. Not authorized!");
    } else {
      const data = {};
      callAPI(
        `${DRIVER_SPONSOR_URL}/driverssponsor?DriversEmail=${encodeURIComponent(email)}&DriversSponsorID=${organizationID.toString()}`,
        "DELETE",
        data
      );
      onClose();
    }
  };

  if (!isOpen) return null;

  // Create a Set of organization IDs the driver belongs to
  const driverOrgIDs = new Set(driverOrgs.map((org) => org.DriversSponsorID));

  // Calculate available organizations by filtering out those the driver already belongs to
  const availableOrgs = orgs.filter((org) => !driverOrgIDs.has(org.OrganizationID));

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">
          ✖
        </button>
        <h2>Driver Sponsor Organizations</h2>
        <ul className="modal-list">
          {driverOrgs.map((driverOrg) => {
            const org = orgs.find((o) => o.OrganizationID === driverOrg.DriversSponsorID);
            return org ? (
              <li key={org.OrganizationID}>
                {org.OrganizationName}{" "}
                <button
                  onClick={() => handleRemoveOrganization(org.OrganizationID)}
                  className="modal-remove-button"
                >
                  Remove
                </button>
              </li>
            ) : null;
          })}
        </ul>

        {/* Dropdown to select an organization not currently associated with the driver */}
        <select
          className="modal-select"
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(Number(e.target.value) || "")}
        >
          <option value="">Select an organization</option>
          {availableOrgs.map((org) => (
            <option key={org.OrganizationID} value={org.OrganizationID}>
              {org.OrganizationName}
            </option>
          ))}
        </select>

        <button onClick={handleSaveChanges} className="modal-button">
          Add
        </button>
      </div>
    </div>
  );
};

export default Modal;