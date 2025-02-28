import React, { useState, useEffect } from "react";
import "./Modal.css";
import { Modal as BootstrapModal, Button, Form } from "react-bootstrap";

async function callAPI(url: string, methodType: string, data: object): Promise<void> {
    try {
        const response = await fetch(url, {
            method: methodType,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            const responseData = await response.json();
            alert("Success: " + JSON.stringify(responseData));
        } else {
            alert("Error: " + response.status + " - " + response.statusText);
        }
    } catch (error) {
        alert("Network Error: " + error);
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

    const handleDeleteUser = () => {
        const DRIVER_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
        const SPONSOR_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
        const ADMIN_URL = "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";
        if (!newUser) {
            if (userType === "Driver") {
                const data = {};
                callAPI(`${DRIVER_URL}/driver?DriverEmail=${encodeURIComponent(email)}`, "DELETE", data);
            } else if (userType === "Admin") {
                const data = {};
                callAPI(`${SPONSOR_URL}/driver?DriverEmail=${encodeURIComponent(email)}`, "DELETE", data);
            } else if (userType === "Sponsor") {
                const data = {};
                callAPI(`${ADMIN_URL}/driver?DriverEmail=${encodeURIComponent(email)}`, "DELETE", data);
            } else {
                alert("Invalid user type!");
            }
        }
        onClose();
    };

    const handleSaveUser = () => {
        const DRIVER_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
        const SPONSOR_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
        const ADMIN_URL = "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";

        if (newUser) {
            if (userType === "Driver") {
                const data = {
                    "DriverEmail": email,
                    "DriverFName": firstName,
                    "DriverLName": familyName,
                };
                callAPI(`${DRIVER_URL}/driver`, "POST", data);
            } else if (userType === "Admin") {
                const data = {
                    "AdminEmail": email,
                    "AdminFName": firstName,
                    "AdminLName": familyName
                };
                callAPI(`${ADMIN_URL}/admin`, "POST", data);
            } else if (userType === "Sponsor") {
                const data = {
                    "UserEmail": email,
                    "UserFName": firstName,
                    "UserLName": familyName,
                    "UserOrganization": 1 // Temporary until sponsor organizations are implemented
                };
                callAPI(`${SPONSOR_URL}/sponsor`, "POST", data);
            } else {
                alert("Invalid user type!");
            }
        } else {
            if (userType === "Driver") {
                const data = {
                    "DriverEmail": email,
                    "DriverFName": firstName,
                    "DriverLName": familyName,
                };
                callAPI(`${DRIVER_URL}/driver`, "PUT", data);
            } else if (userType === "Admin") {
                const data = {
                    "AdminEmail": email,
                    "AdminFName": firstName,
                    "AdminLName": familyName
                };
                callAPI(`${ADMIN_URL}/admin`, "PUT", data);
            } else if (userType === "Sponsor") {
                const data = {
                    "UserEmail": email,
                    "UserFName": firstName,
                    "UserLName": familyName,
                    "UserOrganization": 1
                };
                callAPI(`${SPONSOR_URL}/sponsor`, "PUT", data);
            } else {
                alert("Invalid user type!");
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
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="modal-input" />

                <select value={userType} onChange={(e) => setUserType(e.target.value)} className="modal-select">
                    {userTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <button onClick={handleSaveUser} className="modal-button">{newUser ? "Create User" : "Save Changes"}</button>
            </div>
        </div>
    );
};

// Sponsor Apply Modal added below
export const SponsorApplyModal = ({ show, handleClose, userFName }: { show: boolean; handleClose: () => void; userFName: string }) => {
    const [organization, setOrganization] = useState("");
    const [sponsorUser, setSponsorUser] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const applicationData = {
            ApplicationDriver: userFName,
            ApplicationOrganization: organization,
            ApplicationSponsorUser: sponsorUser || null,
            ApplicationStatus: "Pending",
        };

        try {
            const response = await fetch("https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1/driversponsorapplication", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(applicationData),
            });

            if (response.ok) {
                alert("Application submitted successfully!");
                handleClose();
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
                    <Button variant="primary" type="submit">Submit Application</Button>
                </Form>
            </BootstrapModal.Body>
        </BootstrapModal>
    );
};

export default Modal;