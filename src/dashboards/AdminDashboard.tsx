import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import { updatePassword } from "@aws-amplify/auth";

const AdminDashboard = () => {
  const auth = useAuth();
  const cognitoGroups: string[] = auth.user?.profile?.["cognito:groups"] as string[] || [];

  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

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
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin!</p>

      <pre>Hello: {auth.user?.profile.email}</pre>
      <pre>Group: {cognitoGroups[0]}</pre>

      <button onClick={() => auth.removeUser()}>Sign Out</button>
      <button onClick={() => setShowForm(!showForm)}>Change Password</button>

      {showForm && (
        <form onSubmit={handleChangePassword}>
          <div>
            <label>Current Password:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Update Password</button>
          {message && <p>{message}</p>}
        </form>
      )}
    </div>
  );
};

export default AdminDashboard;