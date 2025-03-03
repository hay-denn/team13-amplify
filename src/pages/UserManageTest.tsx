import React, { useState } from "react";
import Modal from "../components/Modal";

const UserManageTest: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{ firstName: string; familyName: string; email: string; userType: string; newUser: boolean } | undefined>();

  // Function to open modal for creating a new user
  const handleCreateUser = () => {
    setModalData(undefined); // No pre-filled data
    setIsModalOpen(true);
  };

  // Function to open modal for editing a user
  const handleEditUser = (pfirstName: string, pfamilyName: string, pemail: string, puserType: string) => {
    setModalData({
      firstName: pfirstName,
      familyName: pfamilyName,
      email: pemail,
      userType: puserType, // Example of pre-filled user type
      newUser: false
    });
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "10px" }}>
      <button
        onClick={handleCreateUser}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Create User
      </button>

      <button
        onClick={handleEditUser}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Edit User
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={modalData} />
    </div>
  );
};

export default UserManageTest;



