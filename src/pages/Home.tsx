import { useAuth } from "react-oidc-context"; 

export default function Home() {
  const auth = useAuth();

  return (
    <div>
      <h1>Welcome to Drive Rewards!</h1>

      {/* Displays the welcome text with a button to sign up */}
      <p>
        <a href="#" className="auth-link" onClick={(e) => { 
          e.preventDefault();
          auth.signinRedirect({ extraQueryParams: { prompt: "signup" } });
        }}>
          Create your account
        </a> 
        &nbsp;to unlock exclusive perks from top-rated sponsors.
      </p>
    </div>
  );
}