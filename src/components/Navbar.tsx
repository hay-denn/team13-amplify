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
}

const getNavbarMenu = (userType: string, companyName?: string) => {
  switch (userType) {
    case "Admin":
      return MenuAdmin;
    case "Sponsor":
      return MenuInfoSponsor;
    case "Driver":
      return companyName ? MenuInfoSponsoredDriver : MenuInfoNewUser;
    default:
      return MenuInfoGuest;
  }
};

export const Navbar = ({ companyName, userType }: Props) => {
  const menuItems = getNavbarMenu(userType, companyName);

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