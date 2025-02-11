import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Cognito imports
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_jnOjoFtl2",
  client_id: "r7oq53d98cg6a8l4cj6o8l7tm",
  client_secret: "g2os3g88a51u4fltin70j228m18d8l63a3349gmi8ga88j6jf04",
  redirect_uri: "https://main.d1zgxgaa1s4k42.amplifyapp.com/",
  response_type: "code",
  scope: "email openid phone",
  storage: window.localStorage
};

export const signUpRedirect = () => {
  const cognitoDomain = "https://us-east-1jnojoftl2.auth.us-east-1.amazoncognito.com";
  const clientId = "r7oq53d98cg6a8l4cj6o8l7tm";
  const redirectUri = "https://main.d1zgxgaa1s4k42.amplifyapp.com/";

  const state = encodeURIComponent(btoa(JSON.stringify({ redirect: "dashboard" })));

  window.location.href = `${cognitoDomain}/signup?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
};

export const signOutRedirect = () => {
  const clientId = "r7oq53d98cg6a8l4cj6o8l7tm";
  const logoutUri = "https://main.d1zgxgaa1s4k42.amplifyapp.com/";
  const cognitoDomain = "https://us-east-1jnojoftl2.auth.us-east-1.amazoncognito.com";
  
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
);
  