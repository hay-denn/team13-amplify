import { useEffect, useState, ChangeEvent, useRef } from "react";
import axios from "axios";
import "./Manageusers.css";
import { ListOfSponsorOrganizations } from "../components/ListOfSponsorOrgs";

export const ManageSponsors = () => {
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [organizationList, setOrganizationList] = useState<any[]>([]);

  const url_organizations =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

  const [newOrgData, setNewOrgData] = useState({
    OrganizationName: "",
    OrganizationDescription: "",
    SearchTerm: "",
    PointDollarRatio: 1,
    AmountOfProducts: 0,
    ProductType: "" as ProductType | "",
    MaxPrice: 0,
    HideDescription: false,
    LogoUrl: "",
    WebsiteUrl: "",
  });

  const fieldRefs = {
    OrganizationName: useRef<HTMLInputElement>(null),
    OrganizationDescription: useRef<HTMLTextAreaElement>(null),
    SearchTerm: useRef<HTMLInputElement>(null),
    PointDollarRatio: useRef<HTMLInputElement>(null),
    AmountOfProducts: useRef<HTMLInputElement>(null),
    ProductType: useRef<HTMLInputElement>(null),
    MaxPrice: useRef<HTMLInputElement>(null),
    LogoUrl: useRef<HTMLInputElement>(null),
    WebsiteUrl: useRef<HTMLInputElement>(null),
  };

  const PRODUCT_TYPES = ["music", "movie", "podcast", "audiobook"] as const;
  type ProductType = (typeof PRODUCT_TYPES)[number];

  useEffect(() => {
    getOrganizations();
  }, []);

  const getOrganizations = async () => {
    try {
      const res = await axios.get(`${url_organizations}/organizations`);
      setOrganizationList(res.data);
    } catch (err) {
      console.error("Error fetching organization info:", err);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewOrgData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const missing: string[] = [];

    Object.entries(newOrgData).forEach(([key, value]) => {
      if (typeof value === "boolean" ? false : value === "" || value === 0) {
        missing.push(key);
      }
    });

    if (missing.length) {
      alert(
        `⚠️  You must edit ALL fields before submitting.\nMissing: ${missing.join(
          ", "
        )}`
      );

      const first = missing[0] as keyof typeof fieldRefs;
      fieldRefs[first].current?.focus();
      return false;
    }
    return true;
  };

  const handleCreateOrganization = async () => {
    if (!validate()) return;

    try {
      await axios.post(`${url_organizations}/organization`, newOrgData);
      getOrganizations();
      resetForm();
      setIsOrgModalOpen(false);
    } catch (err) {
      console.error("Error creating organization:", err);
    }
  };

  const resetForm = () =>
    setNewOrgData({
      OrganizationName: "",
      OrganizationDescription: "",
      SearchTerm: "",
      PointDollarRatio: 1,
      AmountOfProducts: 0,
      ProductType: "",
      MaxPrice: 0,
      HideDescription: false,
      LogoUrl: "",
      WebsiteUrl: "",
    });

  return (
    <div className="container manage-users-container py-3 m-5">
      <div className="sponsor card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">Manage Sponsors</h5>
          <p className="card-text">
            Create, edit, and manage different Sponsor Organizations
          </p>

          <ListOfSponsorOrganizations orgTable={organizationList} />

          <button
            onClick={() => setIsOrgModalOpen(true)}
            className="btn-add-org"
          >
            Create New Organization
          </button>

          {isOrgModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Create New Organization</h2>

                <label>Organization Name</label>
                <input
                  ref={fieldRefs.OrganizationName}
                  name="OrganizationName"
                  value={newOrgData.OrganizationName}
                  onChange={handleChange}
                />

                <label>Description</label>
                <textarea
                  ref={fieldRefs.OrganizationDescription}
                  name="OrganizationDescription"
                  value={newOrgData.OrganizationDescription}
                  onChange={handleChange}
                />

                <label>Search Term(s)</label>
                <input
                  ref={fieldRefs.SearchTerm}
                  name="SearchTerm"
                  value={newOrgData.SearchTerm}
                  onChange={handleChange}
                />

                <label>Product Type</label>
                <select
                  ref={
                    fieldRefs.ProductType as unknown as React.RefObject<HTMLSelectElement>
                  }
                  name="ProductType"
                  className="form-select"
                  value={newOrgData.ProductType}
                  onChange={handleChange}
                >
                  <option value="">Choose one…</option>
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <label>Logo URL</label>
                <input
                  ref={fieldRefs.LogoUrl}
                  name="LogoUrl"
                  value={newOrgData.LogoUrl}
                  onChange={handleChange}
                />

                <label>Website URL</label>
                <input
                  ref={fieldRefs.WebsiteUrl}
                  name="WebsiteUrl"
                  value={newOrgData.WebsiteUrl}
                  onChange={handleChange}
                />

                <label>Point‑Dollar Ratio</label>
                <input
                  ref={fieldRefs.PointDollarRatio}
                  type="number"
                  name="PointDollarRatio"
                  value={newOrgData.PointDollarRatio}
                  onChange={handleChange}
                />

                <label>Max Price</label>
                <input
                  ref={fieldRefs.MaxPrice}
                  type="number"
                  name="MaxPrice"
                  value={newOrgData.MaxPrice}
                  onChange={handleChange}
                />

                <label>Amount of Products</label>
                <input
                  ref={fieldRefs.AmountOfProducts}
                  type="number"
                  name="AmountOfProducts"
                  value={newOrgData.AmountOfProducts}
                  onChange={handleChange}
                />

                <div className="mt-3">
                  <button
                    onClick={handleCreateOrganization}
                    className="btn btn-success me-2"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setIsOrgModalOpen(false)}
                    className="btn btn-danger"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
