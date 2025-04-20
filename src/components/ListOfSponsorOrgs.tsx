import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";

interface Organization {
  OrganizationID: string;
  OrganizationName: string;
  OrganizationDescription?: string;
  PointDollarRatio?: string;
  AmountOfProducts?: number;
  ProductType?: string;
  MaxPrice?: string;
  SearchTerm?: string;
  HideDescription?: number;
  LogoUrl?: string;
  WebsiteUrl?: string;
  HideWebsiteUrl?: number;
  DailyPointChange?: string;
}

interface Props {
  orgTable: Organization[];
}

export const ListOfSponsorOrganizations = ({ orgTable }: Props) => {
  const sponsorOrgUrl =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";
  //Variable that stores a copy of the current table
  const [orglist, setOrgs] = useState<Organization[]>(orgTable);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  // const [newStatus, setNewStatus] = useState("");

  const handleShowModal = (org: Organization) => {
    setSelectedOrg(org);
    setEditOrgData({
      OrganizationID: org.OrganizationID,
      OrganizationName: org.OrganizationName,
      OrganizationDescription: org.OrganizationDescription || "",
      PointDollarRatio: org.PointDollarRatio || "",
      AmountOfProducts: org.AmountOfProducts || 0,
      ProductType: org.ProductType || "",
      MaxPrice: org.MaxPrice || "",
      SearchTerm: org.SearchTerm || "",
      HideDescription: org.HideDescription || 0,
      LogoUrl: org.LogoUrl || "",
      WebsiteUrl: org.WebsiteUrl || "",
      HideWebsiteUrl: org.HideWebsiteUrl || 0,
      DailyPointChange: org.DailyPointChange || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrg(null);
    // setNewStatus("");
  };

  // const handleStatusChange = (event: any) => {
  //   setNewStatus(event.target.value);
  // };

  const [editOrgData, setEditOrgData] = useState<Organization>({
    OrganizationID: "",
    OrganizationName: "",
    OrganizationDescription: "",
    PointDollarRatio: "",
    AmountOfProducts: 0,
    ProductType: "",
    MaxPrice: "",
    SearchTerm: "",
    HideDescription: 0,
    LogoUrl: "",
    WebsiteUrl: "",
    HideWebsiteUrl: 0,
    DailyPointChange: "",
  });

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setEditOrgData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? 1
            : 0
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSaveStatus = async () => {
    if (!selectedOrg) return;

    try {
      const response = await fetch(`${sponsorOrgUrl}/organization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editOrgData),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);

      setOrgs((prev) =>
        prev.map((org) =>
          org.OrganizationID === editOrgData.OrganizationID
            ? { ...org, ...editOrgData }
            : org
        )
      );

      handleCloseModal();
    } catch (err) {
      console.error("Failed to update organization:", err);
    }
  };

  const handleDeleteOrg = async (orgID: string) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;
    try {
      const response = await fetch(
        `https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organization?OrganizationID=${orgID}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error(`Status ${response.status}`);
      setOrgs((prev) => prev.filter((o) => o.OrganizationID !== orgID));
    } catch (err) {
      console.error("Failed to delete organization:", err);
    }
  };
  useEffect(() => {
    setOrgs(orgTable);
  }, [orgTable]);

  return (
    <div>
      <table className="table table-striped table-bordered table-hover align-middle">
        <thead className="table-secondary">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Org ID</th>
            <th scope="col">Org Name</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orglist.map((org, index) => (
            <tr key={`org-${index}`}>
              <th scope="row">{index + 1}</th>
              <td>{org.OrganizationID}</td>
              <td>{org.OrganizationName}</td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handleShowModal(org)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger  ms-2"
                  onClick={() => handleDeleteOrg(org.OrganizationID)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Organization Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrg && (
            <form>
              <div className="mb-2">
                <label className="form-label">Organization Name</label>
                <input
                  type="text"
                  name="OrganizationName"
                  className="form-control"
                  value={editOrgData.OrganizationName}
                  onChange={handleEditChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Description</label>
                <textarea
                  name="OrganizationDescription"
                  className="form-control"
                  value={editOrgData.OrganizationDescription}
                  onChange={handleEditChange}
                />
              </div>

              <div className="row mb-2">
                <div className="col">
                  <label className="form-label">Point‑Dollar Ratio</label>
                  <input
                    type="text"
                    name="PointDollarRatio"
                    className="form-control"
                    value={editOrgData.PointDollarRatio}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="col">
                  <label className="form-label">Amount Of Products</label>
                  <input
                    type="number"
                    name="AmountOfProducts"
                    className="form-control"
                    value={editOrgData.AmountOfProducts}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label">Product Type</label>
                <input
                  type="text"
                  name="ProductType"
                  className="form-control"
                  value={editOrgData.ProductType}
                  onChange={handleEditChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Max Price</label>
                <input
                  type="text"
                  name="MaxPrice"
                  className="form-control"
                  value={editOrgData.MaxPrice}
                  onChange={handleEditChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Logo URL</label>
                <input
                  type="text"
                  name="LogoUrl"
                  className="form-control"
                  value={editOrgData.LogoUrl}
                  onChange={handleEditChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Website URL</label>
                <input
                  type="text"
                  name="WebsiteUrl"
                  className="form-control"
                  value={editOrgData.WebsiteUrl}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  name="HideDescription"
                  className="form-check-input"
                  checked={!!editOrgData.HideDescription}
                  onChange={handleEditChange}
                />
                <label className="form-check-label">Hide Description</label>
              </div>

              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  name="HideWebsiteUrl"
                  className="form-check-input"
                  checked={!!editOrgData.HideWebsiteUrl}
                  onChange={handleEditChange}
                />
                <label className="form-check-label">Hide Website URL</label>
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveStatus}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={modalData}
      /> */}
    </div>
  );
};
