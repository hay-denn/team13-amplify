import { useState } from "react";
import Modal, { ViewOrgModal, ViewAsDriverModal } from "./Modal";

interface Driver {
  DriverEmail: string;
  DriverFName: string;
  DriverLName: string;
  DriverSponsor: string;
  DriverPoints: string;
}

interface Sponsor {
  UserEmail: string;
  UserFName: string;
  UserLName: string;
  UserOrganization: string;
}

interface Admin {
  AdminEmail: string;
  AdminFName: string;
  AdminLName: string;
}

interface Props {
  driverTable: Driver[];
  sponsorTable?: Sponsor[];
  adminTable?: Admin[];
  isSponsor?: boolean;
}

export const ListOfUsersTable = ({
  driverTable,
  sponsorTable = [],
  adminTable = [],
  isSponsor = false,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    firstName: string;
    familyName: string;
    email: string;
    userType: string;
    newUser: boolean;
  }>();
  const [isViewOrgModalOpen, setIsViewOrgModalOpen] = useState<boolean>(false);
  const [viewOrgEmail, setViewOrgEmail] = useState<string>("");

  // 😎 NEW CODE - State for "View As Driver" modal
  const [isViewAsDriverModalOpen, setIsViewAsDriverModalOpen] = useState<boolean>(false);

  const handleEditUser = (
    pfirstName: string,
    pfamilyName: string,
    pemail: string,
    puserType: string
  ) => {
    setModalData({
      firstName: pfirstName,
      familyName: pfamilyName,
      email: pemail,
      userType: puserType,
      newUser: false,
    });
    setIsModalOpen(true);
  };

  const handleViewOrg = (pemail: string) => {
    setViewOrgEmail(pemail);
    setIsViewOrgModalOpen(true);
  };

  // 😎 NEW CODE - Handlers for opening/closing "View As Driver" modal
  const handleOpenViewAsDriverModal = () => {
    setIsViewAsDriverModalOpen(true);
  };
  const handleCloseViewAsDriverModal = () => {
    setIsViewAsDriverModalOpen(false);
  };

  return (
    <div>
      <table className="table table-striped table-bordered table-hover align-middle">
        <thead className="table-secondary">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Type</th>
            <th scope="col">First</th>
            <th scope="col">Last</th>
            <th scope="col">Email</th>
            {!isSponsor && <th scope="col">Organization</th>}
            {!isSponsor && <th scope="col">Edit</th>}
            {/* 😎 NEW CODE - Always show "Actions" column */}
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {driverTable.map((driver, index) => (
            <tr key={`driver-${index}`}>
              <th scope="row">{index + 1}</th>
              <td>Driver</td>
              <td>{driver.DriverFName}</td>
              <td>{driver.DriverLName}</td>
              <td>{driver.DriverEmail}</td>
              {!isSponsor && (
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewOrg(driver.DriverEmail)}
                  >
                    View
                  </button>
                </td>
              )}
              {!isSponsor && (
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      handleEditUser(
                        driver.DriverFName,
                        driver.DriverLName,
                        driver.DriverEmail,
                        "Driver"
                      )
                    }
                  >
                    Edit
                  </button>
                </td>
              )}
              {/* 😎 NEW CODE - Actions column button */}
              <td>
                <button
                  className="btn btn-primary"
                  onClick={handleOpenViewAsDriverModal}
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}

          {sponsorTable.map((sponsor, index) => (
            <tr key={`sponsor-${index}`}>
              <th scope="row">{driverTable.length + index + 1}</th>
              <td>Sponsor</td>
              <td>{sponsor.UserFName}</td>
              <td>{sponsor.UserLName}</td>
              <td>{sponsor.UserEmail}</td>
              {!isSponsor && <td>{sponsor.UserOrganization || "N / A"}</td>}
              {!isSponsor && (
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      handleEditUser(
                        sponsor.UserFName,
                        sponsor.UserLName,
                        sponsor.UserEmail,
                        "Sponsor"
                      )
                    }
                  >
                    Edit
                  </button>
                </td>
              )}
              {/* 😎 NEW CODE - Actions column button */}
              <td>
                <button
                  className="btn btn-primary"
                  onClick={handleOpenViewAsDriverModal}
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}

          {adminTable.map((admin, index) => (
            <tr key={`admin-${index}`}>
              <th scope="row">
                {driverTable.length + sponsorTable.length + index + 1}
              </th>
              <td>Admin</td>
              <td>{admin.AdminFName}</td>
              <td>{admin.AdminLName}</td>
              <td>{admin.AdminEmail}</td>
              {!isSponsor && <td>Administrator</td>}
              {!isSponsor && (
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      handleEditUser(
                        admin.AdminFName,
                        admin.AdminLName,
                        admin.AdminEmail,
                        "Admin"
                      )
                    }
                  >
                    Edit
                  </button>
                </td>
              )}
              {/* 😎 NEW CODE - Actions column button */}
              <td>
                <button
                  className="btn btn-primary"
                  onClick={handleOpenViewAsDriverModal}
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={modalData}
      />
      <ViewOrgModal
        isOpen={isViewOrgModalOpen}
        onClose={() => setIsViewOrgModalOpen(false)}
        email={viewOrgEmail}
      />
      {/* 😎 NEW CODE - "View As Driver" modal */}
      <ViewAsDriverModal
        isOpen={isViewAsDriverModalOpen}
        onClose={handleCloseViewAsDriverModal}
      />
    </div>
  );
};
