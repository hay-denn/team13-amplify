import { useAuth } from "react-oidc-context";
import { signOutRedirect } from "../main";
import "./Navbarstyle.css"; //stylesheet


export const LoginButton = () => {
    const auth = useAuth();
    if (auth.isAuthenticated) {
        return (          
            <li className = "nav-links"><i className = "fa-solid" onClick={() => signOutRedirect()}>Sign out</i></li>
            );
    } else {
        return (          
            <li className = "nav-links"><i className = "fa-solid" onClick={() => auth.signinRedirect()}>Sign in</i></li>
        );
    }
}

  
