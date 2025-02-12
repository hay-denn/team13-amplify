import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import { updatePassword } from "@aws-amplify/auth";
import "./Dashboards.css";

const AdminDashboard = () => {
  const auth = useAuth();
  const cognitoGroups: string[] = auth.user?.profile?.["cognito:groups"] as string[] || [];

  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updatePassword({ oldPassword: currentPassword, newPassword });
      setMessage("Password changed successfully!");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin!</p>

      <pre>Hello: {auth.user?.profile.email}</pre>
      <pre>Group: {cognitoGroups[0]}</pre>

      <button className="dashboard-button danger-button" onClick={() => auth.removeUser()}>
        Sign Out
      </button>
      <button className="dashboard-button primary-button" onClick={() => setShowForm(!showForm)}>
        Change Password
      </button>

      {showForm && (
        <form onSubmit={handleChangePassword} className="dashboard-form">
          <div className="form-group">
            <label>Current Password:</label>
            <div className="password-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>New Password:</label>
            <div className="password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="dashboard-button success-button">
              Update Password
            </button>
            <button type="button" className="dashboard-button cancel-button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
          {message && <p className="message">{message}</p>}
        </form>
      )}
    </div>
  );
};

export default AdminDashboard;