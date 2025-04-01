import React from "react";
import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
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
    </footer>
  );
};
