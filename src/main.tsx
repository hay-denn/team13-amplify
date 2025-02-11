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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
);
  