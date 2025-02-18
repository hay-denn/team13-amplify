import { AuthContext, useAuth } from "react-oidc-context";
import { signOutRedirect } from "../main";
import "./Navbarstyle.css"; //stylesheet
import { useContext } from "react";


export const LoginButton = () => {
    const auth = useAuth();
    const authContext = useContext(AuthContext);

    const handleLogout = async () => {
        try {
        await authContext?.removeUser();
        signOutRedirect();
        console.log('User removed from session');
        } catch (error) {
        console.error('Error removing user from session', error);
        }
    };

    if (auth.isAuthenticated) {
        return (          
            <li className = "nav-links"><i className = "fa-solid" onClick={() => handleLogout()}>Sign out</i></li>
            );
    } else {
        return (          
            <li className = "nav-links"><i className = "fa-solid" onClick={() => auth.signinRedirect()}>Sign in</i></li>
        );
    }
}

  
