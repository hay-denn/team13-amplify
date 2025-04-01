import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1";
const ORGANIZATIONS_API_URL="https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

const ApplicationsAPI: React.FC = () => {

// -- States for /status & /application_count
const [status, setStatus] = useState<string | null>(null);
const [applicationCount, setApplicationCount] = useState<number | null>(null);

// post
const [createDriver, setCreateDriver] = useState("");
const [createOrg, setCreateOrg] = useState("");
const [createApplicationUser, setCreateApplicationUser] = useState("");
const [createStatus, setCreateStatus] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// read
const [getID, setGetID] = useState("");
const [getResult, setGetResult] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// update
const [updateID, setUpdateID] = useState("");
const [updateDriver, setUpdateDriver] = useState("");
const [updateOrg, setUpdateOrg] = useState("");
const [updateApplicationUser, setUpdateApplicationUser] = useState("");
const [updateStatus, setUpdateStatus] = useState("");
const [updateResult, setUpdateResult] = useState<string | null>(null);

// delete 
const [deleteID, setDeleteID] = useState("");
const [deleteResult, setDeleteResult] = useState<string | null>(null);

// get valid organizations
const [organizations, setOrganizations] = useState<any>(null);

// Fetch Organizations
const fetchOrganizations = async () => {
	try {
		const res = await fetch(`${ORGANIZATIONS_API_URL}/organizations`);
		if (!res.ok) {
			throw new Error(`Organizations fetch failed: ${res.status}`);
		}
		const data = await res.json();
		
		// loop through the data and get the organization ids
		const orgs = data.map((org: any) => org.OrganizationID);
		setOrganizations(orgs);

	} catch (err: any) {
		setOrganizations(null);
	}
};

/**
 * Fetch API status (GET /status)
 * Example response: { "status": "OK" }
 */
const fetchStatus = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/status`);
    if (!res.ok) {
    throw new Error(`Status fetch failed: ${res.status}`);
    }
    const data = await res.json();
    // Adjust if your API returns a different structure
    setStatus(JSON.stringify(data));
  } catch (err: any) {
    setStatus(`Error: ${err.message}`);
  }
  };

  /**
   * Fetch application count (GET /application_count)
   * Example response: { "count": 42 }
   */
  const fetchApplicationCount = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/driversponsorapplications_count`);
    if (!res.ok) {
    throw new Error(`Application count fetch failed: ${res.status}, ${await res.text()}`);
    }
    const data = await res.json();
    setApplicationCount(data.count);
  } catch (err: any) {
    setApplicationCount(null);
  }
  };
  
const handleCreateApplication = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/driversponsorapplication`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ApplicationDriver: createDriver,
        ApplicationOrganization: parseInt(createOrg, 10),
        ApplicationSponsorUser: createApplicationUser,
        ApplicationStatus: createStatus,
        ApplicationDateSubmitted: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Create failed: ${response.status}, ${await response.text()}`);
    }

    setCreateResult("Application created successfully!");
    // Clear inputs
    setCreateDriver("");
    setCreateOrg("");
    setCreateApplicationUser("");
    setCreateStatus("");
  } catch (error: any) {
    setCreateResult(`Error creating application: ${error.message}`);
  }
};

const handleGetApplication = async () => {
  try {
    const url = `${API_BASE_URL}/driversponsorapplication?ApplicationID=${encodeURIComponent(getID)}`;
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Get failed: ${response.status}`);
    }

    const data = await response.json();
    setGetResult(data);
    setGetError(null);
  } catch (error: any) {
    setGetResult(null);
    setGetError(`Error fetching application: ${error.message}`);
  }
};

const handleUpdateApplication = async () => {
  try {
    const requestBody: any = {
      ApplicationID: updateID,
    };

    if (updateDriver.trim() !== "") requestBody.ApplicationDriver = updateDriver;
    if (updateOrg.trim() !== "") requestBody.ApplicationOrganization = parseInt(updateOrg, 10);
    if (updateApplicationUser.trim() !== "") requestBody.ApplicationSponsorUser = updateApplicationUser;
    if (updateStatus.trim() !== "") requestBody.ApplicationStatus = updateStatus;

    const response = await fetch(`${API_BASE_URL}/driversponsorapplication`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}, ${await response.text()}`);
    }

    setUpdateResult("Application updated successfully!");
    setUpdateID("");
    setUpdateDriver("");
    setUpdateOrg("");
    setUpdateApplicationUser("");
    setUpdateStatus("");
  } catch (error: any) {
    // give api error message response    
    setUpdateResult(`Error updating application: ${error.message}`);
  }
};

const handleDeleteApplication = async () => {
  try {
    const url = `${API_BASE_URL}/driversponsorapplication?ApplicationID=${encodeURIComponent(deleteID)}`;
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    setDeleteResult("Application deleted successfully!");
    setDeleteID("");
  } catch (error: any) {
    setDeleteResult(`Error deleting application: ${error.message}, ${await error.response.text()}`);
  }
};

useEffect(() => {
  fetchStatus();
  fetchApplicationCount();
  fetchOrganizations();
}, []);

return (
  <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
    <div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
      <h1 className="text-2xl font-bold text-center">Driver Application Applications API</h1>

          {/* SECTION: Status & Application Count */}
          <section>
            <div className="space-y-2">
            <p>
              <strong>Status:</strong>{" "}
              {status !== null ? status : "Loading..."}
            </p>
            <p>
              <strong>Application Count:</strong>{" "}
              {applicationCount !== null ? applicationCount : "Loading..."}
            </p>
            <button
              onClick={() => {
              fetchStatus();
              fetchApplicationCount();
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Refresh
            </button>
            </div>
            <div>
                  <Link to="https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1/driversponsorapplications">See All Applications</Link>
                </div>
          </section>

      {/* SECTION: CREATE (POST) */}
      <section>
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Driver Email"
            value={createDriver}
            onChange={(e) => setCreateDriver(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <select
            value={createOrg}
            onChange={(e) => setCreateOrg(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          >
            <option value="">Select Organization</option>
            {organizations && organizations.map((org: any) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
          <input
            type="email"
            placeholder="Sponsor Email"
            value={createApplicationUser}
            onChange={(e) => setCreateApplicationUser(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Status"
            value={createStatus}
            onChange={(e) => setCreateStatus(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <button
            onClick={handleCreateApplication}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
          {createResult && <p className="text-sm text-green-600">{createResult}</p>}
        </div>
      </section>

      {/* SECTION: GET (READ) */}
      <section>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="ApplicationID to fetch"
            value={getID}
            onChange={(e) => setGetID(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <button
            onClick={handleGetApplication}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Get
          </button>
          {getResult && (
            <div className="bg-gray-100 p-3 rounded mt-2 text-left">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(getResult, null, 2)}
              </pre>
            </div>
          )}
          {getError && <p className="text-sm text-red-600">{getError}</p>}
        </div>
      </section>

      {/* SECTION: UPDATE (PUT) */}
      <section>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="ApplicationID"
            value={updateID}
            onChange={(e) => setUpdateID(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <input
            type="email"
            placeholder="New Driver Email"
            value={updateDriver}
            onChange={(e) => setUpdateDriver(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <select
            value={updateOrg}
            onChange={(e) => setUpdateOrg(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          >
            <option value="">Select Organization</option>
            {organizations && organizations.map((org: any) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
          <input
            type="email"
            placeholder="New Sponsor Email"
            value={updateApplicationUser}
            onChange={(e) => setUpdateApplicationUser(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="New Status"
            value={updateStatus}
            onChange={(e) => setUpdateStatus(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <button
            onClick={handleUpdateApplication}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Update
          </button>
          {updateResult && <p className="text-sm text-green-600">{updateResult}</p>}
        </div>
      </section>

      {/* SECTION: DELETE */}
      <section>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="ApplicationID to delete"
            value={deleteID}
            onChange={(e) => setDeleteID(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
          <button
            onClick={handleDeleteApplication}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
          {deleteResult && <p className="text-sm text-green-600">{deleteResult}</p>}
        </div>
      </section>
    </div>
  </div>
);
};

export default ApplicationsAPI;
