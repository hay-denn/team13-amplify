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

    <div className="footer-content-driver">
        <p>© {new Date().getFullYear()} Money Miles</p>
        <p>
          <a href="/privacy" className="footer-link">Privacy Policy</a> |{" "}
          <a href="/terms" className="footer-link">Terms of Service</a> |{" "}
					<a href="/blog" className="footer-link">Blog</a> |{" "}
					<a href="/careers" className="footer-link">Careers</a> |{" "}
					<a href="/contact" className="footer-link">Contact Us</a> |{" "}
					<a href="/faq" className="footer-link">FAQ</a> |{" "}
					<a href="/updates" className="footer-link">Updates</a>
				
        </p>
      </div>

    </div>

  );
}
