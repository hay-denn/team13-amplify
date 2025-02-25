import { Link } from "react-router-dom";

const APINavbar = () => {
  return (
    <nav className="bg-gray-800 text-white py-2 px-4 shadow-md fixed top-0 w-full z-50">
      <div className="flex overflow-x-auto whitespace-nowrap items-center px-2 space-x-6">
        <Link to="/api_dashboard" className="hover:text-gray-300 text-sm inline-block">Home</Link> |
        <Link to="/api/admins" className="hover:text-gray-300 text-sm inline-block">Admins</Link> |
        <Link to="/api/drivers" className="hover:text-gray-300 text-sm inline-block">Drivers</Link> |
        <Link to="/api/sponsors" className="hover:text-gray-300 text-sm inline-block">Sponsors</Link> |
        <Link to="/api/applications" className="hover:text-gray-300 text-sm inline-block">Applications</Link> |
        <Link to="/api/sponsororganizations" className="hover:text-gray-300 text-sm inline-block">Sponsor Orgs</Link> |
        <Link to="/api/purchases" className="hover:text-gray-300 text-sm inline-block">Purchases</Link> |
        <Link to="/" className="hover:text-gray-300 text-sm inline-block">Main Site</Link>
      </div>
    </nav>
  );
};

export default APINavbar;
