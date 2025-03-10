interface Organization {
  OrganizationID: string;
  OrganizationName: string;
}

interface Props {
  orgTable: Organization[];
}

export const ListOfSponsorOrganizations = ({ orgTable }: Props) => {
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
          {orgTable.map((org, index) => (
            <tr key={`driver-${index}`}>
              <th scope="row">{index + 1}</th>
              <td>{org.OrganizationID}</td>
              <td>{org.OrganizationName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={modalData}
      /> */}
    </div>
  );
};
