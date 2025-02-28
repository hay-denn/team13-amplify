import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface ApplySponsorModalProps {
  show: boolean;
  handleClose: () => void;
  userFName: string;
}

const ApplySponsorModal = ({ show, handleClose, userFName }: ApplySponsorModalProps) => {
  const [organization, setOrganization] = useState("");
  const [sponsorUser, setSponsorUser] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const applicationData = {
      ApplicationDriver: userFName,
      ApplicationOrganization: organization,
      ApplicationSponsorUser: sponsorUser,
      ApplicationStatus: "Pending",
    };

    try {
      const response = await fetch("https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1/driversponsorapplication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Apply for a Sponsor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Organization</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter organization ID"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sponsor User (Optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter sponsor username"
              value={sponsorUser}
              onChange={(e) => setSponsorUser(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit Application
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ApplySponsorModal;