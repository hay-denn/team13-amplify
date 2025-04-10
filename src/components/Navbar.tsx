import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { LoginButton } from "./LoginButton";
import {
  MenuInfoSponsoredDriver,
  MenuInfoSponsor,
  MenuAdmin,
  MenuInfoGuest,
  MenuInfoNewUser
} from "./Menu";
import "./Navbarstyle.css";
import { useCart } from "../pages/CartContext";

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
  const auth = useAuth();
  const numOrgs = 1;
  const menuItems = getNavbarMenu(userType, numOrgs);
  const { cart } = useCart();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  const handleReturnToSponsor = () => {
    localStorage.removeItem("impersonatingDriver");
    navigate("/");
  };

  // Only show the "Return to Sponsor View" button if impersonation is active
  const isImpersonating = 
    auth.isAuthenticated && 
    userType === "Sponsor" && 
    Boolean(localStorage.getItem("impersonatingDriver")) === true;

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
          {isImpersonating && (
            <button className="topbar-button" onClick={handleReturnToSponsor}>
              Return to Sponsor View
            </button>
          )}
          <LoginButton />
        </div>
      </nav>

      <nav className="NavbarItems">
        <div className="nav-left" />

        <Link to="/" className="site-name">
          MoneyMiles
        </Link>

        {userType === "Driver" || userType === "Sponsor" || userType === "Admin" ? (
          <Link to="/account" className="nav-account">
            <i className="fa-solid fa-user-gear fa-lg"></i>
          </Link>
        ) : null}
        
        {userType === "Driver" && (
          <div className="nav-right">
            <Link to="/cart" className="nav-cart">
              <i className="fa-solid fa-shopping-cart fa-lg"></i>
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </Link>
          </div>
        )}

        {userType === "Driver" && (
          <div className="nav-left">
            <Link to="/catalog" className="nav-catalog">
              <strong>Catalog</strong>
            </Link>
          </div>
        )}

        <div className="nav-right">
          <div className="nav-dropdown">
            <button className="dropdown-toggle">
              <i className="fa-solid fa-bars fa-lg dropdown-icon"></i>
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