import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Amplify } from "aws-amplify"

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_ozv1hgsCU",
      userPoolClientId: "5vomi229uc90401rs234b93dke",
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
