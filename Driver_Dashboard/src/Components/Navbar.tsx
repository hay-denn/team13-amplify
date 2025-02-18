import { MenuInfoSponsoredUser, MenuInfoNewUser } from "./Menu";
import "./Navbarstyle.css"; //stylesheet
import { useState } from "react";

interface Props {
  companyName?: string;
  userFName?: string;
}

export const Navbar = ({ companyName }: Props) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
  };
  return (
    <>
      <nav className="NavbarItems">
        {companyName ? (
          <h1 className="logo">
            {companyName}
            <i className="fa-brands fa-amazon"></i>
          </h1>
        ) : (
          <h1 className="logo">Become Sponsored Today!</h1>
        )}
        <div className="menu-icons" onClick={handleClick}>
          <i className={clicked ? "fas fa-times" : "fas fa-bars"}></i>
        </div>
        <ul className={clicked ? "nav-menu active" : "nav-menu"}>
          {companyName
            ? MenuInfoSponsoredUser.map((item, index) => (
                <li key={index}>
                  <a href={item.url} className={item.cName}>
                    <i className={item.icon}>{item.title}</i>
                  </a>
                </li>
              ))
            : MenuInfoNewUser.map((item, index) => (
                <li key={index}>
                  <a href={item.url} className={item.cName}>
                    <i className={item.icon}>{item.title}</i>
                  </a>
                </li>
              ))}
        </ul>
      </nav>
    </>
  );
};
