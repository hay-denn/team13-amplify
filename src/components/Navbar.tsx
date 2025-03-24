import { LoginButton } from "./LoginButton";
import {
  MenuInfoSponsoredDriver,
  MenuInfoSponsor,
  MenuAdmin,
  MenuInfoGuest,
} from "./Menu";
import "./Navbarstyle.css"; //stylesheet
import { useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  userType: string;
  userFName?: string;
}

function getNavbarClass(userType: string) {
  if (userType === "Admin") {
    return MenuAdmin;
  } else if (userType === "Sponsor") {
    return MenuInfoSponsor;
  } else if (userType === "Driver") {
    return MenuInfoSponsoredDriver;
  } else {
    return MenuInfoGuest;
  }
}

export const Navbar = ({ userType }: Props) => {
  const [clicked, setClicked] = useState(false);

  const [menuItems] = useState(getNavbarClass(userType));

  const handleClick = () => {
    setClicked(!clicked);
  };
  return (
    <>
      <nav className="NavbarItems">
        <h1 className="logo">
          {userType === "Admin" ? "Admin Panel" : "Become Sponsored Today!"}
        </h1>
        <div className="menu-icons" onClick={handleClick}>
          <i className={clicked ? "fas fa-times" : "fas fa-bars"}></i>
        </div>
        <ul className={clicked ? "nav-menu active" : "nav-menu"}>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.url} className={item.cName}>
                <i className={item.icon}>{item.title}</i>
              </Link>
            </li>
          ))}
          <LoginButton />
        </ul>
      </nav>
    </>
  );
};
