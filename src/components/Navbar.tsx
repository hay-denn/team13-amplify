import { Link } from "react-router-dom";
import { LoginButton } from "./LoginButton";
import {
  MenuInfoSponsoredDriver,
  MenuInfoSponsor,
  MenuInfoNewUser,
  MenuAdmin,
  MenuInfoGuest,
} from "./Menu";
import "./Navbarstyle.css";

interface Props {
  companyName?: string;
  userType: string;
  userFName?: string;
  userEmail: string;
}

const getNavbarMenu = (userType: string, numOrgs: number) => {
  switch (userType) {
    case "Admin":
      return MenuAdmin;
    case "Sponsor":
      return MenuInfoSponsor;
    case "Driver":
      if (numOrgs > 0) {
        return MenuInfoSponsoredDriver
      } else return MenuInfoNewUser;
    default:
      return MenuInfoGuest;
  }
};

export const Navbar = async ({ userType, userEmail }: Props) => {

  const getDriverSponsorCount = async () => {
    if (userType === "Driver") {
      try {
        const driverRelationshipURL = "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";
        const response = await fetch(`${driverRelationshipURL}/driverssponsors_count?DriversEmail=${encodeURIComponent(userEmail)}`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        const sponsorCount =  parseFloat(data['SponsorCount']);
        return isNaN(sponsorCount) ? 0 : sponsorCount;
      } catch (error) {
        console.error("Error getting the driver's relationships:", error);
        return 0;
      }
    } else return 0;
  };

  const numOrgs = await getDriverSponsorCount();
  const menuItems = getNavbarMenu(userType, numOrgs);

  return (
    <>
      <nav className="Topbar">
        <div className="topbar-left">
          <Link to="/about" className="topbar-link">About Us</Link>
        </div>
        <div className="topbar-center">
          <span className="topbar-tagline">Unlock exclusive perks from top-rated sponsors</span>
        </div>
        <div className="topbar-right">
        <button className="topbar-button">
          🇺🇸 EN
        </button>
          <LoginButton />
        </div>
      </nav>

      <nav className="NavbarItems">
        <div className="nav-left" />

        <Link to="/" className="site-name">MoneyMiles</Link>

        <div className="nav-right">
          <div className="nav-dropdown">
            <button className="dropdown-toggle">
              <i className="fa-solid fa-bars fa-lg"></i>
            </button>
            <ul className="dropdown-menu">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.url} className={item.cName}>
                    <i className={item.icon}></i> {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};