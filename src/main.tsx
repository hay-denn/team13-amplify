import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from "react-oidc-context";
import { Amplify } from 'aws-amplify';

const deployment = "sprint-6";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_uN566DiPO",
  client_id: "3dqm8u7ca6uul82i7c1i4elolh",
  client_secret: "2kgslpdmdnia6mffkqrc47furuiv6e3hhe15fidvn4tmodcavu5",
  redirect_uri: `https://${deployment}.d1zgxgaa1s4k42.amplifyapp.com/`,
  response_type: "code",
  scope: "email openid phone profile aws.cognito.signin.user.admin",
  storage: window.localStorage
};

export const signOutRedirect = () => {
  const clientId = "3dqm8u7ca6uul82i7c1i4elolh";
  const logoutUri = `https://${deployment}.d1zgxgaa1s4k42.amplifyapp.com/`;
  const cognitoDomain = "https://us-east-1un566dipo.auth.us-east-1.amazoncognito.com";
  
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
      userPoolId: "us-east-1_uN566DiPO",
      userPoolClientId: "3dqm8u7ca6uul82i7c1i4elolh",
      identityPoolId: "us-east-1:0dafd320-f7c2-4dab-8d6b-b04edc0fba9e",
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