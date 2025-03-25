import { AuthContext, useAuth } from "react-oidc-context";
import { signOutRedirect } from "../main";
import "./Navbarstyle.css";
import { useContext } from "react";
import { Link } from "react-router-dom";

export const LoginButton = () => {
	const auth = useAuth();
	const authContext = useContext(AuthContext);

	const handleLogout = async () => {
	try {
		await authContext?.removeUser();
		signOutRedirect();
		console.log("User removed from session");
	} catch (error) {
		console.error("Error removing user from session", error);
	}
	};

	return auth.isAuthenticated ? (
	<Link
		to="#"
		onClick={(e) => {
			e.preventDefault();
			handleLogout();
		}}
		className="nav-links"
	>
		Sign Out
	</Link>
	) : (
	<Link
		to="#"
		onClick={(e) => {
			e.preventDefault();
			auth.signinRedirect();
		}}
		className="nav-links"
	>
		Sign In
	</Link>
	);
};
