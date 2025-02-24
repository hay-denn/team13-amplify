import React, { useState, useEffect } from "react";
import "./Modal.css";

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

  const handleSaveUser = () => {
    const API_BASE_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";

    if (newUser) {
        //create the new user
        if (userType == "Driver") {
            const data = {
                "DriverEmail": email,
                "DriverFName": firstName,
                "DriverLName": familyName,
            };
            callAPI(`${API_BASE_URL}/driver`, "POST", data);
        } else if (userType == "Admin") {
          const data = {
               "AdminEmail": email,
               "AdminFName": firstName,
               "AdminLName": familyName
          };
        callAPI(`${API_BASE_URL}/admin`, "POST", data);
        } else if (userType == "Sponsor") {
          const data = {
            "SponsorEmail": email,
            "SponsorFName": firstName,
            "SponsorLName": familyName
       };
       callAPI(`${API_BASE_URL}/sponsor`, "POST", data);
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
          callAPI(`${API_BASE_URL}/driver`, "UPDATE", data);
      } else if (userType == "Admin") {
        const data = {
             "AdminEmail": email,
             "AdminFName": firstName,
             "AdminLName": familyName
        };
      callAPI(`${API_BASE_URL}/admin`, "UPDATE", data);
      } else if (userType == "Sponsor") {
        const data = {
          "SponsorEmail": email,
          "SponsorFName": firstName,
          "SponsorLName": familyName
     };
     callAPI(`${API_BASE_URL}/sponsor`, "UPDATE", data);
      } else {
        alert("Invalid user type!");
      }
    }
    onClose(); // Close the modal
  };

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

        <button onClick={handleSaveUser} className="modal-button">
          {newUser ? "Create User" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Modal;


