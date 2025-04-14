import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from "react-oidc-context";
import { Amplify } from 'aws-amplify';

console.log("Environment Variables:");
console.log("VITE_COGNITO_AUTHORITY:", import.meta.env.VITE_COGNITO_AUTHORITY);
console.log("VITE_CLIENT_ID:", import.meta.env.VITE_CLIENT_ID);
console.log("VITE_CLIENT_SECRET:", import.meta.env.VITE_CLIENT_SECRET);
console.log("VITE_REDIRECT_URI:", import.meta.env.VITE_REDIRECT_URI);
console.log("VITE_COGNITO_DOMAIN:", import.meta.env.VITE_COGNITO_DOMAIN);
console.log("VITE_IDENTITY_POOL_ID:", import.meta.env.VITE_IDENTITY_POOL_ID);
console.log("VITE_USER_POOL_ID:", import.meta.env.VITE_USER_POOL_ID);

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_CLIENT_ID,
  client_secret: import.meta.env.VITE_CLIENT_SECRET,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: "code",
  scope: "email openid phone profile aws.cognito.signin.user.admin",
  storage: window.localStorage
};

export const signOutRedirect = () => {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const logoutUri = import.meta.env.VITE_REDIRECT_URI;
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
  
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
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
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