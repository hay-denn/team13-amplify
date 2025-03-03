interface Application {
  ApplicationID: any;
  ApplicationDriver: string;
  ApplicationOrganization: any;
  ApplicationSponsorUser: string;
  ApplicationStatus: string;
  ApplicationDateSubmitted: string;
}

interface Props {
  applicationTable: Application[];
}

export const ApplicationTable = ({ applicationTable }: Props) => {
  return (
    <div>
      <table className="table table-striped table-bordered table-hover align-middle">
        <thead className="table-secondary">
          <tr>
            <th scope="col">Applicaiton ID</th>
            <th scope="col">Driver</th>
            <th scope="col">Organization</th>
            <th scope="col">Sponsor User</th>
            <th scope="col">Status</th>
            <th scope="col">Date Submitted</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {applicationTable.map((app, index) => (
            <tr key={`app-${index}`}>
              <td>{app.ApplicationID}</td>
              <td>{app.ApplicationDriver}</td>
              <td>{app.ApplicationOrganization}</td>
              <td>{app.ApplicationSponsorUser}</td>
              <td>{app.ApplicationStatus}</td>
              <td>{app.ApplicationDateSubmitted}</td>
              <td>
                <button className="btn btn-primary">Actions</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
