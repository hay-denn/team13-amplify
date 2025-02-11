import { useAuth } from "react-oidc-context";

const signOutRedirect = () => {
    const clientId = "r7oq53d98cg6a8l4cj6o8l7tm";
    const logoutUri = "https://main.d1zgxgaa1s4k42.amplifyapp.com/";
    const cognitoDomain = "https://us-east-1jnojoftl2.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

export default function Driver() {
    const auth = useAuth();
    
    return (
        <div>
            <h1>Driver Page</h1>
            {auth.isAuthenticated ? (
                <button onClick={signOutRedirect}>Sign out</button>
            ) : (
                <button onClick={() => auth.signinRedirect()}>Sign in</button>
            )}
        </div>
    );
}