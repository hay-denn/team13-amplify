

import { useState } from "react";
import "./HomeStyles.css";
import { TopBox } from "./TopBox/TopBox";
import "bootstrap/dist/css/bootstrap.min.css";
import CarouselTemplate from "./ImageCycles";
import { Modal, Button, Form } from "react-bootstrap";

interface Props {
  userFName?: string;
  companyName?: string;
}

const SponsorApplyModal = ({
  show,
  handleClose,
  userFName,
}: {
  show: boolean;
  handleClose: () => void;
  userFName: string;
}) => {
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
    <Modal show={show} onHide={handleClose} centered backdrop="static">
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

export const Home = ({ userFName = "User", companyName }: Props) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <h1 className="welcome">Good Afternoon, {userFName}!</h1>

      {companyName ? (
        <div className="home">
          <div className="box box1">
            <TopBox />
          </div>
          <div className="box box2">
            <b>Current Point Balance</b>
          </div>
          <div className="box box3">Placeholder Item</div>
          <div className="box box4">Placeholder Item</div>
          <div className="box box5">My Point Progress Chart:</div>
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-5 left-col">
              <h2>Next Steps:</h2>
              <p>
                Now that you have completed registration as a driver, it is time for you to start applying to a sponsor of your choice.
              </p>
              <button
                className="btn btn-primary mb-3"
                onClick={() => {
                  console.log("Apply Now clicked!");
                  setShowModal(true);
                }}
              >
                Apply Now!
              </button>
            </div>
            <div className="col-md-7 right-col">
              <CarouselTemplate />
            </div>
          </div>
        </div>
      )}

      {/* Modal included in the same file */}
      <SponsorApplyModal show={showModal} handleClose={() => setShowModal(false)} userFName={userFName} />
    </>
  );
};