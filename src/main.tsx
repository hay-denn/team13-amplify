import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

//Cognito imports
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ozv1hgsCU",
  client_id: "5vomi229uc90401rs234b93dke",
  redirect_uri: "https://main.d1zgxgaa1s4k42.amplifyapp.com",
  response_type: "code",
  scope: "email openid phone",
};


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
)
