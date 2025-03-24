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
    <nav className="NavbarItems">
      <h1 className="logo">
        {companyName ||
          (userType === "Admin" ? "Admin Panel" : "Become Sponsored Today!")}
        {companyName && <i className="fa-brands fa-amazon"></i>}
      </h1>

      <div className="nav-dropdown-wrapper" style={{ marginLeft: "auto" }}>
        <div className="nav-dropdown">
          <button className="dropdown-toggle">Menu</button>
          <ul className="dropdown-menu">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link to={item.url} className={item.cName}>
                  <i className={item.icon}></i> {item.title}
                </Link>
              </li>
            ))}
            <li>
              <LoginButton />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
