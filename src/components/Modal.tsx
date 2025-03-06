import React, { useState, useEffect } from "react";
import { Modal as BootstrapModal, Button, Form } from "react-bootstrap";
import "./Modal.css";

const API_BASE_URL = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

// Fetch sponsors from the API
async function getSponsors() {
  try {
    const response = await fetch(`${API_BASE_URL}/sponsors`);
    if (!response.ok) throw new Error("Failed to fetch sponsors");
    return await response.json();
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return [];
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
}

// Adjust this as needed if your sponsor data has different fields
interface Sponsor {
  OrganizationID: number;
  OrganizationName: string;
}

const userTypes = ["Admin", "Driver", "Sponsor"];

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, initialData }) => {
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState(userTypes[1]);
  const [newUser, setNewUser] = useState(true);

  // Sponsors list
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  // Track which sponsor is selected
  const [selectedSponsor, setSelectedSponsor] = useState<number | null>(null);

  // Fetch sponsors once on mount (or whenever modal is opened, if desired)
  useEffect(() => {
    getSponsors().then(setSponsors);
  }, []);

  // Populate form fields with initial data
  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName);
      setFamilyName(initialData.familyName);
      setEmail(initialData.email);
      setUserType(initialData.userType);
      setNewUser(initialData.newUser);

      // If there's an org in initialData, match it to the sponsor list
      if (initialData.org) {
        const matchedSponsor = sponsors.find(
          (s) => s.OrganizationName === initialData.org
        );
        const sponsorId = matchedSponsor ? matchedSponsor.OrganizationID : null;
        if (sponsorId) {
          setSelectedSponsor(sponsorId);
        }
      }
    } else {
      setFirstName("");
      setFamilyName("");
      setEmail("");
      setUserType(userTypes[1]);
      setNewUser(true);
    }
  }, [initialData, isOpen, sponsors]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">
          ✖
        </button>
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
          readOnly={!newUser}
          onChange={(e) => setEmail(e.target.value)}
          className="modal-input"
        />

        <select
          value={selectedSponsor ?? ""}
          onChange={(e) => setSelectedSponsor(Number(e.target.value))}
          className="modal-select"
        >
          <option value="" disabled>
            Select Sponsor
          </option>
          {sponsors.map((s) => (
            <option key={s.OrganizationID} value={s.OrganizationID}>
              {s.OrganizationName}
            </option>
          ))}
        </select>

        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="modal-select"
        >
          {userTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button onClick={onClose} className="modal-button">
          {newUser ? "Create User" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export const SponsorApplyModal = ({
  show,
  handleClose,
  driverEmail,
  fetchApplications,
}: {
  show: boolean;
  handleClose: () => void;
  driverEmail: string;
  fetchApplications: () => void;
}) => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState<number | null>(null);
  const [sponsorEmail, setSponsorEmail] = useState("");

  useEffect(() => {
    if (show) {
      getSponsors().then(setSponsors);
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!driverEmail.trim()) {
      alert("Driver email is required.");
      return;
    }
    if (!selectedSponsorId) {
      alert("Please select a sponsor.");
      return;
    }
    if (!sponsorEmail.trim()) {
      alert("Sponsor email is required.");
      return;
    }

    const applicationData = {
      ApplicationDriver: driverEmail,
      ApplicationOrganization: selectedSponsorId,
      ApplicationSponsorUser: sponsorEmail,
      ApplicationStatus: "Submitted",
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/driversponsorapplication`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(applicationData),
        }
      );

      if (response.ok) {
        alert("Application submitted successfully!");
        setSelectedSponsorId(null);
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
          <Form.Group className="mb-3">
            <Form.Label>Driver Email</Form.Label>
            <Form.Control type="email" value={driverEmail} readOnly />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Select Sponsor</Form.Label>
            <Form.Select
              value={selectedSponsorId ?? ""}
              onChange={(e) => setSelectedSponsorId(Number(e.target.value))}
              required
            >
              <option value="" disabled>
                -- Select a Sponsor --
              </option>
              {sponsors.map((s) => (
                <option key={s.OrganizationID} value={s.OrganizationID}>
                  {s.OrganizationName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

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

          <Button variant="primary" type="submit">
            Submit Application
          </Button>
        </Form>
      </BootstrapModal.Body>
    </BootstrapModal>
  );
};

export default Modal;
