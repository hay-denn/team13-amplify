import { useAuth } from "react-oidc-context";
import "./DriverHomeStyles.css";

export default function Home() {
  const auth = useAuth();

  return (
    <div className="home-container">
      <video
        className="background-video"
        src="https://d2elzyqybwozyp.cloudfront.net/cardriving.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

    <div className="overlay-content">
      <h1>Welcome to MoneyMiles</h1>
      <p className="hero-subtitle">Earn rewards. Drive with purpose.</p>
      <a
        href="#"
        className="auth-bubble"
        onClick={(e) => {
          e.preventDefault();
          auth.signinRedirect();
        }}
      >
        Create your account
      </a>
    </div>

    </div>
  );
}
