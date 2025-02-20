import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from "react-oidc-context";
import { Amplify } from 'aws-amplify';

const deployment = "sprint-4";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_jnOjoFtl2",
  client_id: "r7oq53d98cg6a8l4cj6o8l7tm",
  client_secret: "g2os3g88a51u4fltin70j228m18d8l63a3349gmi8ga88j6jf04",
  redirect_uri: `https://${deployment}.d1zgxgaa1s4k42.amplifyapp.com/`,
  response_type: "code",
  scope: "email openid phone aws.cognito.signin.user.admin",
  storage: window.localStorage
};

export const signOutRedirect = () => {
  const clientId = "r7oq53d98cg6a8l4cj6o8l7tm";
  const logoutUri = `https://${deployment}.d1zgxgaa1s4k42.amplifyapp.com/`;
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

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_jnOjoFtl2",
      userPoolClientId: "r7oq53d98cg6a8l4cj6o8l7tm",
      identityPoolId: "us-east-1:98af04f7-0a31-4366-b06a-cfeb190f64a3",
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
})