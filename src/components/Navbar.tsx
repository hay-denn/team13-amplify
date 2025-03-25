import { Link } from "react-router-dom";
import { LoginButton } from "./LoginButton";
import {
  MenuInfoSponsoredDriver,
  MenuInfoSponsor,
  MenuAdmin,
  MenuInfoGuest,
} from "./Menu";
import "./Navbarstyle.css";

interface Props {
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
        return MenuInfoSponsoredDriver;
      } else return MenuInfoNewUser;
    default:
      return MenuInfoGuest;
  }
};

export const Navbar = ({ userType }: Props) => {
  const numOrgs = 1;
  const menuItems = getNavbarMenu(userType, numOrgs);

  return (
    <>
      <nav className="Topbar">
        <div className="topbar-left">
          <Link to="/about" className="topbar-link">
            About Us
          </Link>
        </div>
        <div className="topbar-center">
          <span className="topbar-tagline">
            Unlock exclusive perks from top-rated sponsors
          </span>
        </div>
        <div className="topbar-right">
          <button className="topbar-button">🇺🇸 EN</button>
          <LoginButton />
        </div>
      </nav>

      <nav className="NavbarItems">
        <div className="nav-left" />

        <Link to="/" className="site-name">
          MoneyMiles
        </Link>

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
