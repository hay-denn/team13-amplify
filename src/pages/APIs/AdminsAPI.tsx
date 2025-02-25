import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";

const AdminsAPI: React.FC = () => {
  // -- States for /status & /admin_count
  const [status, setStatus] = useState<string | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);

  // -- States for Create Admin (POST)
  const [createEmail, setCreateEmail] = useState("");
  const [createFName, setCreateFName] = useState("");
  const [createLName, setCreateLName] = useState("");
  const [createResult, setCreateResult] = useState<string | null>(null);

  // -- States for Get Admin (GET)
  const [getEmail, setGetEmail] = useState("");
  const [adminData, setAdminData] = useState<any>(null);
  const [getError, setGetError] = useState<string | null>(null);

  // -- States for Update Admin (PUT)
  const [updateEmail, setUpdateEmail] = useState("");
  const [updateFName, setUpdateFName] = useState("");
  const [updateLName, setUpdateLName] = useState("");
  const [updateResult, setUpdateResult] = useState<string | null>(null);

  // -- States for Delete Admin (DELETE)
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteResult, setDeleteResult] = useState<string | null>(null);

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
   * Fetch admin count (GET /admin_count)
   * Example response: { "count": 42 }
   */
  const fetchAdminCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin_count`);
      if (!res.ok) {
        throw new Error(`Admin count fetch failed: ${res.status}`);
      }
      const data = await res.json();
      setAdminCount(data.count);
    } catch (err: any) {
      setAdminCount(null);
    }
  };

  /**
   * Create Admin (POST /admin)
   * Example body:
   * {
   *   "AdminEmail": "jsmiz@gmail.com",
   *   "AdminFName": "John",
   *   "AdminLName": "Smith"
   * }
   */
  const handleCreateAdmin = async () => {
    try {
  
      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminEmail: createEmail,
          AdminFName: createFName,
          AdminLName: createLName,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Create failed: ${response.status}`);
      }
  
      setCreateResult("Admin created successfully!");
      setCreateEmail("");
      setCreateFName("");
      setCreateLName("");
    } catch (error: any) {
      setCreateResult(`Error creating admin: ${error.message}`);
    }
  };
  

  /**
   * Get Admin (GET /admin)
   */
  const handleGetAdmin = async () => {
    try {
      const url = `${API_BASE_URL}/admin?AdminEmail=${encodeURIComponent(getEmail)}`;
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Get failed: ${response.status}`);
      }
      const data = await response.json();
      setAdminData(data);
      setGetError(null);
    } catch (error: any) {
      setAdminData(null);
      setGetError(`Error fetching admin: ${error.message}`);
    }
  };

  /**
   * Update Admin (PUT /admin)
   * Example body:
   * {
   *   "AdminEmail": "jsmiz@gmail.com",
   *   "AdminFName": "Joseph",
   *   "AdminLName": "Smith"
   * }
   */
  const handleUpdateAdmin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminEmail: updateEmail,
          AdminFName: updateFName,
          AdminLName: updateLName,
        }),
      });
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }
      setUpdateResult("Admin updated successfully!");
      setUpdateEmail("");
      setUpdateFName("");
      setUpdateLName("");
    } catch (error: any) {
      setUpdateResult(`Error updating admin: ${error.message}`);
    }
  };

  /**
   * Delete Admin (DELETE /admin)
   * Example body:
   * {
   *   "UserEmail": "jsmiz@gmail.com"
   * }
   */
  const handleDeleteAdmin = async () => {
    try {
      // Construct the URL with the UserEmail as a query parameter
      const url = `${API_BASE_URL}/admin?AdminEmail=${encodeURIComponent(deleteEmail)}`;
  
      // Make the DELETE request with no request body
      const response = await fetch(url, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }
  
      setDeleteResult("Admin deleted successfully!");
      setDeleteEmail("");
  
      // Optionally refresh adminCount
      fetchAdminCount();
    } catch (error: any) {
      setDeleteResult(`Error deleting admin: ${error.message}`);
    }
  };

  // Fetch status & adminCount once on mount
  useEffect(() => {
    fetchStatus();
    fetchAdminCount();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
        <h1 className="text-2xl font-bold text-center">Admins API</h1>

        {/* SECTION: Status & Admin Count */}
        <section>
          
          <div className="space-y-2">
            <p>
              <strong>Status:</strong>{" "}
              {status !== null ? status : "Loading..."}
            </p>
            <p>
              <strong>Admin Count:</strong>{" "}
              {adminCount !== null ? adminCount : "Loading..."}
            </p>
            <button
              onClick={() => {
                fetchStatus();
                fetchAdminCount();
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
          <div>
            <Link to="https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1/admins">See All Admins</Link>
          </div>
        </section>

        {/* SECTION: Create Admin */}
        <section>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Admin Email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="First Name"
              value={createFName}
              onChange={(e) => setCreateFName(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={createLName}
              onChange={(e) => setCreateLName(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <button
              onClick={handleCreateAdmin}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>
            {createResult && <p className="text-sm text-green-600">{createResult}</p>}
          </div>
        </section>

        {/* SECTION: Get Admin */}
        <section>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Admin Email"
              value={getEmail}
              onChange={(e) => setGetEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <button
              onClick={handleGetAdmin}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Get Admin
            </button>
            {adminData && (
              <div className="bg-gray-100 p-3 rounded mt-2 text-left">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(adminData, null, 2)}
                </pre>
              </div>
            )}
            {getError && <p className="text-sm text-red-600">{getError}</p>}
          </div>
        </section>

        {/* SECTION: Update Admin */}
        <section>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Admin Email"
              value={updateEmail}
              onChange={(e) => setUpdateEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="New First Name"
              value={updateFName}
              onChange={(e) => setUpdateFName(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="New Last Name"
              value={updateLName}
              onChange={(e) => setUpdateLName(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <button
              onClick={handleUpdateAdmin}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Update
            </button>
            {updateResult && <p className="text-sm text-green-600">{updateResult}</p>}
          </div>
        </section>

        {/* SECTION: Delete Admin */}
        <section>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="User Email to Delete"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <button
              onClick={handleDeleteAdmin}
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

export default AdminsAPI;
